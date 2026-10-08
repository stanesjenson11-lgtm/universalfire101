import { useId } from "react";
import { EMBLEM as K, emblemPaths as P } from "@/lib/mark";

/* The centre of the gear, around which the simplified mark is enlarged. */
const GROW = "translate(100 102) scale(1.42) translate(-100 -102)";

/**
 * The emblem, inline so its lettering uses the page's type.
 *  - "full": as on the old logo — ring lettering, gear, wheel, "FIRE".
 *  - "mark": for small sizes (the nav): no lettering, the gear enlarged, the
 *    ring drawn in the current text colour so it reads on black and on white.
 *  - "mono": solid white on black, the preloader's fill (Kickstart's mark
 *    fills in plain white under its outline, never in colour).
 */
export default function Emblem({
  className = "",
  title,
  variant = "full",
}: {
  className?: string;
  title?: string;
  variant?: "full" | "mark" | "mono";
}) {
  const arc = useId();
  const a11y = title ? { role: "img" as const } : { "aria-hidden": true as const };

  if (variant === "mark")
    return (
      <svg viewBox="0 0 200 200" className={className} {...a11y}>
        {title && <title>{title}</title>}
        <circle cx="100" cy="100" r="93" fill="#fff" stroke="currentColor" strokeWidth="9" />
        <path d={P.band} fill={K.grey} />
        <path d={P.arrows} fill={K.arrow} transform={GROW} />
        <path d={P.gear} fill={K.gear} transform={GROW} />
        <circle cx="100" cy="102" r="34" fill="#fff" stroke={K.navy} strokeWidth="6" />
        <path d={P.spokes} stroke={K.spoke} strokeWidth="2.6" strokeLinecap="round" transform={GROW} />
        <path d={P.flame} fill={K.red} transform={GROW} />
      </svg>
    );

  if (variant === "mono")
    return (
      <svg viewBox="0 0 200 200" className={className} {...a11y}>
        <circle cx="100" cy="100" r="94" fill="none" stroke="#fff" strokeWidth="6" />
        <path d={P.band} fill="none" stroke="#fff" strokeWidth="1.6" />
        <path id={arc} d={P.textArc} fill="none" />
        <text fill="#fff" fontFamily="var(--font-display)" fontWeight="900" fontSize="31" letterSpacing="2">
          <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
            UNIVERSAL
          </textPath>
        </text>
        <path d={P.arrows} fill="#fff" stroke="#000" strokeWidth="2.5" />
        <path d={P.gear} fill="#fff" stroke="#000" strokeWidth="2.5" />
        <circle cx={P.hub.cx} cy={P.hub.cy} r={P.hub.r} fill="#000" stroke="#fff" strokeWidth="4" />
        <path d={P.spokes} stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        <path d={P.flame} fill="#fff" stroke="#000" strokeWidth="2" />
        <text x="100" y="184" textAnchor="middle" fill="#fff" fontFamily="var(--font-display)" fontWeight="900" fontSize="30" letterSpacing="1">
          FIRE
        </text>
      </svg>
    );

  return (
    <svg viewBox="0 0 200 200" className={className} {...a11y}>
      {title && <title>{title}</title>}
      <circle cx="100" cy="100" r="94" fill="#fff" stroke={K.ring} strokeWidth="6" />
      <path d={P.band} fill={K.grey} />
      <path id={arc} d={P.textArc} fill="none" />
      <text fill={K.navy} fontFamily="var(--font-display)" fontWeight="900" fontSize="31" letterSpacing="2">
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          UNIVERSAL
        </textPath>
      </text>
      <path d={P.arrows} fill={K.arrow} />
      <path d={P.gear} fill={K.gear} />
      <circle cx={P.hub.cx} cy={P.hub.cy} r={P.hub.r} fill="#fff" stroke={K.navy} strokeWidth="4" />
      <path d={P.spokes} stroke={K.spoke} strokeWidth="2" strokeLinecap="round" />
      <path d={P.flame} fill={K.red} />
      <text x="100" y="184" textAnchor="middle" fill={K.red} fontFamily="var(--font-display)" fontWeight="900" fontSize="30" letterSpacing="1">
        FIRE
      </text>
    </svg>
  );
}

/**
 * The emblem as white line-art — the preloader's first frame, which a gauge
 * needle uncovers (components/chrome/Loader.tsx); the lettering is stroked.
 */
export function EmblemSkeleton({ className = "" }: { className?: string }) {
  const arc = useId();
  const line = { fill: "none", stroke: "#fff", strokeWidth: 1.6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="94" {...line} />
      <path d={P.band} {...line} />
      <path d={P.gear} {...line} />
      <path d={P.arrows} {...line} />
      <circle cx={P.hub.cx} cy={P.hub.cy} r={P.hub.r} {...line} />
      <path d={P.spokes} {...line} />
      <path d={P.flame} {...line} />
      <path id={arc} d={P.textArc} fill="none" />
      <text fill="none" stroke="#fff" strokeWidth="0.8" fontFamily="var(--font-display)" fontWeight="900" fontSize="31" letterSpacing="2">
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          UNIVERSAL
        </textPath>
      </text>
      <text x="100" y="184" textAnchor="middle" fill="none" stroke="#fff" strokeWidth="0.8" fontFamily="var(--font-display)" fontWeight="900" fontSize="30" letterSpacing="1">
        FIRE
      </text>
    </svg>
  );
}
