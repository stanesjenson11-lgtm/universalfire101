"use client";

import { useRef } from "react";
import { products, services, site, wa } from "@/lib/content";
import Emblem from "@/components/ui/Emblem";
import Num from "@/components/ui/Num";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";

export default function Footer() {
  const wordmark = useRef<HTMLDivElement>(null);

  return (
    <footer className="on-black relative overflow-hidden">
      {/* The call band: the one thing the page ends on. */}
      <div className="border-b border-[var(--rule-dark)] px-gutter py-section">
        <div className="flex flex-wrap items-end justify-between gap-x-grid gap-y-8">
          <div>
            <p className="text-lead text-muted-dark">Available</p>
            <p className="text-[clamp(4rem,12vw,9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              <Num>24/7</Num>
            </p>
            <p className="mt-3 max-w-[34ch] text-muted-dark">Call us immediately — a fire safety engineer answers, day or night.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${site.phone.tel}`} className="btn btn-fire tabular-nums">
              Call {site.phone.display}
            </a>
            <a href={wa("Hi Universal Fire, I have a fire safety enquiry.")} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Wordmark: letters thicken toward the cursor. */}
      <div ref={wordmark} className="relative px-gutter pt-section">
        <Emblem className="pointer-events-none absolute -right-[4%] top-[6%] h-[150%] w-auto opacity-[0.07] grayscale" />
        <VariableFontCursorProximity
          as="p"
          className="relative text-[clamp(3.5rem,14vw,12rem)] leading-[0.9] font-[200] tracking-[-0.04em]"
          fromFontVariationSettings="'wght' 200"
          toFontVariationSettings="'wght' 800"
          radius={220}
          falloff="gaussian"
          containerRef={wordmark}
        >
          Universal Fire
        </VariableFontCursorProximity>
      </div>

      <div className="relative grid grid-cols-2 gap-x-grid gap-y-10 px-gutter pt-12 pb-10 text-small wide:grid-cols-12">
        <div className="col-span-2 wide:col-span-4">
          <p className="max-w-[44ch] text-muted-dark">{site.footerNote}</p>
          <div className="mt-6 flex gap-5">
            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Facebook
            </a>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">
              Instagram
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">
              LinkedIn
            </a>
          </div>
        </div>

        {[
          { title: "Products", links: products },
          { title: "Services", links: services },
        ].map((col) => (
          <nav key={col.title} aria-label={col.title} className="wide:col-span-2">
            <h2 className="text-small font-semibold">{col.title}</h2>
            <ul className="mt-4 flex flex-col gap-2 text-muted-dark">
              {col.links.map((p) => (
                <li key={p.slug}>
                  <a href={`#${p.slug}`} className="hover:text-paper hover:underline">
                    {p.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 grid gap-8 sm:grid-cols-2 wide:col-span-4">
          {site.offices.map((o) => (
            <address key={o.city} className="not-italic">
              <h2 className="text-small font-semibold">{o.city}</h2>
              <p className="mt-4 text-muted-dark">
                {o.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </address>
          ))}
          <p className="text-muted-dark sm:col-span-2">
            <a href={`mailto:${site.email}`} className="break-all hover:text-paper hover:underline">
              {site.email}
            </a>
            <br />
            <a href={`tel:${site.phone2.tel}`} className="tabular-nums hover:text-paper hover:underline">
              {site.phone2.display}
            </a>
          </p>
        </div>
      </div>

      <div className="relative flex flex-wrap justify-between gap-4 border-t border-[var(--rule-dark)] px-gutter py-6 text-micro text-muted-dark">
        <p>© {new Date().getFullYear()} {site.name}</p>
        <p>Extinguishers approved by BIS, certified ISI & MMD.</p>
      </div>
    </footer>
  );
}
