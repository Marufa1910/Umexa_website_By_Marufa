/** Numbered section label, styled like a slate on an edit timeline. */
export function SectionSlate({
  index,
  label,
  as: Tag = "p",
}: {
  index: string;
  label: string;
  /** Use h2 when this is the only title a section has */
  as?: "p" | "h2";
}) {
  return (
    <Tag className="slate flex items-center gap-3 font-medium text-muted">
      <span className="text-accent">{index}</span>
      <span aria-hidden className="h-px w-6 bg-line" />
      {label}
    </Tag>
  );
}
