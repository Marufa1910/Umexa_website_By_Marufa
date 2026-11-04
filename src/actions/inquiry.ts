"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { recordAudit } from "@/lib/audit";
import { isRateLimited } from "@/lib/utils/rate-limit";
import { inquirySchema, NOT_SURE, type InquiryState, type InquiryValues } from "@/schemas/inquiry";

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MIN_FILL_TIME_MS = 3000;

export async function submitInquiry(
  _previous: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  try {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (await isRateLimited("inquiry", ip, MAX_SUBMISSIONS, WINDOW_MS)) {
      return { status: "rate_limited" };
    }

    // Spam traps. A bot gets the normal response, so it can't learn what gave it away.
    const honeypot = formData.get("website");
    const startedAt = Number(formData.get("startedAt"));
    const tooFast = startedAt > 0 && Date.now() - startedAt < MIN_FILL_TIME_MS;
    if (honeypot || tooFast) return { status: "saved" };

    const parsed = inquirySchema.safeParse({
      fullName: formData.get("fullName") ?? "",
      email: formData.get("email") ?? "",
      company: formData.get("company") ?? "",
      country: formData.get("country") ?? "",
      service: formData.get("service") ?? "",
      currency: formData.get("currency") ?? "",
      budget: formData.get("budget") ?? "",
      timeline: formData.get("timeline") ?? "",
      description: formData.get("description") ?? "",
      referenceUrl: formData.get("referenceUrl") ?? "",
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof InquiryValues, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof InquiryValues;
        fieldErrors[field] ??= issue.message;
      }
      return { status: "invalid", fieldErrors };
    }

    const { service: serviceSlug, company, referenceUrl, ...data } = parsed.data;

    let serviceId: string | null = null;
    if (serviceSlug !== NOT_SURE) {
      const service = await prisma.service.findFirst({
        where: { slug: serviceSlug, status: "PUBLISHED", deletedAt: null },
        select: { id: true },
      });
      if (!service) {
        return { status: "invalid", fieldErrors: { service: "Please choose a service." } };
      }
      serviceId = service.id;
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        ...data,
        serviceId,
        company: company || null,
        referenceUrl: referenceUrl || null,
      },
      select: { id: true },
    });
    await recordAudit({
      actorId: null,
      action: "inquiry.received",
      entity: "Inquiry",
      entityId: inquiry.id,
    });

    return { status: "saved" };
  } catch (error) {
    // Details stay in the server log; the visitor gets a plain message
    console.error("Inquiry could not be saved", error instanceof Error ? error.name : "unknown");
    return { status: "error" };
  }
}
