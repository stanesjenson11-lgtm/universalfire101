"use client";

import { useEffect } from "react";
import { ScrollTrigger, prefersReduced } from "@/lib/motion";

/**
 * Every highlighted phrase on the page (Rich's <mark data-scrub>) draws its
 * highlight as you scroll it up the screen — from 85% down the viewport to
 * the middle — and undraws if you scroll back. Marks inside product sheets scroll
 * with the sheet, not the page, so they stay drawn. Without JS or under
 * reduced motion every mark is simply drawn (CSS default --hl: 1).
 */
export default function ScrubMarks() {
  useEffect(() => {
    if (prefersReduced()) return;
    const marks = Array.from(document.querySelectorAll<HTMLElement>("mark[data-scrub]")).filter((m) => !m.closest("dialog"));
    const triggers = marks.map((el) => {
      el.style.setProperty("--hl", "0");
      return ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        // After the pins above it (fire, exploded view), which mount later and
        // would otherwise leave this measured without their extra scroll.
        refreshPriority: -1,
        end: "top 50%",
        onUpdate: (self) => el.style.setProperty("--hl", self.progress.toFixed(3)),
        onRefresh: (self) => el.style.setProperty("--hl", self.progress.toFixed(3)),
      });
    });
    return () => {
      triggers.forEach((t) => t.kill());
      marks.forEach((el) => el.style.removeProperty("--hl"));
    };
  }, []);
  return null;
}
