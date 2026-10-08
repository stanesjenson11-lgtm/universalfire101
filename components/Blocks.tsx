import Image from "next/image";
import type { Block } from "@/lib/content";
import { imagePath } from "@/lib/image-loader";
import Plate from "@/components/ui/Plate";
import Rich from "@/components/ui/Rich";
import Num from "@/components/ui/Num";
import { MediaBetweenText } from "@/components/fancy/blocks/media-between-text";

/* The body of every product and service sheet. Each block opens with the same
   hairline and rhythm; what is inside varies with what it carries. */
const row = "border-t border-[var(--rule)] py-12 first:border-t-0 first:pt-0";
const h2 = "text-h3 font-semibold";

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "prose":
      return (
        <section className={`${row} grid gap-x-10 gap-y-6 wide:grid-cols-12`}>
          {b.heading && <h3 className={`${h2} wide:col-span-4`}>{b.heading}</h3>}
          <div className={`flex flex-col gap-4 ${b.heading ? "wide:col-span-8" : "wide:col-span-12"}`}>
            {b.body.map((p, i) => (
              <p key={i} className="u-measure">
                <Rich text={p} />
              </p>
            ))}
            {b.bullets && (
              <ul className="u-measure border-t border-[var(--rule)]">
                {b.bullets.map((x) => (
                  <li key={x} className="border-b border-[var(--rule)] py-3">
                    <Rich text={x} />
                  </li>
                ))}
              </ul>
            )}
            {b.image && (
              <Plate
                src={b.image.src}
                alt={b.image.alt}
                contain={b.figure}
                scale={!b.figure}
                sizes="(min-width: 1024px) 40rem, 100vw"
                className={`card mt-2 ${b.figure ? "aspect-[4/3]" : "aspect-[3/2]"}`}
              />
            )}
          </div>
        </section>
      );

    case "specs":
      return (
        <section className={`${row} grid gap-x-10 gap-y-6 wide:grid-cols-12`}>
          <div className="wide:col-span-4">
            <h3 className={h2}>{b.heading}</h3>
            {b.suitable && <p className="mt-3 text-small text-muted">{b.suitable}</p>}
            {b.text && <p className="mt-3 text-small">{b.text}</p>}
            {b.image && (
              <Plate src={b.image.src} alt={b.image.alt} contain sizes="18rem" className="card mt-5 aspect-square max-w-[18rem]" />
            )}
          </div>
          <SpecTable rows={b.rows} columns={b.columns} className="wide:col-span-8" />
        </section>
      );

    case "parts":
      return (
        <section className={row}>
          <h3 className={h2}>{b.heading}</h3>
          {b.intro && (
            <p className="u-measure mt-3">
              <Rich text={b.intro} />
            </p>
          )}
          <ul className="mt-8 grid gap-x-grid gap-y-8 [grid-template-columns:repeat(auto-fill,minmax(min(100%,13rem),1fr))]">
            {b.items.map((it) => (
              <li key={it.name}>
                <div className="card relative aspect-square overflow-hidden bg-paper">
                  <Image src={it.image.src} alt={it.image.alt} fill sizes="13rem" className="object-contain p-[12%] mix-blend-multiply" />
                </div>
                <h4 className="mt-3 font-semibold">{it.name}</h4>
                {it.text && <p className="mt-1 text-small text-muted">{it.text}</p>}
              </li>
            ))}
          </ul>
        </section>
      );

    case "points":
      return (
        <section className={`${row} grid gap-x-10 gap-y-6 wide:grid-cols-12`}>
          <div className="wide:col-span-4">
            <h3 className={h2}>{b.heading}</h3>
            {b.intro && (
              <p className="mt-3 text-muted">
                <Rich text={b.intro} />
              </p>
            )}
          </div>
          <ul className="wide:col-span-8">
            {b.items.map((it) => (
              <li key={it.title} className="grid gap-1 border-b border-[var(--rule)] py-4 first:pt-0 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <h4 className="font-semibold">{it.title}</h4>
                <p>
                  {it.text}
                  {it.href && (
                    <>
                      {" "}
                      <a href={it.href} className="more">
                        More
                      </a>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>
      );

    case "gallery":
      return (
        <section className={`${row} grid grid-cols-2 gap-grid wide:grid-cols-3`}>
          {b.images.map((im, i) => (
            <Plate
              key={im.src}
              src={im.src}
              alt={im.alt}
              sizes="(min-width: 1024px) 22rem, 50vw"
              className={`card ${i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-[4/3]"}`}
            />
          ))}
        </section>
      );

    case "certs":
      return (
        <section className={`${row} grid gap-x-10 gap-y-6 wide:grid-cols-12`}>
          <div className="wide:col-span-4">
            <h3 className={h2}>{b.heading}</h3>
            <p className="mt-3 text-muted">{b.intro}</p>
          </div>
          <div className="wide:col-span-8">
            <ul className="border-t border-[var(--rule)]">
              {b.items.map((c) => (
                <li key={c} className="border-b border-[var(--rule)] py-3">
                  {c}
                </li>
              ))}
            </ul>
            {b.image && (
              <div className="relative mt-6 aspect-[5/1] max-w-xl">
                <Image src={b.image.src} alt={b.image.alt} fill sizes="36rem" className="object-contain object-left" />
              </div>
            )}
          </div>
        </section>
      );

    case "person":
      return (
        <section className={`${row} flex flex-wrap items-center gap-5`}>
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-paper">
            <Image src={b.image.src} alt={b.image.alt} fill sizes="6rem" className="object-cover" />
          </div>
          <div>
            <p className="text-h3 font-semibold">{b.name}</p>
            <p className="text-muted">{b.role}</p>
          </div>
        </section>
      );

    case "statement":
      return (
        <section className={`${row} overflow-hidden`}>
          <Statement first={b.first} second={b.second} media={b.media} />
        </section>
      );

    default:
      return null;
  }
}

/** Performance data. Every free-standing number counts up when it scrolls in. */
export function SpecTable({
  rows,
  columns,
  className = "",
}: {
  rows: [string, ...string[]][];
  columns?: string[];
  className?: string;
}) {
  return (
    <dl className={`text-small ${className}`}>
      {columns && (
        <div className="grid grid-cols-[minmax(9rem,2fr)_3fr] gap-4 border-b border-ink pb-[var(--row,0.75rem)] font-semibold">
          <dt>Performance data</dt>
          <dd className="flex flex-wrap gap-x-6 gap-y-1">
            {columns.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </dd>
        </div>
      )}
      {rows.map(([label, ...values]) => (
        <div key={label} className="grid grid-cols-[minmax(9rem,2fr)_3fr] gap-4 border-b border-[var(--rule)] py-[var(--row,0.75rem)]">
          <dt className="text-muted">{label}</dt>
          <dd className="flex flex-wrap gap-x-6 gap-y-1 font-medium tabular-nums">
            {values.map((v, i) => (
              <span key={i}>
                <Num>{v}</Num>
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Words with a photograph opening between them as they scroll in. */
export function Statement({ first, second, media }: { first: string; second: string; media: { src: string; alt: string } }) {
  return (
    <MediaBetweenText
      as="span"
      firstText={first}
      secondText={second}
      mediaUrl={imagePath(media.src, 1080)}
      mediaType="image"
      alt={media.alt}
      triggerType="inView"
      useInViewOptionsProp={{ once: true, amount: 0.6 }}
      animationVariants={{
        initial: { width: 0, opacity: 0.4 },
        animate: { width: "auto", opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
      }}
      className="flex-wrap items-center justify-center gap-x-[0.2em] text-center text-[clamp(2.75rem,8.5vw,6.5rem)] leading-[1.02] font-semibold tracking-[-0.03em]"
      mediaContainerClassName="h-[0.8em] overflow-hidden rounded-full [&_img]:aspect-[2/1] [&_img]:h-full [&_img]:w-auto [&_img]:max-w-none"
    />
  );
}
