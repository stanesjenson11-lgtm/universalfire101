import { home, site, wa } from "@/lib/content";
import RandomLetterSwapPingPong from "@/components/fancy/text/random-letter-swap-pingpong-anim";
import CityScene from "./CityScene";

/**
 * The hero: a city at night where fires keep breaking out and firemen keep
 * putting them out (CityScene), the line set large above it, and the real 3D
 * extinguisher (ShotStage) standing on the street in the box marked
 * data-ext="home" — scrolling sends it down into the fire.
 */
export default function Hero() {
  return (
    <section id="top" data-ground="dark" className="on-black relative h-svh min-h-[40rem] overflow-hidden">
      <CityScene />
      <div className="relative z-[var(--z-content)] mx-auto max-w-[80rem] px-gutter pt-[clamp(6.5rem,15vh,9.5rem)]">
        <h1 className="text-hero font-semibold">
          <RandomLetterSwapPingPong label={home.hero.lines[0]} autoPlayDelay={2300} />
          <RandomLetterSwapPingPong label={home.hero.lines[1]} autoPlayDelay={2480} />
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
      {/* Where the extinguisher stands, on the street: the 3D stage measures this box. */}
      <div
        data-ext="home"
        aria-hidden="true"
        className="absolute right-[9vw] bottom-[4.5%] h-[50svh] w-[13vw] max-[620px]:right-[5vw] max-[620px]:h-[30svh] max-[620px]:w-[24vw]"
      />
    </section>
  );
}
