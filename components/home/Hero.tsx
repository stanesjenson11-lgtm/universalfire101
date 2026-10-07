import { home, site, wa } from "@/lib/content";
import RandomLetterSwapPingPong from "@/components/fancy/text/random-letter-swap-pingpong-anim";
import CityScene from "./CityScene";

/**
 * The hero: a city at night where fires keep breaking out and firemen keep
 * putting them out (CityScene), the line set large above it. The real 3D
 * extinguisher (ShotStage) hangs from the hand of the fireman in front —
 * CityScene marks it data-ext="home" — and scrolling sends it down into the fire.
 */
export default function Hero() {
  return (
    <section id="top" data-ground="dark" className="on-black relative h-svh min-h-[40rem] overflow-hidden">
      <CityScene />
      <div className="relative z-[var(--z-content)] mx-auto max-w-[80rem] px-gutter pt-[clamp(6.5rem,15vh,9.5rem)]">
        <h1 className="text-hero font-semibold">
          <RandomLetterSwapPingPong label={home.hero.lines[0]} autoPlayDelay={2750} />
          <RandomLetterSwapPingPong label={home.hero.lines[1]} autoPlayDelay={2930} />
        </h1>
        <p className="mt-5 max-w-[34ch] text-lead text-muted-dark">{home.hero.support}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={wa(home.hero.cta.text)} target="_blank" rel="noopener noreferrer" className="btn btn-fire">
            {home.hero.cta.label}
          </a>
          <a href={`tel:${site.phone.tel}`} className="btn btn-line tabular-nums">
            Call {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
