import { EmblemSkeleton } from "@/components/ui/Emblem";

/**
 * Home only, CSS only — Kickstart's preloader rhythm: the emblem draws itself
 * as white line-art on black, holds a beat, then the black lifts off the page
 * like a shutter. No script; reduced-motion visitors never see it.
 */
export default function Loader() {
  return (
    <div aria-hidden="true" className="uf-loader pointer-events-none fixed inset-0 z-[var(--z-loader)] grid place-items-center bg-black">
      <EmblemSkeleton className="h-40 w-40" />
    </div>
  );
}
