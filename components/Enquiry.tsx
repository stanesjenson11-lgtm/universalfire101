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
export function MapFrame({ className }: { className: string }) {
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
    // The caller positions it. Grey (a quiet plate) until someone uses it.
    <div
      className={`group/map overflow-hidden ${className}`}
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
        className={`absolute inset-0 h-full w-full border-0 transition-[filter] duration-500 ${live ? "" : "[filter:grayscale(1)_contrast(0.9)_brightness(1.06)]"}`}
      />
      {!live && !ctrl && (
        <button
          ref={cover}
          type="button"
          onClick={() => {
            setLive(true);
            frame.current?.focus();
          }}
          className="group/cover absolute inset-0 flex cursor-pointer items-end justify-center p-4 pb-12"
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
    <form
      action="https://api.whatsapp.com/send"
      method="get"
      target="_blank"
      onSubmit={submit}
      className="tile uf-glass p-6 sm:p-8 wide:p-[clamp(1.25rem,3.5svh,2rem)]"
    >
      <h2 className="text-center text-h2 font-semibold">Send an enquiry</h2>
      <p className="mx-auto mt-2 max-w-[40ch] text-center text-muted">
        It opens WhatsApp with your message ready to send to {site.phone.display}.
      </p>
      <input type="hidden" name="phone" value={site.whatsapp} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 wide:mt-[clamp(0.75rem,2.5svh,1.5rem)] wide:gap-y-[clamp(0.6rem,1.6svh,1rem)]">
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
            rows={4}
            required
            placeholder="Building type, number of floors, what you have installed today…"
            className={`${field} resize-y placeholder:text-muted wide:h-[clamp(4.5rem,13svh,8rem)]`}
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 wide:mt-[clamp(0.75rem,2.5svh,1.5rem)]">
        <button type="submit" className="btn btn-fire">
          Send on WhatsApp
        </button>
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-small font-medium tabular-nums">
          <a href={`tel:${site.phone.tel}`} className="hover:text-fire">
            {site.phone.display}
          </a>
          <a href={`tel:${site.phone2.tel}`} className="hover:text-fire">
            {site.phone2.display}
          </a>
          <a href={`mailto:${site.email}`} className="break-all text-fire hover:underline">
            {site.email}
          </a>
        </p>
      </div>
    </form>
  );
}
