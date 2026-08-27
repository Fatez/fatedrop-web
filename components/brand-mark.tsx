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
        width="320"
        height="107"
        loading="eager"
        style={{
          display: "block",
          width: compact ? 118 : 154,
          height: "auto",
          objectFit: "contain",
        }}
      />
    </Link>
  );
}
