"use client";

import Image from "next/image";
import { useGsap, gsap } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  /** Wrapper classes. The wrapper must establish size — the image fills it. */
  className?: string;
  sizes?: string;
  /** Slow push-in as the plate crosses the viewport. */
  scale?: boolean;
  /** Unmask along the cut instead of appearing outright. */
  reveal?: boolean;
  /** Vertical drift, as a fraction of height. 0 disables parallax. */
  parallax?: number;
  /** Fit the whole image (diagrams, product cutouts) instead of cropping. */
  contain?: boolean;
  priority?: boolean;
};

/**
 * A photograph, revealed rising from below (.rise-reveal) and
 * pushed in slowly as it crosses the viewport. From Kickstart.
 *
 * The image is fully visible by default; the reveal is set up only after
 * mount, so crawlers and reduced-motion users see the picture.
 */
export default function Plate({
  src,
  alt,
  className = "",
  sizes = "100vw",
  scale = false,
  reveal = true,
  parallax = 0,
  contain = false,
  priority = false,
}: Props) {
  const scope = useGsap<HTMLDivElement>(({ self }) => {
    const img = self.querySelector("img");

    if (reveal) {
      gsap.fromTo(
        self,
        { "--p": 0 },
        {
          "--p": 1,
          ease: "expo.out",
          duration: 1.4,
          scrollTrigger: { trigger: self, start: "top 88%" },
        },
      );
    }

    if (scale && img) {
      gsap.fromTo(
        img,
        { scale: 1.16 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }

    if (parallax && img) {
      gsap.fromTo(
        img,
        { yPercent: -parallax * 100 },
        {
          yPercent: parallax * 100,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }
  }, []);

  return (
    <div
      ref={scope}
      className={cn("relative overflow-hidden", contain ? "bg-white" : "bg-paper", reveal && "rise-reveal", className)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={contain ? "object-contain p-[6%]" : "object-cover"}
        style={parallax ? { scale: 1 + parallax * 2.4 } : undefined}
      />
    </div>
  );
}
