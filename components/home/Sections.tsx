"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useInView } from "motion/react";
import { home, page, products, services, type Block } from "@/lib/content";
import Rich from "@/components/ui/Rich";
import { prefersReduced } from "@/lib/motion";
import { SpecTable, Statement } from "@/components/Blocks";
import Enquiry, { MapFrame } from "@/components/Enquiry";
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

/** Who we are in a paragraph, four facts under hairlines, and the managing partner. */
export function About() {
  const { heading, body, facts } = home.about;
  const person = page("about-us")!.blocks.find((b): b is Extract<Block, { type: "person" }> => b.type === "person")!;
  return (
    <section id="about" data-ground="light" className="bg-white px-gutter py-section-lg">
      <div className="mx-auto grid max-w-[72rem] gap-x-16 gap-y-10 wide:grid-cols-12 wide:items-end">
        <div className="wide:col-span-8">
          <Headline>{heading}</Headline>
          <p className="mt-5 max-w-[56ch] text-lead text-muted">
            <Rich text={body} />
          </p>
          <dl className="mt-10 grid gap-x-grid gap-y-6 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.term} className="border-t border-[var(--rule)] pt-4">
                <dt className="font-semibold">{f.term}</dt>
                <dd className="mt-1 text-muted">{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Phones: a small portrait beside the name. Desktop: a column of its own. */}
        <figure className="flex items-center gap-5 wide:col-span-4 wide:block">
          <div className="card relative aspect-[4/5] w-28 shrink-0 overflow-hidden bg-paper wide:w-full">
            <Image src={person.image.src} alt={person.image.alt} fill sizes="(min-width: 1024px) 22rem, 7rem" className="object-cover object-[50%_25%]" />
          </div>
          <figcaption className="wide:mt-4">
            <p className="text-h3 font-semibold">{person.name}</p>
            <p className="mt-1 text-muted">{person.role}</p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/** Every product as a card that stacks as you scroll; each opens its sheet. */
export function Products() {
  const intro = home.intro;
  return (
    // pb: each stacked card sits up to 9.5rem below its own box (topPosition);
    // without the room it would hang over the next section's heading.
    <section id="products" data-ground="light" className="bg-paper px-gutter pt-section-lg pb-[10rem]">
      <div className="mx-auto max-w-[72rem] text-center">
        <Headline>{intro.heading}</Headline>
        <p className="mx-auto mt-5 max-w-[60ch] text-lead text-muted">
          <Rich text={intro.body[0]} />
        </p>
      </div>
      <StackingCards totalCards={products.length} scaleMultiplier={0.02} className="mx-auto mt-14 max-w-[72rem]">
        {products.map((p, i) => (
          <StackingCardItem key={p.slug} index={i} className="h-[min(78svh,40rem)]" topPosition={`${5.5 + i * 0.5}rem`}>
            {/* Phones: the picture fills the top of the card, the words sit under it. */}
            <article className="tile grid h-[92%] grid-rows-[minmax(0,1fr)_auto] overflow-hidden bg-white shadow-[0_2px_24px_rgb(0_0_0/0.06)] wide:grid-cols-2 wide:grid-rows-1">
              <div className="flex flex-col justify-end gap-3 p-[clamp(1.25rem,4vw,3.5rem)] wide:gap-5">
                <h3 className="text-h2 font-semibold wide:text-h1">{p.label}</h3>
                <p className="max-w-[44ch] text-muted">{strip(p.lede)}</p>
                <a href={`#${p.slug}`} className="more text-lead">
                  Learn more
                </a>
              </div>
              <div className="relative order-first min-h-0 bg-white wide:order-last">
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

/**
 * Seven extinguisher types behind an Apple segmented control. Desktop: one
 * screen — the heading on one line, the photo beside the table.
 *
 * The types advance on their own every 10 seconds: a countdown line under the
 * selected tab runs out and the next one shows. It holds (and picks up where it
 * left off) while the pointer or keyboard focus is on the tabs, the photo or
 * the table, and while the section is off screen; a click picks a type and
 * starts the 10 seconds again. Not under reduced motion.
 */
export function Specs() {
  const types = page("types-of-fire-extinguisher")!;
  const specs = types.blocks.filter((b): b is Extract<Block, { type: "specs" }> => b.type === "specs");
  const [at, setAt] = useState(0);
  const [near, setNear] = useState(false);
  const s = specs[at];
  const scope = useRef<HTMLElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const held = useRef({ pointer: false, keys: false });

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting));
    io.observe(scope.current!);
    return () => io.disconnect();
  }, [scope]);

  // The countdown, in script rather than a CSS animation, so it can hold and
  // resume where it paused. Time only adds up while nothing holds it, so it resumes where it paused;
  // a new tab, or coming back on screen, starts a fresh 10 seconds.
  useEffect(() => {
    if (!near || prefersReduced()) return;
    let spent = 0;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      if (!held.current.pointer && !held.current.keys) spent += Math.max(0, now - last); // a frame's stamp can predate the start
      last = now;
      // `scale`, not transform: it is what the bar's scale-x-0 class sets.
      bar.current?.style.setProperty("scale", `${Math.min(1, spent / 10000)} 1`);
      if (spent >= 10000) setAt((n) => (n + 1) % specs.length);
      else raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [at, near, specs.length]);

  // Phones: keep the selected tab in the strip's view as they advance.
  useEffect(() => {
    const list = tabs.current;
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    const l = list.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    if (t.left < l.left || t.right > l.right) list.scrollBy({ left: t.left - l.left - 16, behavior: "smooth" });
  }, [at]);

  return (
    <section ref={scope} id="specs" data-ground="light" className="bg-white px-gutter py-section-lg wide:frame">
      <div className="mx-auto w-full max-w-[72rem]">
        <Headline className="wide:whitespace-nowrap">Every extinguisher, by the numbers</Headline>

        {/* The pointer, or keyboard focus, in here holds the countdown. */}
        <div
          onPointerEnter={() => (held.current.pointer = true)}
          onPointerLeave={() => (held.current.pointer = false)}
          onFocus={(e) => (held.current.keys = e.target.matches(":focus-visible"))}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && (held.current.keys = false)}
        >
          <div ref={tabs} role="tablist" aria-label="Extinguisher type" className="mt-10 -mx-gutter wide:mt-[clamp(1rem,3svh,2rem)] overflow-x-auto px-gutter [scrollbar-width:none]">
            <div className="inline-flex gap-1 rounded-full bg-paper p-1">
              {specs.map((x, i) => (
                <button
                  key={x.heading}
                  role="tab"
                  id={`spec-tab-${i}`}
                  aria-selected={i === at}
                  aria-controls="spec-panel"
                  onClick={() => setAt(i)}
                  className="relative whitespace-nowrap rounded-full px-4 py-2 text-small transition-[background-color,color,box-shadow] duration-300 aria-selected:bg-white aria-selected:font-medium aria-selected:shadow-[0_1px_4px_rgb(0_0_0/0.12)] hover:text-ink text-muted aria-selected:text-ink"
                >
                  {x.heading.replace(/ —.*$/, "").replace(" type", "")}
                  {i === at && (
                    <span ref={bar} aria-hidden="true" className="absolute inset-x-4 bottom-1 h-[1.5px] origin-left scale-x-0 rounded-full bg-fire/60" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            id="spec-panel"
            role="tabpanel"
            aria-labelledby={`spec-tab-${at}`}
            className="mt-10 grid gap-x-12 gap-y-8 wide:mt-[clamp(1rem,3svh,2rem)] wide:grid-cols-12"
          >
            {/* Desktop: as tall as the table beside it. */}
            <div key={s.image?.src} className="card relative aspect-square overflow-hidden bg-paper wide:col-span-4 wide:aspect-auto">
              {s.image && <Image src={s.image.src} alt={s.image.alt} fill sizes="22rem" className="object-contain p-[8%] mix-blend-multiply" />}
            </div>
            <div className="wide:col-span-8">
              <h3 className="text-h3 font-semibold">{s.heading}</h3>
              {s.suitable && <p className="mt-2 text-small text-muted">{s.suitable}</p>}
              {/* Keyed so every switch re-runs the number tickers. Rows tighten on short screens. */}
              <SpecTable key={at} rows={s.rows} columns={s.columns} className="mt-4 wide:[--row:clamp(0.35rem,1.1svh,0.75rem)]" />
            </div>
          </div>
        </div>
        <p className="mt-10 wide:mt-[clamp(1rem,3svh,2rem)]">
          <a href="#types-of-fire-extinguisher" className="more">
            Read the complete guide
          </a>
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------ */

/**
 * The four services as an Apple bento: one large tile, three smaller.
 * Desktop: one screen — the large tile down the left, the three
 * as image-beside-words tiles stacked on the right, all filling what is left.
 */
export function Services() {
  return (
    <section id="services" data-ground="dark" className="on-black px-gutter py-section-lg wide:frame">
      <div className="mx-auto flex min-h-0 w-full max-w-[72rem] flex-1 flex-col">
        <Headline className="max-w-[18ch]">Looked after, all year</Headline>
        <p className="mt-5 max-w-[52ch] text-lead text-muted-dark wide:mt-[clamp(0.5rem,1.5svh,1.25rem)]">{strip(page("services")!.lede)}</p>
        <ul className="mt-12 grid gap-grid wide:mt-[clamp(1.25rem,4svh,3rem)] wide:min-h-0 wide:flex-1 wide:grid-cols-2 wide:grid-rows-3">
          {services.map((p, i) => (
            <li key={p.slug} className={i === 0 ? "wide:row-span-3" : "wide:min-h-0"}>
              <a
                href={`#${p.slug}`}
                className={`tile group relative flex h-full overflow-hidden bg-graphite ${i === 0 ? "min-h-[22rem] flex-col" : "min-h-[8.5rem] flex-row wide:min-h-0"}`}
              >
                <div
                  className={`relative overflow-hidden ${i === 0 ? "aspect-[16/10] wide:aspect-auto wide:min-h-0 wide:flex-1" : "w-[40%] shrink-0"}`}
                >
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 46rem, 100vw" : "(min-width: 1024px) 23rem, 100vw"}
                    className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  />
                </div>
                <div
                  className={`flex flex-col p-[clamp(1rem,2.5vw,2rem)] wide:gap-[clamp(0.25rem,1svh,0.75rem)] wide:p-[clamp(1rem,2.6svh,1.75rem)] ${i === 0 ? "gap-3" : "min-w-0 flex-1 gap-1.5"}`}
                >
                  <h3 className={i === 0 ? "text-h2 font-semibold" : "text-h3 font-semibold"}>{p.title}</h3>
                  {/* Small tiles: a two-line teaser (one on short desktop screens); the sheet has the rest. */}
                  <p className={`text-muted-dark ${i === 0 ? "" : "line-clamp-2 text-small [@media(max-height:720px)]:wide:line-clamp-1"}`}>
                    {strip(p.lede)}
                  </p>
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

/**
 * By sector, the agents that suit it: a native scroll-snap row of photos with
 * its own buttons. Scrolling the page never moves it sideways.
 */
export function Sectors() {
  const { heading, intro, items } = home.sectors;
  const track = useRef<HTMLUListElement>(null);
  const nudge = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section id="sectors" data-ground="light" className="group frame overflow-x-clip bg-white">
      <div className="mx-auto w-full max-w-[72rem] px-gutter">
        <Headline>{heading}</Headline>
        <div className="mt-4 max-w-[44rem]">
          <p className="text-body text-muted">
            <Rich text={intro} />
          </p>
          <div className="mt-6 flex gap-2 group-data-[driven]:hidden" aria-label="Scroll sectors">
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
      </div>
      {/* The cards take the rest of the screen; the photos crop to fit. */}
      <ul
        ref={track}
        className="mt-[clamp(1.5rem,5svh,3rem)] flex max-h-[38rem] min-h-0 flex-1 snap-x snap-mandatory gap-grid overflow-x-auto scroll-px-gutter px-gutter pb-4 [scrollbar-width:none] group-data-[driven]:snap-none group-data-[driven]:overflow-visible"
      >
        {items.map((it) => (
          <li key={it.name} className="flex w-[min(82vw,26rem)] shrink-0 snap-start">
            <article className="tile flex w-full flex-col overflow-hidden bg-paper">
              <div className="relative min-h-0 flex-1">
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

/* A fire hose, uncoiled across the section. 1600 × 400 user units: wide
   enough that the width sets its scale on any desktop screen. */
const HOSE =
  "M -80 277 C 120 277 220 164 420 164 C 640 164 640 310 860 310 C 1080 310 1100 111 1320 98 C 1460 90 1560 138 1700 164";

/** Hydrant equipment riding along a fire hose. */
export function Equipment() {
  const { heading, body, items } = home.equipment;
  // The hose's pictures only travel while it is near the screen: the marquee
  // otherwise updates a dozen positions every frame, all the way down the page.
  const hose = useRef<HTMLDivElement>(null);
  const near = useInView(hose, { margin: "200px 0px" });
  return (
    <section id="equipment" data-ground="dark" className="frame on-black relative overflow-hidden">
      <div className="mx-auto max-w-[72rem] px-gutter text-center">
        <Headline>{heading}</Headline>
        <p className="mx-auto mt-5 max-w-[52ch] text-lead text-muted-dark">{body}</p>
      </div>
      {/* Phones: the hose three screens wide, centred, so its pictures are big enough to read. */}
      <div ref={hose} className="relative mt-6 min-h-0 flex-1 text-fire-deep max-[760px]:-ml-[100vw] max-[760px]:w-[300vw] [&_path]:[stroke-linecap:round] [&_path]:[stroke-width:20px] [&_svg]:overflow-visible">
        <MarqueeAlongSvgPath
          path={HOSE}
          pathId="uf-hose"
          viewBox="0 0 1600 400"
          showPath
          responsive
          baseVelocity={near ? 4 : 0}
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
    <section id="why" data-ground="light" className="bg-white px-gutter py-section-lg wide:frame">
      <div ref={box} className="mx-auto w-full max-w-[72rem]">
        {/* Desktop: one line, with room for letters to thicken without rewrapping. */}
        <VariableFontCursorProximity
          as="h2"
          className="text-[clamp(3rem,10vw,8rem)] leading-[0.95] font-[300] tracking-[-0.035em] wide:text-[clamp(3rem,min(7.5vw,12svh),7rem)]"
          fromFontVariationSettings="'wght' 300"
          toFontVariationSettings="'wght' 800"
          radius={180}
          falloff="gaussian"
          containerRef={box}
        >
          {heading}
        </VariableFontCursorProximity>
        <p className="mt-8 max-w-[58ch] text-lead text-muted wide:mt-[clamp(1rem,3svh,2rem)]">
          <Rich text={body} />
        </p>
        <ul className="mt-14 grid gap-grid wide:mt-[clamp(1.5rem,5svh,3.5rem)] wide:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="tile flex flex-col bg-paper p-8 wide:p-[clamp(1.25rem,3.5svh,2rem)]">
              <h3 className="text-h3 font-semibold">{it.title}</h3>
              <p className="mt-3 text-muted">{it.text}</p>
              <a href={it.href} className="more mt-6 wide:mt-[clamp(1rem,2.5svh,1.5rem)]">
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

/**
 * The enquiry on a liquid-glass card, Kickstart's proportions (one 42rem
 * column), over the map as a full-bleed plate — grey until someone uses it.
 * The offices are in the footer just below.
 */
export function Contact() {
  return (
    <section id="contact" data-ground="light" className="relative overflow-hidden bg-paper px-gutter py-section-lg wide:frame">
      <MapFrame className="absolute inset-0" />
      <div className="relative mx-auto w-full max-w-[42rem]">
        <Enquiry />
      </div>
    </section>
  );
}

