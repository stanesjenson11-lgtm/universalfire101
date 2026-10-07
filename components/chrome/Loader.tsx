import Emblem from "@/components/ui/Emblem";

/**
 * Home only, CSS only: the emblem settles in, then the black lifts off the page
 * like a shutter. No script — it plays on first paint and is gone in ~1.5s.
 * Reduced-motion visitors never see it (globals.css).
 */
export default function Loader() {
  return (
    <div aria-hidden="true" className="uf-loader pointer-events-none fixed inset-0 z-[var(--z-loader)] grid place-items-center bg-black">
      <Emblem className="uf-loader-mark h-36 w-36" />
    </div>
  );
}
