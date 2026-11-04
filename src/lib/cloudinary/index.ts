import "server-only";
import { v2 as cloudinary } from "cloudinary";

export const FOLDER = "umexa";
export const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
export const VIDEO_FORMATS = ["mp4", "webm", "mov"];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
}

/** The API secret stays on the server: browsers only ever receive a short-lived signature. */
export function getCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function signUpload(kind: "IMAGE" | "VIDEO") {
  const client = getCloudinary();
  const params = {
    timestamp: Math.round(Date.now() / 1000),
    folder: FOLDER,
    allowed_formats: (kind === "IMAGE" ? IMAGE_FORMATS : VIDEO_FORMATS).join(","),
  };
  return {
    ...params,
    signature: client.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!),
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    resourceType: kind === "IMAGE" ? "image" : "video",
    maxBytes: kind === "IMAGE" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES,
  };
}
