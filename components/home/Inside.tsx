"use client";

import { useEffect, useRef } from "react";
import { home } from "@/lib/content";
import { prefersReduced } from "@/lib/motion";

/**
 * "Inside every extinguisher": the scanned 3D extinguisher turns, opens in a
 * quarter cutaway, and comes apart into its eleven parts as you scroll
 * (components/gl/exploded.ts). three.js loads only when the section is near.
 *
 * Without WebGL or JS the parts are a plain list; on phones the callouts give
 * way to the same list under the model.
 */
export default function Inside() {
  const section = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el || !host.current || !svg.current || !intro.current || !list.current) return;
    let stop = () => {};
    let gone = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        import("@/components/gl/exploded")
          .then(({ mountExploded }) =>
            mountExploded(
              {
                section: el,
                host: host.current!,
                svg: svg.current!,
                intro: intro.current!,
                callouts: Array.from(list.current!.children) as HTMLElement[],
              },
              prefersReduced(),
              () => gone,
            ),
          )
          .then((s) => (gone ? s() : (stop = s)))
          .catch(() => {});
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      gone = true;
      io.disconnect();
      stop();
    };
  }, []);

  const { heading, body, parts } = home.inside;
  return (
    <section ref={section} id="inside" data-ground="dark" className="group on-black relative overflow-hidden">
      {/* The stage pins while the model comes apart; callouts live inside it. */}
      <div className="relative h-svh min-h-[40rem] overflow-hidden">
        {/* Phones: the model stands below the title instead of behind it. */}
        <div ref={host} aria-hidden="true" className="absolute inset-0 max-[760px]:top-[clamp(15rem,36%,19rem)]" />
        <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full max-[760px]:hidden">
          <path fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1" />
        </svg>
        <ol ref={list} aria-hidden="true" className="pointer-events-none absolute inset-0 max-[760px]:hidden">
          {parts.map((p) => (
            <li key={p.name} className="absolute top-0 left-0 w-[230px] opacity-0">
              <p className="text-small font-semibold">{p.name}</p>
              <p className="text-micro text-muted-dark">{p.note}</p>
            </li>
          ))}
        </ol>
        <div ref={intro} className="pointer-events-none relative z-[var(--z-content)] px-gutter pt-[clamp(6rem,14vh,9rem)] text-center">
          <h2 className="text-h2 font-semibold">{heading}</h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-lead text-muted-dark">{body}</p>
        </div>
      </div>
      {/* The same parts as plain text: phones, no-JS, no WebGL, screen readers. */}
      <ol className="grid gap-x-grid gap-y-6 px-gutter pb-section sm:grid-cols-2 wide:grid-cols-5 min-[761px]:group-data-[live]:sr-only">
        {parts.map((p) => (
          <li key={p.name}>
            <p className="text-small font-semibold">{p.name}</p>
            <p className="text-micro text-muted-dark">{p.note}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
