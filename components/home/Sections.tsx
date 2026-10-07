"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { home, page, products, services, type Block } from "@/lib/content";
import Rich from "@/components/ui/Rich";
import { SpecTable, Statement } from "@/components/Blocks";
import Enquiry from "@/components/Enquiry";
import StackingCards, { StackingCardItem } from "@/components/fancy/blocks/stacking-cards";
import MarqueeAlongSvgPath from "@/components/fancy/blocks/marquee-along-svg-path";
import VariableFontCursorProximity from "@/components/fancy/text/variable-font-cursor-proximity";
import VariableFontHoverByLetter from "@/components/fancy/text/variable-font-hover-by-letter";

const hoverWeight = { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const };

/** Section headline: the letters thicken one by one under the pointer. */
function Headline({ children, className = "" }: { children: string; className?: string }) {
  return (
    <h2 className={`text-h2 font-semibold ${className}`}>
      <VariableFontHoverByLetter
        label={children}
        fromFontVariationSettings="'wght' 600"
        toFontVariationSettings="'wght' 800"
        staggerDuration={0.02}
        transition={hoverWeight}
      />
    </h2>
  );
}

const strip = (s: string) => s.replace(/==|\[|\]\(.+?\)/g, "");

/* ------------------------------------------------------------------------ */

export function About() {
  const about = page("about-us")!;
  const prose = about.blocks.filter((b): b is Extract<Block, { type: "prose" }> => b.type === "prose");
  const person = about.blocks.find((b): b is Extract<Block, { type: "person" }> => b.type === "person")!;
  return (
    <section id="about" data-ground="light" className="bg-white px-gutter py-section-lg">
      <Statement first="Protecting" second="Tamil Nadu" media={about.image} />
      <div className="mx-auto mt-section grid max-w-[72rem] gap-x-16 gap-y-12 wide:grid-cols-2">
        <div>
          <Headline>{prose[0].heading!}</Headline>
          {prose[0].body.map((p) => (
            <p key={p} className="mt-5 text-lead text-muted">
              <Rich text={p} />
            </p>
          ))}
          <div className="mt-10 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-paper">
              <Image src={person.image.src} alt={person.image.alt} fill sizes="4rem" className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{person.name}</p>
              <p className="text-small text-muted">{person.role}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {prose.slice(1).map((b) => (
            <div key={b.heading} className="border-t border-[var(--rule)] pt-8">
              <h3 className="text-h3 font-semibold">{b.heading}</h3>
              {b.body.map((p) => (
                <p key={p} className="mt-4 text-muted">
                  <Rich text={p} />
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** Every product as a card that stacks as you scroll; each opens its sheet. */
export function Products() {
  const intro = home.intro;
  return (
    <section id="products" data-ground="light" className="bg-paper px-gutter pt-section-lg">
      <div className="mx-auto max-w-[72rem] text-center">
        <Headline>{intro.heading}</Headline>
        <p className="mx-auto mt-5 max-w-[60ch] text-lead text-muted">
          <Rich text={intro.body[0]} />
        </p>
      </div>
      <StackingCards totalCards={products.length} scaleMultiplier={0.02} className="mx-auto mt-14 max-w-[72rem]">
        {products.map((p, i) => (
          <StackingCardItem key={p.slug} index={i} className="h-[min(78svh,40rem)]" topPosition={`${5.5 + i * 0.5}rem`}>
            <article className="tile grid h-[92%] overflow-hidden bg-white shadow-[0_2px_24px_rgb(0_0_0/0.06)] wide:grid-cols-2">
              <div className="flex flex-col justify-end gap-5 p-[clamp(1.5rem,4vw,3.5rem)]">
                <h3 className="text-h1 font-semibold">{p.label}</h3>
                <p className="max-w-[44ch] text-muted">{strip(p.lede)}</p>
                <a href={`#${p.slug}`} className="more text-lead">
                  Learn more
                </a>
              </div>
              <div className="relative min-h-44 bg-white">
                <Image
                  src={p.image.src}
                  alt={p.image.alt}
                  fill
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className="object-contain p-[6%]"
                />
              </div>
            </article>
          </StackingCardItem>
        ))}
      </StackingCards>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** Seven extinguisher types behind an Apple segmented control. */
export function Specs() {
  const types = page("types-of-fire-extinguisher")!;
  const specs = types.blocks.filter((b): b is Extract<Block, { type: "specs" }> => b.type === "specs");
  const intro = types.blocks.find((b): b is Extract<Block, { type: "prose" }> => b.type === "prose")!;
  const [at, setAt] = useState(0);
  const s = specs[at];

  return (
    <section id="specs" data-ground="light" className="bg-white px-gutter py-section-lg">
      <div className="mx-auto max-w-[72rem]">
        <div className="max-w-[46rem]">
          <Headline>Every extinguisher, by the numbers</Headline>
          <p className="mt-5 text-lead text-muted">
            <Rich text={intro.body[0]} />
          </p>
        </div>

        <div role="tablist" aria-label="Extinguisher type" className="mt-10 -mx-gutter overflow-x-auto px-gutter [scrollbar-width:none]">
          <div className="inline-flex gap-1 rounded-full bg-paper p-1">
            {specs.map((x, i) => (
              <button
                key={x.heading}
                role="tab"
                id={`spec-tab-${i}`}
                aria-selected={i === at}
                aria-controls="spec-panel"
                onClick={() => setAt(i)}
                className="whitespace-nowrap rounded-full px-4 py-2 text-small transition-[background-color,color,box-shadow] duration-300 aria-selected:bg-white aria-selected:font-medium aria-selected:shadow-[0_1px_4px_rgb(0_0_0/0.12)] hover:text-ink text-muted aria-selected:text-ink"
              >
                {x.heading.replace(/ —.*$/, "").replace(" type", "")}
              </button>
            ))}
          </div>
        </div>

        <div id="spec-panel" role="tabpanel" aria-labelledby={`spec-tab-${at}`} className="mt-10 grid gap-x-16 gap-y-8 wide:grid-cols-12">
          <div className="wide:col-span-4">
            <div key={s.image?.src} className="card relative aspect-square overflow-hidden bg-paper">
              {s.image && <Image src={s.image.src} alt={s.image.alt} fill sizes="22rem" className="object-contain p-[8%] mix-blend-multiply" />}
            </div>
            <h3 className="mt-6 text-h3 font-semibold">{s.heading}</h3>
            {s.suitable && <p className="mt-3 text-small text-muted">{s.suitable}</p>}
          </div>
          {/* Keyed so every switch re-runs the number tickers. */}
          <SpecTable key={at} rows={s.rows} columns={s.columns} className="wide:col-span-8" />
        </div>
        <p className="mt-10">
          <a href="#types-of-fire-extinguisher" className="more">
            Read the complete guide
          </a>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** The four services as an Apple bento: one large tile, three smaller. */
export function Services() {
  return (
    <section id="services" data-ground="dark" className="on-black px-gutter py-section-lg">
      <div className="mx-auto max-w-[72rem]">
        <Headline className="max-w-[18ch]">Looked after, all year</Headline>
        <p className="mt-5 max-w-[52ch] text-lead text-muted-dark">{strip(page("services")!.lede)}</p>
        <ul className="mt-12 grid gap-grid wide:grid-cols-3 wide:grid-rows-2">
          {services.map((p, i) => (
            <li key={p.slug} className={i === 0 ? "wide:col-span-2 wide:row-span-2" : ""}>
              <a href={`#${p.slug}`} className="tile group relative flex h-full min-h-[22rem] flex-col overflow-hidden bg-graphite">
                <div className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10]" : "aspect-[16/9]"}`}>
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 46rem, 100vw" : "(min-width: 1024px) 23rem, 100vw"}
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-[clamp(1.25rem,2.5vw,2rem)]">
                  <h3 className={i === 0 ? "text-h2 font-semibold" : "text-h3 font-semibold"}>{p.title}</h3>
                  <p className="text-muted-dark">{strip(p.lede)}</p>
                  <span className="more mt-auto">Learn more</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** By sector, the agents that suit it — a native scroll-snap carousel. */
export function Sectors() {
  const { heading, intro, items } = home.sectors;
  const track = useRef<HTMLUListElement>(null);
  const nudge = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section id="sectors" data-ground="light" className="bg-white py-section-lg">
      <div className="mx-auto flex max-w-[72rem] flex-wrap items-end justify-between gap-6 px-gutter">
        <div className="max-w-[46rem]">
          <Headline>{heading}</Headline>
          <p className="mt-5 text-lead text-muted">
            <Rich text={intro} />
          </p>
        </div>
        <div className="flex gap-2" aria-label="Scroll sectors">
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              onClick={() => nudge(d)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-h3 leading-none transition-colors duration-300 hover:bg-[#e8e8ed]"
              aria-label={d < 0 ? "Previous sector" : "Next sector"}
            >
              <span aria-hidden="true">{d < 0 ? "‹" : "›"}</span>
            </button>
          ))}
        </div>
      </div>
      <ul
        ref={track}
        className="mt-12 flex snap-x snap-mandatory gap-grid overflow-x-auto scroll-px-gutter px-gutter pb-4 [scrollbar-width:none]"
      >
        {items.map((it) => (
          <li key={it.name} className="w-[min(82vw,26rem)] shrink-0 snap-start">
            <article className="tile overflow-hidden bg-paper">
              <div className="relative aspect-[4/5]">
                <Image src={it.image.src} alt={it.image.alt} fill sizes="26rem" className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-h3 font-semibold">{it.name}</h3>
                <p className="mt-2 text-small text-muted">{it.types.join(", ")}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/* A fire hose, uncoiled across the section. 1600 × 640 user units. */
const HOSE =
  "M -80 470 C 120 470 220 300 420 300 C 640 300 640 520 860 520 C 1080 520 1100 220 1320 200 C 1460 188 1560 260 1700 300";

/** Hydrant equipment riding along a fire hose. */
export function Equipment() {
  const { heading, body, items } = home.equipment;
  return (
    <section id="equipment" data-ground="dark" className="on-black relative overflow-hidden pt-section-lg pb-section">
      <div className="mx-auto max-w-[72rem] px-gutter text-center">
        <Headline>{heading}</Headline>
        <p className="mx-auto mt-5 max-w-[52ch] text-lead text-muted-dark">{body}</p>
      </div>
      <div className="relative mt-6 h-[clamp(18rem,44vw,40rem)] text-fire-deep [&_path]:[stroke-linecap:round] [&_path]:[stroke-width:20px]">
        <MarqueeAlongSvgPath
          path={HOSE}
          pathId="uf-hose"
          viewBox="0 0 1600 640"
          showPath
          responsive
          baseVelocity={4}
          useScrollVelocity
          slowdownOnHover
          repeat={1}
          enableRollingZIndex={false}
          className="h-full w-full"
        >
          {items.map((it) => (
            <figure key={it.name} className="-translate-x-1/2 -translate-y-1/2">
              <div className="relative h-36 w-36 overflow-hidden rounded-full bg-white ring-4 ring-black">
                <Image src={it.image.src} alt={it.image.alt} fill sizes="9rem" className="object-contain p-4" />
              </div>
              <figcaption className="mt-2 w-36 text-center text-small text-paper">{it.name}</figcaption>
            </figure>
          ))}
        </MarqueeAlongSvgPath>
      </div>
      <p className="text-center">
        <a href="#fire-hydrant-system" className="more">
          Explore hydrant systems
        </a>
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** Why us — the heading thickens toward the cursor. */
export function Why() {
  const { heading, body, items } = home.why;
  const box = useRef<HTMLDivElement>(null);
  return (
    <section id="why" data-ground="light" className="bg-white px-gutter py-section-lg">
      <div ref={box} className="mx-auto max-w-[72rem]">
        <VariableFontCursorProximity
          as="h2"
          className="text-[clamp(3rem,10vw,8rem)] leading-[0.95] font-[300] tracking-[-0.035em]"
          fromFontVariationSettings="'wght' 300"
          toFontVariationSettings="'wght' 800"
          radius={180}
          falloff="gaussian"
          containerRef={box}
        >
          {heading}
        </VariableFontCursorProximity>
        <p className="mt-8 max-w-[58ch] text-lead text-muted">
          <Rich text={body} />
        </p>
        <ul className="mt-14 grid gap-grid wide:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="tile flex flex-col bg-paper p-8">
              <h3 className="text-h3 font-semibold">{it.title}</h3>
              <p className="mt-3 text-muted">{it.text}</p>
              <a href={it.href} className="more mt-6">
                Learn more
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** The fire licence, with its certificate opening between the words. */
export function Licence() {
  const { first, second, media, href } = home.licence;
  return (
    <section id="licence" data-ground="light" className="bg-white px-gutter pb-section-lg">
      <a href={href} className="block" aria-label="Need a fire licence? We handle the application">
        <Statement first={first} second={second} media={media} />
        <span className="mt-6 block text-center text-lead text-muted">
          We handle the application, inspections and liaison with the authorities.{" "}
          <span className="more">Learn more</span>
        </span>
      </a>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

export function Contact() {
  return (
    <section id="contact" data-ground="light" className="bg-paper px-gutter py-section-lg">
      <div className="mx-auto max-w-[72rem]">
        <Enquiry />
      </div>
    </section>
  );
}

