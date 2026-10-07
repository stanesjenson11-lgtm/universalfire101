import { useId } from "react";
import { EMBLEM as K, emblemPaths as P } from "@/lib/mark";

/** The full-colour emblem, inline so its lettering uses the page's display face. */
export default function Emblem({ className = "", title }: { className?: string; title?: string }) {
  const arc = useId();
  return (
    <svg viewBox="0 0 200 200" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <circle cx="100" cy="100" r="94" fill="#fff" stroke={K.ring} strokeWidth="6" />
      <path d={P.band} fill={K.grey} />
      <path id={arc} d={P.textArc} fill="none" />
      <text
        fill={K.navy}
        fontFamily="var(--font-display)"
        fontWeight="900"
        fontSize="31"
        letterSpacing="2"
      >
        <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
          UNIVERSAL
        </textPath>
      </text>
      <path d={P.arrows} fill={K.arrow} />
      <path d={P.gear} fill={K.gear} />
      <circle cx={P.hub.cx} cy={P.hub.cy} r={P.hub.r} fill="#fff" stroke={K.navy} strokeWidth="4" />
      <path d={P.spokes} stroke={K.spoke} strokeWidth="2" strokeLinecap="round" />
      <path d={P.flame} fill={K.red} />
      <text
        x="100"
        y="184"
        textAnchor="middle"
        fill={K.red}
        fontFamily="var(--font-display)"
        fontWeight="900"
        fontSize="30"
        letterSpacing="1"
      >
        FIRE
      </text>
    </svg>
  );
}
