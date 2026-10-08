import { home, wa } from "@/lib/content";
import RandomLetterSwapPingPong from "@/components/fancy/text/random-letter-swap-pingpong-anim";
import CityScene from "./CityScene";

/**
 * The hero: a city at night where fires keep breaking out and firemen keep
 * putting them out (CityScene), the line set large above it. The real 3D
 * extinguisher (ShotStage) hangs from the hand of the fireman in front —
 * CityScene marks it data-ext="home" — and scrolling sends it down into the fire.
 *
 * The headline is FidaroHQ's hero type (u-hero). The one call to action is
 * lettered on the fire engine's side: a layer with CityScene's viewBox and
 * crop, so the words stay on the engine at any size. Narrower than about 3:2
 * the crop cuts the engine off, and it sits under the line instead.
 */
export default function Hero() {
  return (
    <section id="top" data-ground="dark" className="on-black relative h-svh min-h-[40rem] overflow-hidden">
      <CityScene />
      <div className="relative z-[var(--z-content)] mx-auto max-w-[80rem] px-gutter pt-[clamp(6.5rem,15vh,9.5rem)]">
        <h1 className="u-hero">
          <RandomLetterSwapPingPong label={home.hero.lines[0]} autoPlayDelay={2750} />
          <RandomLetterSwapPingPong label={home.hero.lines[1]} autoPlayDelay={2930} />
        </h1>
        <p className="u-lead mt-5 text-muted-dark sm:whitespace-nowrap">{home.hero.support}</p>
        <a
          href={wa(home.hero.cta.text)}
          target="_blank"
          rel="noopener noreferrer"
          className="more mt-6 hidden text-lead [@media(max-aspect-ratio:73/50)]:inline-block"
        >
          {home.hero.cta.label}
        </a>
      </div>

      {/* Lettered on the engine's side panel, above its stripe (x 150–325, y 788–808 in CityScene). */}
      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none absolute inset-0 z-[var(--z-content)] h-full w-full [@media(max-aspect-ratio:73/50)]:hidden"
      >
        <a href={wa(home.hero.cta.text)} target="_blank" rel="noopener noreferrer" className="uf-livery pointer-events-auto">
          <text x="154" y="803">
            {home.hero.cta.label}
          </text>
        </a>
      </svg>
    </section>
  );
}
