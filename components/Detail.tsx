import { pages, wa } from "@/lib/content";
import Blocks from "@/components/Blocks";
import Plate from "@/components/ui/Plate";
import Rich from "@/components/ui/Rich";
import DetailController from "@/components/DetailController";

/**
 * Every product and service, in full, as an Apple-style sheet — the old
 * site's inner pages. Rendered into the page HTML (closed), so search engines
 * and no-JS visitors still have every word; a link to #<slug> opens one.
 */
export default function Details() {
  const sheets = pages.filter((p) => p.group !== "company");
  return (
    <>
      {sheets.map((p) => (
        <dialog
          key={p.slug}
          id={p.slug}
          aria-labelledby={`${p.slug}-title`}
          data-lenis-prevent
          className="uf-dialog tile z-[var(--z-dialog)]"
        >
          <form method="dialog" className="pointer-events-none sticky top-0 z-[var(--z-sticky)] flex h-0 justify-end overflow-visible px-4 pt-4">
            <button className="btn pointer-events-auto !min-h-9 !px-4 !py-1 !text-small bg-paper/85 backdrop-blur-xl hover:bg-[#e8e8ed]">Done</button>
          </form>
          <article className="px-[clamp(1.25rem,4vw,3.5rem)] pt-16 pb-14">
            <header className="grid items-end gap-8 pb-12 wide:grid-cols-12">
              <div className="wide:col-span-7">
                <p className="text-small text-fire">{p.group === "products" ? "Product" : "Service"}</p>
                <h2 id={`${p.slug}-title`} className="mt-2 text-h1 font-semibold">
                  {p.title}
                </h2>
                <p className="mt-5 text-lead text-muted">
                  <Rich text={p.lede} />
                </p>
                <a
                  href={wa(`Hi Universal Fire, I'd like to know more about ${p.label.toLowerCase()}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-fire mt-7"
                >
                  Enquire on WhatsApp
                </a>
              </div>
              <Plate
                src={p.image.src}
                alt={p.image.alt}
                reveal={false}
                sizes="(min-width: 1024px) 26rem, 90vw"
                className="card aspect-[4/3] wide:col-span-5"
              />
            </header>
            <Blocks blocks={p.blocks} />
          </article>
        </dialog>
      ))}
      <DetailController />
    </>
  );
}
