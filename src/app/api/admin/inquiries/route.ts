import { guardApi } from "@/lib/auth/session";
import { listInquiries } from "@/lib/data/admin";
import { inquiryFilterSchema } from "@/schemas/admin";

export async function GET(request: Request) {
  const { denied } = await guardApi(request, "inquiries.manage");
  if (denied) return denied;

  const params = new URL(request.url).searchParams;
  const filter = inquiryFilterSchema.safeParse({
    status: params.get("status") ?? undefined,
    search: params.get("search") ?? undefined,
  });
  if (!filter.success) return Response.json({ error: "Invalid filter" }, { status: 400 });

  return Response.json({ inquiries: await listInquiries(filter.data) });
}
