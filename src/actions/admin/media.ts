"use server";

import { refresh } from "next/cache";
import { attempt, runForm, AdminError } from "@/lib/admin/action";
import { recordAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/session";
import {
  FOLDER,
  getCloudinary,
  IMAGE_FORMATS,
  isCloudinaryConfigured,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  VIDEO_FORMATS,
} from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { mediaAltSchema, mediaRegisterSchema } from "@/schemas/admin";
import type { ActionState } from "@/types/admin";

/**
 * Called after the browser uploads straight to Cloudinary. The file's details are read back from
 * Cloudinary rather than trusted from the browser, and anything out of bounds is removed there.
 */
export async function registerMedia(input: unknown): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    if (!isCloudinaryConfigured()) throw new AdminError("Media uploads aren't set up yet.");

    const parsed = mediaRegisterSchema.safeParse(input);
    if (!parsed.success) throw new AdminError("That upload couldn't be read.");
    const { publicId, kind, alt } = parsed.data;
    if (!publicId.startsWith(`${FOLDER}/`)) throw new AdminError("That upload isn't allowed.");

    const client = getCloudinary();
    const resourceType = kind === "IMAGE" ? "image" : "video";
    const file = await client.api.resource(publicId, { resource_type: resourceType });

    const allowed = kind === "IMAGE" ? IMAGE_FORMATS : VIDEO_FORMATS;
    const maxBytes = kind === "IMAGE" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (!allowed.includes(file.format) || file.bytes > maxBytes) {
      await client.uploader.destroy(publicId, { resource_type: resourceType });
      throw new AdminError("That file's type or size isn't allowed, so it was removed.");
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        publicId,
        url: file.secure_url,
        kind,
        format: file.format,
        bytes: file.bytes,
        width: file.width ?? null,
        height: file.height ?? null,
        alt,
        uploadedById: user.id,
      },
    });
    await recordAudit({
      actorId: user.id,
      action: "media.uploaded",
      entity: "media",
      entityId: asset.id,
    });
    refresh();
    return "Uploaded.";
  });
}

export async function updateMediaAlt(
  id: string,
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runForm("content.manage", mediaAltSchema, formData, async ({ alt }, user) => {
    await prisma.mediaAsset.update({ where: { id }, data: { alt } });
    await recordAudit({ actorId: user.id, action: "media.updated", entity: "media", entityId: id });
    refresh();
    return "Description saved.";
  });
}

/** Refuses while the file is in use, so deleting can't leave a broken image on the site. */
export async function deleteMedia(id: string): Promise<ActionState> {
  const user = await requirePermission("content.manage");
  return attempt(async () => {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) throw new AdminError("That file no longer exists.");

    const { url } = asset;
    const uses = await Promise.all([
      prisma.project.count({
        where: { deletedAt: null, OR: [{ coverUrl: url }, { videoUrl: url }] },
      }),
      prisma.projectMedia.count({ where: { OR: [{ url }, { posterUrl: url }] } }),
      prisma.service.count({ where: { deletedAt: null, previewUrl: url } }),
      prisma.client.count({ where: { deletedAt: null, logoUrl: url } }),
      prisma.testimonial.count({ where: { deletedAt: null, photoUrl: url } }),
      prisma.teamMember.count({ where: { deletedAt: null, photoUrl: url } }),
      prisma.siteSetting.count({
        where: { OR: [{ logoUrl: url }, { showreelUrl: url }, { showreelPoster: url }] },
      }),
    ]);
    if (uses.some((count) => count > 0)) {
      throw new AdminError("That file is in use on the site. Replace it there first.");
    }

    if (isCloudinaryConfigured()) {
      await getCloudinary().uploader.destroy(asset.publicId, {
        resource_type: asset.kind === "IMAGE" ? "image" : "video",
      });
    }
    await prisma.mediaAsset.delete({ where: { id } });
    await recordAudit({ actorId: user.id, action: "media.deleted", entity: "media", entityId: id });
    refresh();
    return "File deleted.";
  });
}
