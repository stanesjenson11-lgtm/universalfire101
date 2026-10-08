"use client";

import { useRef } from "react";
import { products, services, site, wa } from "@/lib/content";
import Emblem from "@/components/ui/Emblem";
import Num from "@/components/ui/Num";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";

export default function Footer() {
  const wordmark = useRef<HTMLDivElement>(null);

  return (
    // The call band and the rest of the footer fit one screen together (phones too: compact type, offices side by side).
    <footer className="on-black relative overflow-hidden">
      {/* The call band: the one thing the page ends on. */}
      <div className="border-b border-[var(--rule-dark)] px-gutter py-5 wide:py-[clamp(1.5rem,5svh,3.5rem)]">
        <div className="flex flex-wrap items-end justify-between gap-x-grid gap-y-4 wide:gap-y-8">
          <div>
            <p className="text-small text-muted-dark wide:text-lead">Available</p>
            <p className="text-[clamp(3.25rem,12vw,9rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums wide:text-[clamp(3.5rem,min(9vw,12svh),7.5rem)]">
              <Num>24/7</Num>
            </p>
            <p className="mt-2 max-w-[34ch] text-small text-muted-dark wide:mt-3 wide:text-body">Call us immediately — a fire safety engineer answers, day or night.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Phones: compact, so both sit on one row. */}
            <a href={`tel:${site.phone.tel}`} className="btn btn-fire tabular-nums max-sm:px-4 max-sm:text-small">
              Call {site.phone.display}
            </a>
            <a href={wa("Hi Universal Fire, I have a fire safety enquiry.")} target="_blank" rel="noopener noreferrer" className="btn btn-line max-sm:px-4 max-sm:text-small">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Wordmark: letters thicken toward the cursor. */}
      <div ref={wordmark} className="relative px-gutter pt-5 wide:pt-[clamp(1rem,4svh,3rem)]">
        <Emblem className="pointer-events-none absolute -right-[4%] top-[6%] h-[150%] w-auto opacity-[0.07] grayscale" />
        <VariableFontCursorProximity
          as="p"
          className="relative text-[clamp(2.5rem,12vw,12rem)] leading-[0.9] font-[200] tracking-[-0.04em] wide:text-[clamp(3rem,min(9vw,12svh),8.5rem)]"
          fromFontVariationSettings="'wght' 200"
          toFontVariationSettings="'wght' 800"
          radius={220}
          falloff="gaussian"
          containerRef={wordmark}
        >
          Universal Fire
        </VariableFontCursorProximity>
      </div>

      <div className="relative grid grid-cols-2 gap-x-grid gap-y-4 px-gutter pt-4 pb-4 text-micro wide:grid-cols-12 wide:gap-y-10 wide:pt-[clamp(1rem,3.5svh,2.5rem)] wide:pb-[clamp(0.75rem,2.5svh,2rem)] wide:text-small">
        <div className="col-span-2 wide:col-span-3">
          <p className="max-w-[44ch] text-muted-dark max-sm:hidden">{site.footerNote}</p>
          <div className="flex gap-5 sm:mt-6">
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
          { title: "Products", links: products, span: "wide:col-span-4" },
          { title: "Services", links: services, span: "wide:col-span-2" },
        ].map((col) => (
          <nav key={col.title} aria-label={col.title} className={col.span}>
            <h2 className="text-small font-semibold">{col.title}</h2>
            {/* Desktop: down columns of five, so nine products take five rows. */}
            <ul className="mt-2 grid gap-x-grid gap-y-0.5 text-muted-dark wide:mt-4 wide:grid-flow-col wide:grid-rows-5 wide:gap-y-2">
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

        <div className="col-span-2 grid grid-cols-2 gap-x-grid gap-y-3 wide:col-span-3 wide:gap-y-5">
          {site.offices.map((o) => (
            <address key={o.city} className="not-italic">
              <h2 className="text-small font-semibold">{o.city}</h2>
              <p className="mt-1.5 text-muted-dark wide:mt-4">
                {o.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </address>
          ))}
          <p className="col-span-2 text-muted-dark">
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

      <div className="relative flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-[var(--rule-dark)] px-gutter py-3 text-micro text-muted-dark wide:py-4">
        <p>
          © {new Date().getFullYear()} {site.name}
          {/* Phones: on its own line; wider: after the copyright. */}
          <span className="whitespace-nowrap max-sm:block">
            <span className="max-sm:hidden"> · </span>Powered by{" "}
            <a href="https://thearktech.in/" target="_blank" rel="noopener" className="text-paper hover:underline">
              TheArkTech
            </a>
          </span>
        </p>
        <p>Extinguishers approved by BIS, certified ISI & MMD.</p>
      </div>
    </footer>
  );
}
