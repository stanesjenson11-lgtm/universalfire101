import Emblem, { EmblemSkeleton } from "@/components/ui/Emblem";

/**
 * Home only, CSS only — Kickstart's preloader rhythm: a gauge needle sweeps
 * round the emblem and uncovers it as white line-art on black, then it fills
 * solid white from the bottom up like a gauge, holds a beat, and the black
 * lifts off the page like a shutter. Transforms only (timings: globals.css).
 * No script; reduced-motion visitors never see it.
 */
export default function Loader() {
  return (
    <div aria-hidden="true" className="uf-loader pointer-events-none fixed inset-0 z-[var(--z-loader)] overflow-hidden bg-black">
      <div className="grid h-full place-items-center">
        <div className="relative h-40 w-40">
          <div className="uf-fill absolute inset-0 overflow-hidden">
            <Emblem variant="mono" className="h-full w-full" />
          </div>
          <EmblemSkeleton className="absolute inset-0 h-full w-full" />
          {/* The needle rides the edge of each half as it turns away. Each half
              then hides: its cover and needle end on the clip edge, where
              antialiasing would leave a hairline through the emblem. */}
          <div className="uf-half-a absolute inset-y-0 right-0 w-1/2 overflow-hidden">
            <div className="uf-sweep-a relative h-full w-full origin-left bg-black">
              <i className="absolute top-0 left-0 h-1/2 w-[1.5px] bg-white" />
            </div>
          </div>
          <div className="uf-half-b absolute inset-y-0 left-0 w-1/2 overflow-hidden">
            <div className="uf-sweep-b relative h-full w-full origin-right bg-black">
              <i className="uf-needle-b absolute right-0 bottom-0 h-1/2 w-[1.5px] bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
