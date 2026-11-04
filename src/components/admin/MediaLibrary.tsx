"use client";

import { Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { deleteMedia, registerMedia, updateMediaAlt } from "@/actions/admin/media";
import { ActionButton, AdminForm, FormDialog, SubmitButton, TextField } from "./form";
import { useToast } from "./toast";
import { primaryButtonClass } from "./ui";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type Signature = {
  timestamp: number;
  folder: string;
  allowed_formats: string;
  signature: string;
  apiKey: string;
  cloudName: string;
  resourceType: string;
  maxBytes: number;
};

/**
 * Sends the file straight to Cloudinary with a signature from our server, so large videos never
 * pass through this site and the API secret never reaches the browser. These browser checks are
 * for quick feedback only: the signature and registerMedia enforce the rules.
 */
export function UploadButton() {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const upload = async (file: File) => {
    const kind = IMAGE_TYPES.includes(file.type)
      ? "IMAGE"
      : VIDEO_TYPES.includes(file.type)
        ? "VIDEO"
        : null;
    if (!kind) {
      toast("Use a JPG, PNG, WebP, AVIF or GIF image, or an MP4, WebM or MOV video.", false);
      return;
    }

    const response = await fetch("/api/admin/media/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    if (!response.ok) {
      toast("Uploads aren't available right now.", false);
      return;
    }
    const signed: Signature = await response.json();
    if (file.size > signed.maxBytes) {
      toast(`That file is too large. The limit is ${signed.maxBytes / 1024 / 1024} MB.`, false);
      return;
    }

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", signed.apiKey);
    body.append("timestamp", String(signed.timestamp));
    body.append("folder", signed.folder);
    body.append("allowed_formats", signed.allowed_formats);
    body.append("signature", signed.signature);

    setProgress(0);
    // XMLHttpRequest because fetch can't report upload progress
    const publicId = await new Promise<string | null>((resolve) => {
      const request = new XMLHttpRequest();
      request.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/${signed.resourceType}/upload`,
      );
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
      };
      request.onload = () => {
        if (request.status >= 300) return resolve(null);
        try {
          resolve(JSON.parse(request.responseText).public_id);
        } catch {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
      request.send(body);
    });
    setProgress(null);

    if (!publicId) {
      toast("The upload failed. Nothing was added.", false);
      return;
    }
    const result = await registerMedia({ publicId, kind, alt: "" });
    toast(result.message ?? "Uploaded.", result.ok);
  };

  const onChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await upload(file);
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        aria-label="Choose a file to upload"
        accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
        onChange={onChange}
        className="sr-only"
      />
      <button
        type="button"
        disabled={progress !== null}
        onClick={() => input.current?.click()}
        className={primaryButtonClass}
      >
        <Upload aria-hidden className="size-4" />
        {progress === null ? "Upload" : `Uploading ${progress}%`}
      </button>
    </>
  );
}

export function MediaCardActions({ id, name, alt }: { id: string; name: string; alt: string }) {
  return (
    <div className="flex gap-1">
      <FormDialog
        title="Describe this file"
        trigger={<Pencil aria-label={`Edit description of ${name}`} className="size-4" />}
      >
        <AdminForm action={updateMediaAlt.bind(null, id)}>
          <TextField
            name="alt"
            label="Description"
            hint="Used as alt text, for people who can't see the image."
            defaultValue={alt}
          />
          <SubmitButton />
        </AdminForm>
      </FormDialog>
      <ActionButton
        label={`Delete ${name}`}
        confirm="Delete this file? This also removes it from Cloudinary."
        action={() => deleteMedia(id)}
      >
        <Trash2 aria-hidden className="size-4" />
      </ActionButton>
    </div>
  );
}
