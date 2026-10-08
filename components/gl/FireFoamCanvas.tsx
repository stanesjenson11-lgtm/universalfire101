"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { vertex, fragment, MAX_BLOBS } from "./fire-foam-shaders";
import { foamBlobs, foamSlots, fireLeft, SPREAD, THRESHOLD } from "@/lib/foam";
import { engaged, prefersReduced } from "@/lib/motion";
import { shot } from "@/lib/shot";

const PHONE = "(max-width: 620px)";

/**
 * The fire and the foam that puts it out, on one ogl canvas (Kickstart's
 * HeroCanvas setup: one triangle, a shader, a ResizeObserver, paused
 * off-screen). Reads shot.spray and shot.nozzle every frame.
 *
 * No WebGL or reduced motion: nothing mounts, and the section keeps its CSS
 * ground — white, text readable.
 */
export default function FireFoamCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReduced()) return;
    // Waits for someone to be here and the preloader to have lifted: the
    // shader compile is GPU work the first seconds do not need (it is below
    // the fold), and it would stall the preloader's frames.
    const mount = () => {
      const phone = window.matchMedia(PHONE).matches;

      let renderer: Renderer;
      try {
        renderer = new Renderer({ alpha: false, antialias: false, dpr: phone ? 0.5 : 0.6 });
      } catch {
        return;
      }
      const gl = renderer.gl;
      gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

      const count = phone ? 48 : MAX_BLOBS;
      let aspect = 1;
      let slots = foamSlots(count, aspect, shot.nozzle[0]);
      let slotsFor = shot.nozzle[0];
      const blobs = new Float32Array(MAX_BLOBS * 3);
      // ogl binds a uniform array only when the value passes Array.isArray —
      // a Float32Array does not — so the shader reads this plain copy.
      const blobUniform = new Array<number>(MAX_BLOBS * 3).fill(0);

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uRes: { value: [1, 1] },
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uFire: { value: 1 },
          uFlood: { value: 0 },
          uCount: { value: count },
          uBlobs: { value: blobUniform },
          uThreshold: { value: THRESHOLD },
          uSpread: { value: SPREAD },
        },
      });
      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      let last = -1;
      const resize = () => {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height);
        aspect = r.width / Math.max(1, r.height);
        slots = foamSlots(count, aspect, shot.nozzle[0]);
        slotsFor = shot.nozzle[0];
        program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
        program.uniforms.uAspect.value = aspect;
        last = -1;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);

      el.appendChild(gl.canvas);
      shot.live = true;
      el.closest("section")?.setAttribute("data-live", "");

      let raf = 0;
      const start = performance.now();
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const s = shot.spray;
        if (s >= 1 && last >= 1) return; // out and flat: nothing left to draw
        last = s;
        const u = program.uniforms;
        u.uTime.value = (now - start) / 1000;
        u.uFire.value = fireLeft(s);
        u.uFlood.value = Math.min(1, Math.max(0, (s - 0.9) / 0.1));
        // The layout spreads from the nozzle: re-lay it if the nozzle has moved
        // (it settles as the extinguisher lands, before any foam is out). On a
        // 0.03 grid, so it depends on where the nozzle is, not the path it took
        // there: a fast scroll and a slow one lay the same foam.
        const at = Math.round(shot.nozzle[0] / 0.03) * 0.03;
        if (at !== slotsFor) {
          slots = foamSlots(count, aspect, at);
          slotsFor = at;
        }
        foamBlobs(s, slots, shot.nozzle, aspect, blobs.subarray(0, count * 3), shot.nozzleDir);
        for (let i = 0; i < count * 3; i++) blobUniform[i] = blobs[i];
        renderer.render({ scene: mesh });
      };
      raf = requestAnimationFrame(frame);

      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        shot.live = false;
        el.closest("section")?.removeAttribute("data-live");
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        gl.canvas.remove();
      };
    };
    let stop: (() => void) | undefined;
    let gone = false;
    engaged().then(() => void (gone || (stop = mount())));
    return () => {
      gone = true;
      stop?.();
    };
  }, []);

  return <div ref={host} aria-hidden="true" className="absolute inset-0 overflow-hidden" />;
}
