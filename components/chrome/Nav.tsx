"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import Emblem from "@/components/ui/Emblem";

/**
 * FidaroHQ's navbar (Kickstart's): a flat bar over the black hero that
 * collapses into a floating glass pill once scrolled, ink over white sections
 * (globals.css, .uf-nav). Mono slate links, the current section's underlined;
 * Contact sits apart as the orange pill. Phones: the lockup and the menu.
 */
const primary = nav.links.filter((l) => l.href !== "#contact");

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
            <span className="uf-wordmark" aria-hidden="true">
              <span className="font-light">Universal</span> <span className="font-bold">Fire</span>
            </span>
          </a>

          <div className="flex items-center gap-3 bar:gap-10">
            <nav aria-label="Primary" className="hidden items-center gap-10 bar:flex">
              {primary.map((l) => (
                <a key={l.href} href={l.href} className="u-meta cut-link" aria-current={current === l.href.slice(1) ? "true" : undefined}>
                  {l.label}
                </a>
              ))}
            </nav>

            <a href="#contact" className="nav-contact u-meta hidden min-[520px]:inline-flex" aria-current={current === "contact" ? "true" : undefined}>
              Contact
            </a>

            {/* Phones get Kickstart's bar: the lockup and the menu; calling and
                WhatsApp live in the sheet. */}
            <button
              className="relative z-[var(--z-overlay)] -mr-2.5 flex h-11 w-11 items-center justify-center bar:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="relative block h-[9px] w-6">
                <span
                  className="absolute left-0 block h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(4px) rotate(12deg)" : "none" }}
                />
                <span
                  className="absolute bottom-0 left-0 block h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(-4px) rotate(-12deg)" : "none" }}
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
