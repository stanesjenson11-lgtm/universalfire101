import Image from "next/image";
import { home, site, wa } from "@/lib/content";

/**
 * The hero: a still photograph of a plain dark wall, the words on its left,
 * and the real 3D extinguisher (ShotStage) standing on the right — this page
 * marks its spot data-ext="home", and scrolling sends it down into the fire.
 * Until the 3D arrives, a still of the model stands there (data-ext-poster;
 * it fades out as the model fades in, globals.css .ext-live).
 * Photo: Tak Kei Wong on Unsplash (unsplash.com/photos/PWOV__8cRpw), cropped to the wall.
 * Portrait screens (phones, tablets held upright): the words on top, the extinguisher low under them.
 */
export default function Hero() {
  const { lines, support, cta } = home.hero;
  return (
    <section id="top" data-ground="dark" className="on-black relative h-svh min-h-[36rem] overflow-hidden bg-[#3e423d]">
      <Image src="/site/hero-wall.jpg" alt="" fill loading="eager" fetchPriority="high" sizes="100vw" className="object-cover object-[70%_50%]" />
      {/* Deepens the wall so the light type holds 4.5:1 wherever it falls. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/30" />

      {/* Where the extinguisher stands: its box is the model's height, 48:112 like the model. */}
      <div
        data-ext="home"
        aria-hidden="true"
        className="absolute right-[16vw] bottom-[9svh] aspect-[48/112] h-[52svh] portrait:right-[14vw] portrait:bottom-[4svh] portrait:h-[30svh]"
      >
        {/* The still, rendered from the model in this pose: a little wider and taller than the box. */}
        <span data-ext-poster className="absolute top-[-2.16%] left-[-42.15%] h-[108.9%] w-[146.9%]">
          <Image src="/site/extinguisher-hand.webp" alt="" fill sizes="20vw" className="object-fill" />
        </span>
      </div>

      <div className="relative z-[var(--z-content)] mx-auto flex h-full max-w-[80rem] flex-col justify-center px-gutter portrait:justify-start portrait:pt-[clamp(6.5rem,16svh,9rem)]">
        <h1 className="u-hero">
          <span className="block">{lines[0]}</span>
          <span className="block">{lines[1]}</span>
        </h1>
        <p className="u-lead mt-5 max-w-[40ch] text-paper">{support}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={wa(cta.text)} target="_blank" rel="noopener noreferrer" className="btn btn-fire">
            {cta.label}
          </a>
          <a href={`tel:${site.phone.tel}`} className="btn btn-line tabular-nums">
            Call {site.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
