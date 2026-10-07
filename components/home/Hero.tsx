import { home, site, wa } from "@/lib/content";
import RandomLetterSwapPingPong from "@/components/fancy/text/random-letter-swap-pingpong-anim";

/**
 * Apple's product hero: black, the line set large, the product beside it.
 * The product is the real 3D extinguisher (ShotStage) standing in the box
 * marked data-ext="home" — scrolling sends it down into the fire.
 */
export default function Hero() {
  return (
    <section id="top" data-ground="dark" className="on-black relative h-svh min-h-[38rem] overflow-hidden px-gutter">
      <div className="mx-auto grid h-full max-w-[80rem] items-center gap-x-grid wide:grid-cols-12">
        <div className="relative z-[var(--z-content)] max-[620px]:self-end max-[620px]:pb-[10svh] wide:col-span-7">
          <h1 className="text-hero font-semibold">
            <RandomLetterSwapPingPong label={home.hero.lines[0]} autoPlayDelay={1150} />
            <RandomLetterSwapPingPong label={home.hero.lines[1]} autoPlayDelay={1330} />
          </h1>
          <p className="mt-6 max-w-[30ch] text-lead text-muted-dark">{home.hero.support}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={wa(home.hero.cta.text)} target="_blank" rel="noopener noreferrer" className="btn btn-fire">
              {home.hero.cta.label}
            </a>
            <a href={`tel:${site.phone.tel}`} className="btn btn-line tabular-nums">
              Call {site.phone.display}
            </a>
          </div>
        </div>
        {/* Where the extinguisher stands: the 3D stage measures this box. */}
        <div
          data-ext="home"
          aria-hidden="true"
          className="justify-self-center max-[620px]:absolute max-[620px]:top-[11svh] max-[620px]:right-[12vw] max-[620px]:h-[31svh] max-[620px]:w-[22vw] wide:col-span-5 wide:h-[66svh] wide:w-[40%] h-[50svh] w-[30%]"
        />
      </div>
    </section>
  );
}
