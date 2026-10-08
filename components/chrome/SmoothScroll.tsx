"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/motion";

/**
 * Lenis smooths the mouse wheel; touch is native. ScrollTrigger reads from it. From Kickstart, minus
 * the snap points and keyframes. Holds still while a product sheet is open
 * (DetailController sends uf:hold).
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;

    const l = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch stays native: phones (Safari above all) scroll on their own
      // compositor, with their own momentum. Routed through Lenis it was laggy
      // and floaty. The pins anticipate instead (anticipatePin), so they
      // engage without a jump.
      syncTouch: false,
    });
    l.on("scroll", ScrollTrigger.update);
    const onHold = (e: Event) => ((e as CustomEvent<boolean>).detail ? l.stop() : l.start());
    window.addEventListener("uf:hold", onHold);

    ScrollTrigger.config({ ignoreMobileResize: true });
    // ScrollTrigger re-measures by itself at DOMContentLoaded and load. Fonts
    // that land after load move the text, so re-measure for those only (each
    // refresh is a full re-layout of every trigger: costly on a phone).
    document.fonts?.ready
      .then(() => document.readyState === "complete" && ScrollTrigger.refresh())
      .catch(() => {});

    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors go through Lenis or they fight the smoothing.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      const id = link?.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      l.scrollTo(target as HTMLElement, { offset: -8 });
    };
    document.addEventListener("click", onClick);

    // Grabbing the scrollbar hands scrolling straight back to the browser.
    const onPointerDown = (e: PointerEvent) => {
      if (e.clientX < document.documentElement.clientWidth) return;
      l.scrollTo(window.scrollY, { immediate: true, force: true });
    };
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("uf:hold", onHold);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  return null;
}
