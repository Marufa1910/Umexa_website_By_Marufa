import Image from "next/image";
import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-semibold tracking-[-0.05em] ${className}`}>
      Move<span className="text-lime">x</span>a
    </span>
  );
}

type LogoProps = { onClick?: () => void; logoUrl?: string | null };

export function Logo({ onClick, logoUrl }: LogoProps) {
  return (
    <Link href="/" aria-label="Movexa home" onClick={onClick} className="text-2xl leading-none">
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
