/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const FATEDROP_WORDMARK = "/assets/fatedrop-wordmark.png";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link className="brand-mark" href="/" aria-label="FateDrop home">
      <img
        src={FATEDROP_WORDMARK}
        alt=""
        aria-hidden="true"
        width="192"
        height="192"
        loading="eager"
        style={{
          display: "block",
          width: "auto",
          height: compact ? 44 : 52,
          objectFit: "contain",
        }}
      />
    </Link>
  );
}
