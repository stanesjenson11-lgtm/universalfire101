"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

/** useLayoutEffect warns during SSR; useEffect is the correct server fallback. */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Resolves once the preloader has lifted — at once if there is none. Every
 * WebGL start-up (shader compiles, texture uploads) waits for it: they tie up
 * the GPU, and even the preloader's compositor-only animation needs the GPU
 * to draw its frames.
 */
export function loaderDone(): Promise<void> {
  const lift = document.getAnimations().filter((a) => (a as CSSAnimation).animationName === "uf-lift");
  return Promise.all(lift.map((a) => a.finished.catch(() => {}))).then(() => {});
}

/**
 * Minimal stand-in for @gsap/react's useGSAP — scopes selector text to a ref
 * and reverts every tween, ScrollTrigger and SplitText on unmount.
 *
 * Bails out entirely under reduced motion. That is safe because every section
 * renders complete and visible by default; animation only ever enhances, so
 * skipping it leaves a finished page rather than a blank one.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (ctx: { self: T }) => void,
  deps: unknown[] = [],
) {
  const scope = useRef<T>(null);

  useIsoLayoutEffect(() => {
    if (prefersReduced() || !scope.current) return;
    const self = scope.current;
    const ctx = gsap.context(() => setup({ self }), self);
    return () => ctx.revert();
  }, deps);

  return scope;
}
