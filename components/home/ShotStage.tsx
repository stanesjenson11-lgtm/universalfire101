"use client";

import { useEffect, useRef } from "react";
import { loaderDrawn, prefersReduced } from "@/lib/motion";

/**
 * Host for the 3D extinguisher shot (components/gl/shot-stage.ts): a fixed,
 * see-through layer above the sections and below the nav. three.js and the
 * model load once the preloader's needle has swept, and the layer fades in
 * when ready; the hero's type never waits on them.
 * Placed after <Fire/> so the fire canvas has reported WebGL before it mounts.
 */
export default function ShotStage() {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = {
      stage: stage.current,
      hero: document.getElementById("top"),
      fire: document.getElementById("fire"),
      home: document.querySelector<HTMLElement>('[data-ext="home"]'),
      land: document.querySelector<HTMLElement>('[data-ext="land"]'),
    };
    if (Object.values(els).some((e) => !e)) return;
    let stop = () => {};
    let gone = false;
    loaderDrawn()
      .then(() => import("@/components/gl/shot-stage"))
      .then(({ mountShotStage }) => mountShotStage(els as Record<keyof typeof els, HTMLElement>, prefersReduced(), () => gone))
      .then((s) => {
        if (gone) return s();
        stop = s;
        els.stage!.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: "ease-out" });
      })
      .catch((e) => console.error("[shot-stage]", e));
    return () => {
      gone = true;
      stop();
    };
  }, []);

  return <div ref={stage} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[var(--z-stage)]" />;
}
