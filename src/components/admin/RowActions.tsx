"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { moveItem, removeItem, setFeatured, setPublished } from "@/actions/admin/items";
import { ActionButton } from "./form";

type Publishable = "project" | "service" | "testimonial" | "teamMember";
type Featurable = "project" | "client";
type Removable = Publishable | "client";
type Orderable = Removable | "category";

export function MoveButtons({ model, id, name }: { model: Orderable; id: string; name: string }) {
  return (
    <>
      <ActionButton label={`Move ${name} up`} action={() => moveItem(model, id, "up")}>
        <ArrowUp aria-hidden className="size-4" />
      </ActionButton>
      <ActionButton label={`Move ${name} down`} action={() => moveItem(model, id, "down")}>
        <ArrowDown aria-hidden className="size-4" />
      </ActionButton>
    </>
  );
}

export function PublishButton({
  model,
  id,
  name,
  published,
}: {
  model: Publishable;
  id: string;
  name: string;
  published: boolean;
}) {
  return (
    <ActionButton
      label={`${published ? "Unpublish" : "Publish"} ${name}`}
      action={() => setPublished(model, id, !published)}
    >
      {published ? (
        <EyeOff aria-hidden className="size-4" />
      ) : (
        <Eye aria-hidden className="size-4" />
      )}
    </ActionButton>
  );
}

export function FeatureButton({
  model,
  id,
  name,
  featured,
}: {
  model: Featurable;
  id: string;
  name: string;
  featured: boolean;
}) {
  return (
    <ActionButton
      label={`${featured ? "Stop featuring" : "Feature"} ${name}`}
      action={() => setFeatured(model, id, !featured)}
    >
      {featured ? (
        <StarOff aria-hidden className="size-4" />
      ) : (
        <Star aria-hidden className="size-4" />
      )}
    </ActionButton>
  );
}

export function DeleteButton({ model, id, name }: { model: Removable; id: string; name: string }) {
  return (
    <ActionButton
      label={`Delete ${name}`}
      confirm={`Delete “${name}”? It will disappear from the website and this list.`}
      action={() => removeItem(model, id)}
    >
      <Trash2 aria-hidden className="size-4" />
    </ActionButton>
  );
}
