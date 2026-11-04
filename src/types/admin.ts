export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

export type PickerAsset = {
  id: string;
  url: string;
  kind: "IMAGE" | "VIDEO";
  alt: string;
  width: number | null;
  height: number | null;
};
