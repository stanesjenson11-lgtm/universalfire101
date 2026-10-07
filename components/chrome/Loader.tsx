import Emblem, { EmblemSkeleton } from "@/components/ui/Emblem";

/**
 * Home only, CSS only — Kickstart's preloader rhythm: the emblem draws itself
 * as white line-art on black, then fills solid white from the bottom up like a
 * gauge, holds a beat, and the black lifts off the page like a shutter.
 * No script; reduced-motion visitors never see it.
 */
export default function Loader() {
  return (
    <div aria-hidden="true" className="uf-loader pointer-events-none fixed inset-0 z-[var(--z-loader)] grid place-items-center bg-black">
      <div className="relative h-40 w-40">
        <Emblem variant="mono" className="uf-fill absolute inset-0 h-full w-full" />
        <EmblemSkeleton className="absolute inset-0 h-full w-full" />
      </div>
    </div>
  );
}
