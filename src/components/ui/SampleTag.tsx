/** Marks placeholder content, so samples can never be mistaken for real work or clients. */
export function SampleTag({
  children = "Sample",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`slate inline-block bg-canvas/85 px-2 py-1 text-fg ${className}`}>
      {children}
    </span>
  );
}
