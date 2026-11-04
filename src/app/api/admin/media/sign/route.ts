import { z } from "zod";
import { guardApi } from "@/lib/auth/session";
import { isCloudinaryConfigured, signUpload } from "@/lib/cloudinary";

const bodySchema = z.object({ kind: z.enum(["IMAGE", "VIDEO"]) }).strict();

export async function POST(request: Request) {
  const { denied } = await guardApi(request, "content.manage");
  if (denied) return denied;

  if (!isCloudinaryConfigured()) {
    return Response.json({ error: "Media uploads aren't set up yet" }, { status: 503 });
  }
  const body = bodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Invalid request" }, { status: 400 });

  return Response.json(signUpload(body.data.kind));
}
