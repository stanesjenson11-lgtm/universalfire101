"use client";

import { useEffect, useId, useRef, useState } from "react";
import { pages, site, wa } from "@/lib/content";

/**
 * The enquiry goes out as a WhatsApp message — no backend, no keys, works on
 * a static host. Without JS the form still posts: WhatsApp reads `phone` and
 * `text` from the query string, so the message box alone gets through.
 */
const needs = [...pages.filter((p) => p.group !== "company").map((p) => p.label), "Something else"];

export function composeEnquiry(f: Record<string, string>) {
  return [
    "Hi Universal Fire, I have a fire safety enquiry.",
    f.need && `Need: ${f.need}`,
    f.city && `Site: ${f.city}`,
    f.name && `Name: ${f.name}`,
    f.tel && `Phone: ${f.tel}`,
    f.text && `\n${f.text}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const field =
  "card mt-2 w-full border border-[#d2d2d7] bg-white px-4 py-3.5 text-ink transition-[border-color,box-shadow] duration-200 focus:border-fire focus:shadow-[0_0_0_4px_rgb(194_65_12/0.15)] focus:outline-none";

/**
 * The map lets the page scroll past it: a clear cover takes the wheel until
 * the map is clicked or Ctrl + scrolled (then it is the map's until the
 * pointer leaves), or while Ctrl is held. While the map has it, the page holds
 * still, so the map and the smooth scroll never fight over the wheel.
 */
function MapFrame({ className }: { className: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const cover = useRef<HTMLButtonElement>(null);
  const [live, setLive] = useState(false);
  const [ctrl, setCtrl] = useState(false);

  useEffect(() => {
    const key = (e: KeyboardEvent) => setCtrl(e.ctrlKey || e.metaKey);
    const blur = () => setCtrl(false);
    window.addEventListener("keydown", key);
    window.addEventListener("keyup", key);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("keyup", key);
      window.removeEventListener("blur", blur);
    };
  }, []);

  // Ctrl + wheel on the cover (Ctrl's keydown can miss us when key focus is
  // still in the map): the map takes over, and the page never zooms.
  useEffect(() => {
    const el = cover.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setLive(true);
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [live, ctrl]);

  useEffect(() => {
    if (!live) return;
    window.dispatchEvent(new CustomEvent("uf:hold", { detail: true }));
    return () => void window.dispatchEvent(new CustomEvent("uf:hold", { detail: false }));
  }, [live]);

  return (
    <div
      className={`group/map relative overflow-hidden ${className}`}
      onMouseLeave={() => {
        setLive(false);
        setCtrl(false);
        // Key focus back to the page, so its keys (Ctrl, arrows) reach it again.
        if (document.activeElement === frame.current) frame.current?.blur();
      }}
    >
      <iframe
        ref={frame}
        src={site.map}
        title="Universal Fire Safety Equipments, Coimbatore, on Google Maps"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="absolute inset-0 h-full w-full border-0"
      />
      {!live && !ctrl && (
        <button
          ref={cover}
          type="button"
          onClick={() => {
            setLive(true);
            frame.current?.focus();
          }}
          className="group/cover absolute inset-0 flex cursor-pointer items-center justify-center p-4"
        >
          <span className="rounded-full bg-ink/80 px-4 py-2 text-small text-white opacity-0 transition-opacity duration-300 group-hover/map:opacity-100 group-focus-visible/cover:opacity-100 [@media(hover:none)]:opacity-100">
            <span className="[@media(hover:none)]:hidden">Click to use the map, or hold Ctrl and scroll to zoom</span>
            <span className="hidden [@media(hover:none)]:inline">Tap to use the map</span>
          </span>
        </button>
      )}
    </div>
  );
}

export default function Enquiry() {
  const id = useId();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    window.open(wa(composeEnquiry(data)), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-x-grid gap-y-14 wide:grid-cols-12">
      <form
        action="https://api.whatsapp.com/send"
        method="get"
        target="_blank"
        onSubmit={submit}
        className="wide:col-span-6"
      >
        <h2 className="text-h2 font-semibold">Send an enquiry</h2>
        <p className="mt-3 max-w-[46ch] text-lead text-muted">
          It opens WhatsApp with your message ready to send to {site.phone.display}.
        </p>
        <input type="hidden" name="phone" value={site.whatsapp} />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 wide:mt-[clamp(1rem,3svh,2rem)] wide:gap-y-[clamp(0.75rem,2svh,1.25rem)]">
          <label className="text-small font-medium">
            Your name
            <input name="name" autoComplete="name" required className={field} />
          </label>
          <label className="text-small font-medium">
            Phone
            <input name="tel" type="tel" autoComplete="tel" inputMode="tel" className={field} />
          </label>
          <label className="text-small font-medium">
            Site location
            <select name="city" className={field} defaultValue="Coimbatore">
              <option>Coimbatore</option>
              <option>Chennai</option>
              <option>Elsewhere in Tamil Nadu</option>
            </select>
          </label>
          <label className="text-small font-medium">
            What do you need?
            <select name="need" className={field} defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {needs.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="text-small font-medium sm:col-span-2" htmlFor={`${id}-text`}>
            Message
            <textarea
              id={`${id}-text`}
              name="text"
              rows={5}
              required
              placeholder="Building type, number of floors, what you have installed today…"
              className={`${field} resize-y placeholder:text-muted wide:h-[clamp(5.5rem,16svh,9.5rem)]`}
            />
          </label>
        </div>

        <button type="submit" className="btn btn-fire mt-6 wide:mt-[clamp(1rem,3svh,1.5rem)]">
          Send on WhatsApp
        </button>
      </form>

      {/* Desktop: the map takes whatever height the form leaves. */}
      <div className="flex flex-col gap-10 wide:col-span-5 wide:col-start-8 wide:gap-[clamp(1rem,4svh,2.5rem)]">
        <div className="flex flex-col gap-2 text-h3 font-semibold tabular-nums">
          <a href={`tel:${site.phone.tel}`} className="hover:text-fire">
            {site.phone.display}
          </a>
          <a href={`tel:${site.phone2.tel}`} className="hover:text-fire">
            {site.phone2.display}
          </a>
          <a href={`mailto:${site.email}`} className="mt-1 break-all text-body font-normal text-fire hover:underline">
            {site.email}
          </a>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {site.offices.map((o) => (
            <address key={o.city} className="not-italic">
              <h3 className="text-h3 font-semibold">{o.city}</h3>
              <p className="mt-2 text-muted">
                {o.lines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </p>
            </address>
          ))}
        </div>

        <MapFrame className="tile aspect-[4/3] w-full bg-white wide:aspect-auto wide:min-h-32 wide:flex-1" />
      </div>
    </div>
  );
}
