import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "lime" | "ink" | "ghost";

const variants: Record<Variant, string> = {
  lime: "bg-signal text-canvas hover:bg-fg",
  ink: "bg-canvas text-fg hover:bg-surface-2",
  ghost: "border border-fg/50 text-fg hover:border-fg",
};

type ButtonProps = ComponentProps<typeof Link> & { variant?: Variant };

export function Button({ variant = "lime", className = "", children, ...props }: ButtonProps) {
  return (
    <Link
      className={`group inline-flex min-h-13 items-center justify-between gap-6 px-5 text-sm font-medium transition-colors duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      <ArrowUpRight
        aria-hidden
        className="size-4 transition-transform duration-500 ease-studio group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
