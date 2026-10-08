import Emblem, { EmblemSkeleton } from "@/components/ui/Emblem";

/**
 * Home only, CSS only — the site's story in two seconds. A gauge needle sweeps
 * round the emblem and uncovers it as white line-art; fire rises through it,
 * ember orange under flickering tongues with heat behind; foam comes down and
 * puts it out, white; a beat, and the black lifts off the page like a shutter. Transforms
 * and opacity only, so the compositor runs it (timings: globals.css).
 * No script; reduced-motion visitors never see it.
 */
export default function Loader() {
  return (
    <div aria-hidden="true" className="uf-loader pointer-events-none fixed inset-0 z-[var(--z-loader)] overflow-hidden bg-black">
      <div className="grid h-full place-items-center">
        <div className="relative h-40 w-40">
          {/* The heat behind it: a blurred disc (a filter, not a gradient). */}
          <div className="uf-glow absolute -inset-[35%] rounded-full bg-fire-bright blur-2xl" />

          {/* Fire, then foam, inside the emblem's circle. */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="uf-fire absolute inset-0 overflow-hidden">
              <Emblem variant="mono" className="h-full w-full text-fire-bright" />
            </div>
            <div className="uf-fire-rider absolute inset-0">
              <div className="uf-tongue-life absolute inset-0">
                <svg viewBox="0 0 200 52" preserveAspectRatio="none" className="uf-tongues absolute bottom-full left-0 h-[26%] w-full">
                  <path d={TONGUES} fill="var(--color-fire-bright)" />
                </svg>
                <svg viewBox="0 0 200 52" preserveAspectRatio="none" className="uf-tongues absolute bottom-full left-0 h-[17%] w-full">
                  <path d={TONGUES} fill="#ffb547" />
                </svg>
              </div>
            </div>
            <div className="uf-foam absolute inset-0 overflow-hidden">
              <Emblem variant="mono" className="h-full w-full text-white" />
            </div>
            <div className="uf-foam-rider absolute inset-0">
              <svg viewBox="0 0 200 32" preserveAspectRatio="none" className="uf-bubbles absolute top-full left-0 h-[16%] w-full -translate-y-1/2">
                {BUBBLES.map(([cx, cy, r]) => (
                  <circle key={cx} cx={cx} cy={cy} r={r} fill="#fff" />
                ))}
              </svg>
            </div>
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

/* Seven tongues of flame along the fire's rising edge (base at y = 52). */
const TONGUES =
  "M0 52 C8 40 10 28 16 18 C20 30 24 38 32 40 C38 30 40 16 50 4 C56 20 60 32 70 38 C76 28 80 14 92 0 C100 16 104 30 112 38 C120 30 124 18 134 6 C142 20 146 32 154 38 C160 30 164 20 172 12 C178 26 184 38 200 52 Z";

/* The foam's front: a row of bubbles across the edge it comes down on. */
const BUBBLES: [number, number, number][] = [
  [6, 16, 9], [22, 18, 11], [40, 15, 9], [56, 17, 12], [74, 15, 9], [90, 18, 11], [108, 15, 10],
  [124, 17, 12], [142, 16, 9], [158, 18, 11], [176, 15, 10], [194, 17, 9],
];
