/** Numbered section label, styled like a slate on an edit timeline. */
export function SectionSlate({ index, label }: { index: string; label: string }) {
  return (
    <p className="slate flex items-center gap-3 text-muted">
      <span className="text-lime">{index}</span>
      <span aria-hidden className="h-px w-6 bg-line" />
      {label}
    </p>
  );
}
