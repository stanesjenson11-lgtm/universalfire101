import { site, wa } from "@/lib/content";
import CityScene from "./CityScene";

/**
 * The page ends on the city at night (CityScene): firemen putting out fires,
 * one after another, behind the call to call. The words sit in its sky; the
 * spacer keeps the street and the buildings clear of them at every width.
 * The copyright row sits under the street, on plain black.
 */
export default function Footer() {
  return (
    <footer className="on-black">
      <div className="relative overflow-hidden">
        {/* Phones: the scene in a box at the foot, so its buildings stay under the (taller, stacked) words. */}
        <div className="absolute inset-x-0 bottom-0 h-full max-[760px]:h-[44rem]">
          <CityScene />
        </div>

        <div className="relative mx-auto max-w-[72rem] px-gutter pt-[clamp(4.5rem,12svh,8rem)]">
          <div className="flex flex-wrap items-end justify-between gap-x-grid gap-y-6">
            <div>
              <p className="text-h1 font-semibold">Available 24/7</p>
              <p className="mt-3 max-w-[44ch] text-lead text-muted-dark">Call us — a fire safety engineer answers, day or night.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${site.phone.tel}`} className="btn btn-fire tabular-nums">
                Call {site.phone.display}
              </a>
              <a href={wa("Hi Universal Fire, I have a fire safety enquiry.")} target="_blank" rel="noopener noreferrer" className="btn btn-line">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-x-grid gap-y-6 border-t border-[var(--rule-dark)] pt-6 text-small wide:mt-[clamp(2rem,6svh,4rem)] wide:grid-cols-3">
            {site.offices.map((o) => (
              <address key={o.city} className="not-italic">
                <h2 className="text-small font-semibold">{o.city}</h2>
                <p className="mt-1.5 text-muted-dark">
                  {o.lines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </p>
              </address>
            ))}
            <div className="col-span-2 wide:col-span-1">
              <h2 className="text-small font-semibold">Contact</h2>
              {/* One link a line, each a full tap target. */}
              <p className="mt-0.5 text-muted-dark">
                <a href={`mailto:${site.email}`} className="block py-1 break-all hover:text-paper hover:underline">
                  {site.email}
                </a>
                <a href={`tel:${site.phone2.tel}`} className="block py-1 tabular-nums hover:text-paper hover:underline">
                  {site.phone2.display}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* The street and the buildings: the scene's lower half shows through here. */}
        <div aria-hidden="true" className="h-[clamp(15rem,46svh,30rem)]" />
      </div>

      <div className="mx-auto flex max-w-[72rem] flex-wrap justify-between gap-x-6 gap-y-1 px-gutter py-3 text-micro text-muted-dark">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex gap-5">
          {[
            ["Facebook", site.facebook],
            ["Instagram", site.instagram],
            ["LinkedIn", site.linkedin],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-paper hover:underline">
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p>
          Powered by{" "}
          <a href="https://thearktech.in/" target="_blank" rel="noopener" className="text-paper hover:underline">
            TheArkTech
          </a>
        </p>
      </div>
    </footer>
  );
}
