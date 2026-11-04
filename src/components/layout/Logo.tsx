import Image from "next/image";
import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-[-0.04em] ${className}`}>
      UME<span className="text-signal">X</span>A
    </span>
  );
}

type LogoProps = { onClick?: () => void; logoUrl?: string | null };

export function Logo({ onClick, logoUrl }: LogoProps) {
  return (
    <Link href="/" aria-label="UMEXA home" onClick={onClick} className="text-2xl leading-none">
      {logoUrl ? (
        <span className="relative block h-8 w-32">
          <Image src={logoUrl} alt="" fill sizes="128px" className="object-contain object-left" />
        </span>
      ) : (
        <Wordmark />
      )}
    </Link>
  );
}
