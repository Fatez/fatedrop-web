/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand-mark" href="/" aria-label="FateDrop home">
      <span className="brand-logo-image" aria-hidden="true">
        <img src="/assets/app-home.jpeg" alt="" width="708" height="1536" loading="eager" />
      </span>
      <span className="brand-word"><b>Fate</b>{compact ? null : <em>Drop</em>}</span>
    </Link>
  );
}
