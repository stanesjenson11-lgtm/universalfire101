"use client";

import { useEffect, useRef } from "react";
import { home } from "@/lib/content";
import { afterPaint, canWebGL, engaged, prefersReduced, ScrollTrigger, whenIdle } from "@/lib/motion";
import { shot } from "@/lib/shot";

/**
 * "Inside every extinguisher": the scanned 3D extinguisher turns, opens in a
 * quarter cutaway, and comes apart into its eleven parts as you scroll
 * (components/gl/exploded.ts). three.js loads only when the section is near.
 *
 * Without WebGL or JS the parts are a plain list. Phones get the callouts too,
 * small: names only, in narrow columns at the edges, the model small between.
 */
export default function Inside() {
  const section = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);

  // The stage's pin, from the first render (the section, not the stage, is
  // what phones scroll on past it): its length is fixed, so the page never
  // changes height when the 3D arrives. Its progress is shot.inside.
  useEffect(() => {
    const stage = host.current?.parentElement;
    if (!stage || prefersReduced() || !canWebGL()) return;
    // After the first paint, so the page's first frame never waits on it.
    let st: ScrollTrigger | undefined;
    const cancel = afterPaint(() => {
      st = ScrollTrigger.create({
        trigger: stage,
        pin: stage,
        start: "top top",
        end: window.matchMedia("(max-width: 760px)").matches ? "+=300%" : "+=440%",
        anticipatePin: 1,
        onUpdate: (self) => void (shot.inside = self.progress),
        onRefresh: (self) => void (shot.inside = self.progress),
      });
    });
    return () => {
      cancel();
      st?.kill();
    };
  }, []);

  // The 3D: started in idle time once someone is here, well before it is
  // reached (its start-up is half a second of work on a phone), or as it
  // comes within a screen, whichever is first.
  useEffect(() => {
    const el = section.current;
    if (!el || !host.current || !svg.current || !intro.current || !list.current) return;
    let stop = () => {};
    let gone = false;
    let started = false;
    const start = () => {
      if (started || gone) return;
      started = true;
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
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), {
      rootMargin: "100% 0px",
    });
    io.observe(el);
    engaged().then(() => whenIdle(start, 2500));
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
        {/* The whole stage at every size; narrower than desktop, the camera
            frames the model under the title (exploded.ts, frameAt). */}
        <div ref={host} aria-hidden="true" className="absolute inset-0" />
        <svg ref={svg} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
          <path fill="none" stroke="rgb(255 255 255 / 0.35)" strokeWidth="1" />
        </svg>
        <ol ref={list} aria-hidden="true" className="pointer-events-none absolute inset-0">
          {parts.map((p) => (
            <li key={p.name} className="absolute top-0 left-0 w-[230px] opacity-0 max-[760px]:w-[100px]">
              <p className="text-small font-semibold max-[760px]:text-[0.6875rem] max-[760px]:leading-tight">{p.name}</p>
              <p className="text-micro text-muted-dark max-[760px]:hidden">{p.note}</p>
            </li>
          ))}
        </ol>
        {/* Desktop: beside the model, never over it (it stands centred, about a fifth of the screen height wide). */}
        <div
          ref={intro}
          className="pointer-events-none relative z-[var(--z-content)] px-gutter pt-[clamp(6rem,14vh,9rem)] text-center wide:absolute wide:top-[55%] wide:left-0 wide:w-[min(34rem,calc(50vw-22svh))] wide:-translate-y-1/2 wide:pt-0 wide:text-left"
        >
          <h2 className="text-h2 font-semibold">{heading}</h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-lead text-muted-dark wide:mx-0">{body}</p>
        </div>
      </div>
      {/* The same parts as plain text: no-JS, no WebGL, screen readers. */}
      <ol className="grid gap-x-grid gap-y-6 px-gutter pb-section sm:grid-cols-2 wide:grid-cols-5 group-data-[live]:sr-only">
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
