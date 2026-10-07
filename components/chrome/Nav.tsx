"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import Emblem from "@/components/ui/Emblem";

/**
 * One page, one bar: full width over the black hero, a translucent pill once
 * scrolled (Kickstart's collapse in Apple's material), ink over white
 * sections. The link for the section under the bar is marked current.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [current, setCurrent] = useState("");
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = nav.links.map((l) => l.href.slice(1));
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const r = bar.current?.getBoundingClientRect();
      const y = r ? r.top + r.height / 2 : 40;
      const under = (el: Element) => {
        const s = el.getBoundingClientRect();
        return s.top <= y && s.bottom >= y;
      };
      setOnLight(Array.from(document.querySelectorAll("[data-ground=light]:not(header)")).some(under));
      // Current section: the last one whose top has passed a third of the screen.
      let now = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 3) now = id;
      }
      setCurrent(now);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-nav)] px-gutter"
        data-scrolled={scrolled}
        data-ground={onLight && !open ? "light" : "dark"}
      >
        <div ref={bar} className="uf-nav pointer-events-auto flex items-center justify-between gap-6">
          <a href="#top" className="uf-logo shrink-0" aria-label={`${site.name} — back to top`}>
            <Emblem variant="mark" />
            <span className="flex flex-col leading-none" aria-hidden="true">
              <span className="text-[1.05rem] font-bold tracking-[-0.015em]">Universal Fire</span>
              <span className="mt-1 text-micro opacity-75">Safety Equipments</span>
            </span>
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-7 text-small bar:flex">
            {nav.links.map((l) => (
              <a key={l.href} href={l.href} className="uf-link" aria-current={current === l.href.slice(1) ? "true" : undefined}>
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Phones get Kickstart's bar: the mark and the menu; the call
                button lives in the sheet. */}
            <a href={`tel:${site.phone.tel}`} className="btn btn-fire !min-h-9 !px-4 !py-1.5 !text-small tabular-nums max-bar:hidden">
              {site.phone.display.replace("+91 ", "")}
            </a>
            <button
              className="relative z-[var(--z-overlay)] flex h-10 w-10 items-center justify-center bar:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="relative block h-[8px] w-[18px]">
                <span
                  className="absolute left-0 block h-[1.5px] w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(3.25px) rotate(45deg)" : "none" }}
                />
                <span
                  className="absolute bottom-0 left-0 block h-[1.5px] w-full bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(-3.25px) rotate(-45deg)" : "none" }}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        data-open={open}
        className="uf-sheet on-black fixed inset-0 z-[var(--z-overlay)] overflow-y-auto px-gutter pt-28 pb-10 bar:hidden"
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {nav.links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="uf-sheet-link border-b border-[var(--rule-dark)] py-4 text-h2 font-semibold"
              style={{ transitionDelay: open ? `${100 + i * 45}ms` : "0ms" }}
            >
              {l.label}
            </a>
          ))}
          <div className="uf-sheet-link mt-10 flex flex-col gap-3" style={{ transitionDelay: open ? "360ms" : "0ms" }}>
            <a href={`tel:${site.phone.tel}`} className="btn btn-fire">
              Call {site.phone.display}
            </a>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              WhatsApp us
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
