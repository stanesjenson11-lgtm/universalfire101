"use client";

import { useEffect } from "react";

/**
 * Opens a sheet when a link points at it (#fire-extinguisher) or the page
 * arrives with that hash (the old WordPress URLs redirect here). Tells
 * SmoothScroll to hold the page still while a sheet is open.
 */
export default function DetailController() {
  useEffect(() => {
    const sheet = (hash: string) => {
      const el = hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
      return el instanceof HTMLDialogElement ? el : null;
    };
    const open = (d: HTMLDialogElement) => {
      document.querySelectorAll<HTMLDialogElement>("dialog[open]").forEach((o) => o !== d && o.close());
      if (!d.open) d.showModal();
      d.scrollTop = 0;
      window.dispatchEvent(new CustomEvent("uf:hold", { detail: true }));
    };

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      const d = a && sheet(a.getAttribute("href") ?? "");
      if (!d) return;
      e.preventDefault();
      e.stopPropagation();
      open(d);
    };
    // Capture phase: runs before SmoothScroll's anchor handler would try to
    // scroll to a dialog.
    document.addEventListener("click", onClick, true);

    const onClose = (e: Event) => {
      if (!(e.target instanceof HTMLDialogElement)) return;
      window.dispatchEvent(new CustomEvent("uf:hold", { detail: false }));
      if (sheet(location.hash) === e.target) history.replaceState(null, "", location.pathname);
    };
    document.addEventListener("close", onClose, true);

    const fromHash = () => {
      const d = sheet(location.hash);
      if (d) open(d);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);

    // A click on the backdrop (outside the sheet's box) closes it.
    const onBackdrop = (e: MouseEvent) => {
      const d = e.target;
      if (!(d instanceof HTMLDialogElement) || !d.open) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    };
    document.addEventListener("click", onBackdrop);

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("close", onClose, true);
      document.removeEventListener("click", onBackdrop);
      window.removeEventListener("hashchange", fromHash);
    };
  }, []);

  return null;
}
