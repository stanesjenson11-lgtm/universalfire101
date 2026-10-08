"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

/*
 * The footer's city at night, drawn flat (no gradients) in a 1600 × 900 box
 * anchored to the bottom of the footer. Fires break out in windows and on a
 * roof; firemen — one up the engine's ladder — turn, raise their
 * extinguishers and foam them out, one after another, on an endless loop.
 */

const STREET = 860;
const C = {
  back: "#0f0f11",
  fronts: ["#1a1a1d", "#1e1e22", "#222226"],
  windowOff: "#2b2b30",
  windowOn: "#f6cf7a",
  street: "#0b0b0c",
  curb: "#2a2a2e",
  flame: ["#ff5a1f", "#ff9a2e", "#ffd45c"],
  smoke: "#3a3a40",
  foam: "#ffffff",
};

// Front row: x, width, height (from the street up).
const FRONT = [
  [20, 150, 280], [185, 120, 330], [320, 170, 270], [505, 140, 340], [660, 180, 300],
  [855, 130, 350], [1000, 190, 280], [1205, 150, 320], [1370, 210, 270],
] as const;
const BACK = [[100, 130, 370], [420, 110, 390], [760, 120, 375], [1100, 120, 400], [1460, 120, 365]] as const;

// Deterministic "random", integer-only so server and browser agree to the
// last digit (Math.sin can differ between engines and break hydration).
const rnd = (i: number) => {
  let t = Math.imul(i + 0x9e3779b9, 0x85ebca6b) >>> 0;
  t = Math.imul(t ^ (t >>> 13), 0xc2b2ae35) >>> 0;
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
};
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Fires: where they burn (base centre). */
const FIRES = [
  { x: 575, y: 632, s: 1 }, // building 3, window
  { x: 900, y: 592, s: 1.1 }, // building 5, window
  { x: 750, y: 562, s: 1.3 }, // building 4, roof
  { x: 430, y: 646, s: 1 }, // building 2, window — the ladder's
  { x: 1062, y: 652, s: 1 }, // building 6, window
];

/** Firemen: feet position, facing (1 right, -1 left), and the fire each one takes. */
const CREW = [
  { x: 470, y: STREET, dir: 1, fire: 0 },
  { x: 800, y: STREET, dir: 1, fire: 1 },
  { x: 655, y: STREET, dir: 1, fire: 2 },
  { x: 332, y: 668, dir: 1, fire: 3 }, // on the ladder
  { x: 1150, y: STREET, dir: -1, fire: 4 },
];
const SCALE = 1.35;
const SHOULDER = { x: 5, y: -54 };
const NOZZLE = 24; // along the arm from the shoulder

function aimFor(m: (typeof CREW)[number]) {
  const f = FIRES[m.fire];
  const sx = m.x + SHOULDER.x * SCALE * m.dir;
  const sy = m.y + SHOULDER.y * SCALE;
  const tx = f.x;
  const ty = f.y - 14;
  // Angle in the fireman's own (unflipped) frame.
  const ang = Math.atan2(ty - sy, (tx - sx) * m.dir);
  const deg = (ang * 180) / Math.PI;
  const nx = sx + Math.cos(ang) * NOZZLE * SCALE * m.dir;
  const ny = sy + Math.sin(ang) * NOZZLE * SCALE;
  // The jet: up and over, then down onto the fire.
  const cx = (nx + tx) / 2;
  const cy = Math.min(ny, ty) - 40 - Math.abs(tx - nx) * 0.12;
  return { deg, path: `M${nx.toFixed(1)} ${ny.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tx} ${ty}` };
}

function Flame({ s }: { s: number }) {
  const tear = "M0-46C10-30 18-20 16-8C14 2 7 6 0 6C-7 6-14 2-16-8C-18-20-8-26 0-46Z";
  return (
    <g transform={`scale(${s})`}>
      <circle className="glow" cy="-16" r="38" fill={C.flame[0]} opacity="0.16" />
      <path className="lick" d={tear} fill={C.flame[0]} />
      <path className="lick" d={tear} fill={C.flame[1]} transform="translate(0 2) scale(0.68)" />
      <path className="lick" d={tear} fill={C.flame[2]} transform="translate(0 3) scale(0.38)" />
    </g>
  );
}

function Fireman({ dir }: { dir: number }) {
  return (
    <g transform={`scale(${SCALE * dir} ${SCALE})`}>
      <ellipse cy="1" rx="13" ry="3" fill="#000" opacity="0.5" />
      <rect x="-9" y="-7" width="8" height="7" rx="1.5" fill="#0c0c0d" />
      <rect x="1" y="-7" width="8" height="7" rx="1.5" fill="#0c0c0d" />
      <rect x="-8" y="-30" width="7" height="24" fill="#2a2a30" />
      <rect x="1" y="-30" width="7" height="24" fill="#2a2a30" />
      <rect x="-8" y="-17" width="16" height="2.2" fill="#e8e6d8" />
      <rect x="-11" y="-58" width="22" height="31" rx="5" fill="#c49a5a" />
      <rect x="-11" y="-42" width="22" height="2.6" fill="#f4f0d0" />
      <rect x="-11" y="-35" width="22" height="2.6" fill="#f4f0d0" />
      {/* the extinguisher at the hip */}
      <rect x="9" y="-44" width="9" height="20" rx="3" fill="#d7261e" />
      <rect x="11" y="-47" width="5" height="3" fill="#1d1d1f" />
      <circle cy="-66" r="7.5" fill="#e6b58c" />
      <path d="M-10-67Q-10-80 0-80Q10-80 10-67Z" fill="#c2410c" />
      <rect x="-12.5" y="-68" width="25" height="3.2" rx="1.6" fill="#9a3412" />
      <circle cx="4" cy="-73" r="1.8" fill="#f2c230" />
      {/* the arm, hose and nozzle — this turns to aim */}
      <g className="arm" transform={`translate(${SHOULDER.x} ${SHOULDER.y})`}>
        <path d="M14-1.5Q8 6 12 14" stroke="#141415" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <rect x="-1" y="-3" width="15" height="6" rx="3" fill="#b38a4f" />
        <circle cx="14" r="3.4" fill="#e6b58c" />
        <rect x="15" y="-1.6" width="9" height="3.2" rx="1" fill="#141415" />
      </g>
    </g>
  );
}

/*
 * The fireman in front, holding an extinguisher at his side. His arm hangs
 * 55° forward; the extinguisher hangs from his hand to just off the street.
 */
const HOLDER = { x: 990, scale: 2.4, arm: 55 };

function Holder() {
  return (
    <g transform={`translate(${HOLDER.x} ${STREET}) scale(${-HOLDER.scale} ${HOLDER.scale})`}>
      <ellipse cy="1" rx="13" ry="3" fill="#000" opacity="0.5" />
      <rect x="-9" y="-7" width="8" height="7" rx="1.5" fill="#0c0c0d" />
      <rect x="1" y="-7" width="8" height="7" rx="1.5" fill="#0c0c0d" />
      <rect x="-8" y="-30" width="7" height="24" fill="#2a2a30" />
      <rect x="1" y="-30" width="7" height="24" fill="#2a2a30" />
      <rect x="-8" y="-17" width="16" height="2.2" fill="#e8e6d8" />
      <rect x="-11" y="-58" width="22" height="31" rx="5" fill="#c49a5a" />
      <rect x="-11" y="-42" width="22" height="2.6" fill="#f4f0d0" />
      <rect x="-11" y="-35" width="22" height="2.6" fill="#f4f0d0" />
      <circle cy="-66" r="7.5" fill="#e6b58c" />
      <path d="M-10-67Q-10-80 0-80Q10-80 10-67Z" fill="#c2410c" />
      <rect x="-12.5" y="-68" width="25" height="3.2" rx="1.6" fill="#9a3412" />
      <circle cx="4" cy="-73" r="1.8" fill="#f2c230" />
      <g transform={`translate(${SHOULDER.x} ${SHOULDER.y}) rotate(${HOLDER.arm})`}>
        <rect x="-1" y="-3" width="15" height="6" rx="3" fill="#b38a4f" />
        <circle cx="14" r="3.6" fill="#e6b58c" />
      </g>
    </g>
  );
}

export default function CityScene() {
  const root = useRef<SVGSVGElement>(null);

  // Phones see only ~420 of the 1600 units across: centre that window on the
  // fireman holding the extinguisher (HOLDER), not on the middle of the street.
  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const portrait = window.matchMedia("(max-width: 760px)");
    const frame = () => svg.setAttribute("viewBox", portrait.matches ? `${HOLDER.x - 30 - 800} 0 1600 900` : "0 0 1600 900");
    frame();
    portrait.addEventListener("change", frame);
    return () => portrait.removeEventListener("change", frame);
  }, []);

  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const reduced = prefersReduced();
    const ctx = gsap.context(() => {
      // The ambient motion — flames, a few stars, the beacon — runs only while
      // the footer is on screen, like the incidents below: a tween left running off screen still costs a style write every
      // frame, on every phone, all the way down the page.
      const ambient: gsap.core.Animation[] = [];
      // Flames never sit still.
      if (!reduced) svg.querySelectorAll<SVGPathElement>(".lick").forEach((el, i) => {
        ambient.push(gsap.to(el, {
          scaleY: 1.18,
          scaleX: 0.9,
          skewX: (i % 2 ? 1 : -1) * 4,
          transformOrigin: "50% 100%",
          duration: 0.18 + rnd(i) * 0.22,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          paused: true,
        }));
      });
      // Every third star twinkles; the rest hold still (a sky full of tweens
      // was the scene's biggest per-frame cost).
      if (!reduced) svg.querySelectorAll(".star").forEach((el, i) => {
        if (i % 3) return;
        ambient.push(gsap.to(el, { opacity: 0.1, duration: 1.4 + rnd(i + 40) * 2, repeat: -1, yoyo: true, ease: "sine.inOut", delay: rnd(i) * 2, paused: true }));
      });
      if (!reduced) ambient.push(gsap.to(svg.querySelector(".beacon"), { opacity: 0.2, duration: 0.45, repeat: -1, yoyo: true, ease: "steps(1)", paused: true }));

      // One incident: it catches, a fireman aims and foams it, it dies to smoke.
      const incident = (i: number) => {
        const m = CREW[i];
        const fire = svg.querySelector(`[data-fire="${m.fire}"]`)!;
        const arm = svg.querySelector(`[data-crew="${i}"] .arm`)!;
        const jet = svg.querySelector(`[data-jet="${i}"]`)!;
        const foam = svg.querySelectorAll(`[data-foam="${m.fire}"] circle`);
        const smoke = svg.querySelectorAll(`[data-smoke="${m.fire}"] circle`);
        const { deg } = aimFor(m);
        return gsap
          .timeline()
          .fromTo(fire, { scale: 0, opacity: 0, transformOrigin: "50% 100%" }, { scale: 1, opacity: 1, duration: 1.1, ease: "power2.out" })
          .to(arm, { rotation: deg, svgOrigin: `${SHOULDER.x} ${SHOULDER.y}`, duration: 0.55, ease: "power2.inOut" }, "+=0.5")
          .fromTo(jet, { strokeDashoffset: 1, opacity: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: "power1.in" })
          .fromTo(foam, { scale: 0, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }, "-=0.1")
          .to(fire, { scale: 0.1, opacity: 0, duration: 0.9, ease: "power2.in" }, "-=0.15")
          .fromTo(smoke, { y: 0, opacity: 0.85, scale: 0.6 }, { y: -70, opacity: 0, scale: 1.6, duration: 1.6, stagger: 0.12, ease: "power1.out" }, "<0.3")
          .to(jet, { strokeDashoffset: -1, duration: 0.45, ease: "power1.out" }, "-=1.2")
          .to(arm, { rotation: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.6")
          .to(foam, { opacity: 0, duration: 0.9 }, "-=0.4");
      };

      const loop = gsap.timeline({ repeat: -1, repeatDelay: 0.6, paused: true });
      CREW.forEach((_, i) => loop.add(incident(i), i * 2.1));
      if (reduced) loop.pause(2.6); // one still moment: two fires, one being foamed

      // Only animate while the footer is on screen.
      let onScreen = false;
      const run = () => {
        if (reduced) return;
        const go = onScreen;
        loop.paused(!go);
        ambient.forEach((t) => t.paused(!go));
      };
      const io = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        run();
      });
      io.observe(svg);
      return () => io.disconnect();
    }, svg);
    return () => ctx.revert();
  }, []);

  let w = 0;
  return (
    <svg
      ref={root}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      {/* sky */}
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} className="star" cx={r1(rnd(i) * 1600)} cy={r1(20 + rnd(i + 100) * 380)} r={r1(0.8 + rnd(i + 200) * 1.3)} fill="#fff" opacity="0.45" />
      ))}
      {/* The moon, high in the corner, clear of the footer's words: a faint glow, soft-edged seas, craters with a
          dark floor and a lit rim, and the edge darkening a touch (blur filters,
          no gradients). */}
      <defs>
        <filter id="cs-moon-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
        <filter id="cs-moon-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <clipPath id="cs-moon-disc">
          <circle r="40" />
        </clipPath>
      </defs>
      <g transform="translate(1420 170)">
        <circle r="46" fill="#e8e4d8" opacity="0.16" filter="url(#cs-moon-glow)" />
        <circle r="40" fill="#ebe7dc" />
        <g clipPath="url(#cs-moon-disc)">
          <g fill="#b9b2a0" opacity="0.6" filter="url(#cs-moon-soft)">
            <path d="M-24 -13 C-17 -25 0 -24 5 -14 C9 -4 -2 3 -12 1 C-21 -1 -29 -5 -24 -13Z" />
            <path d="M3 5 C11 -1 25 3 25 13 C25 22 13 27 6 21 C1 17 -1 10 3 5Z" />
            <path d="M-9 13 C-3 11 2 17 -2 23 C-6 28 -15 26 -15 20 C-15 16 -13 14 -9 13Z" />
            <ellipse cx="17" cy="-18" rx="8" ry="6" />
            <ellipse cx="-27" cy="10" rx="5" ry="7" />
          </g>
          {(
            [
              [-5, -27, 3.6],
              [23, -3, 4.2],
              [-25, -2, 2.6],
              [11, 29, 3],
              [-14, 28, 2],
              [30, 14, 2.2],
            ] as const
          ).map(([x, y, r]) => (
            <g key={`${x}${y}`}>
              <circle cx={x} cy={y} r={r} fill="#c6bfad" />
              <circle cx={x + 0.7} cy={y + 0.7} r={r} fill="none" stroke="#f7f4ec" strokeWidth="0.9" opacity="0.75" />
            </g>
          ))}
          <circle r="40" fill="none" stroke="#a49d8b" strokeWidth="7" opacity="0.4" filter="url(#cs-moon-soft)" />
        </g>
      </g>

      {BACK.map(([x, bw, h], i) => (
        <rect key={`b${i}`} x={x} y={STREET - h} width={bw} height={h} fill={C.back} />
      ))}

      {FRONT.map(([x, bw, h], i) => {
        const cols = Math.max(2, Math.floor((bw - 24) / 30));
        const rows = Math.floor((h - 50) / 40);
        const gx = (bw - cols * 16) / (cols + 1);
        return (
          <g key={`f${i}`}>
            <rect x={x} y={STREET - h} width={bw} height={h} fill={C.fronts[i % 3]} />
            <rect x={x - 4} y={STREET - h - 6} width={bw + 8} height={8} fill={C.fronts[(i + 1) % 3]} />
            {i % 3 === 1 && <rect x={x + bw * 0.62} y={STREET - h - 32} width={22} height={26} fill={C.fronts[0]} />}
            {i % 4 === 2 && <line x1={x + 24} x2={x + 24} y1={STREET - h - 6} y2={STREET - h - 50} stroke={C.curb} strokeWidth="2" />}
            {Array.from({ length: rows * cols }, (_, k) => {
              const cx = r1(x + gx + (k % cols) * (16 + gx));
              const cy = STREET - h + 30 + Math.floor(k / cols) * 40;
              return <rect key={k} x={cx} y={cy} width="16" height="22" rx="2" fill={rnd(w++ + i * 7) > 0.62 ? C.windowOn : C.windowOff} opacity={0.9} />;
            })}
          </g>
        );
      })}

      {/* street */}
      <rect x="0" y={STREET} width="1600" height="60" fill={C.street} />
      <rect x="0" y={STREET} width="1600" height="3" fill={C.curb} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 104 + 20} y={STREET + 26} width="48" height="3" fill="#1c1c1f" />
      ))}

      {/* fire engine, ladder up against building 2. Far enough in from the
          left that a 16:10 screen's crop keeps its cab. */}
      <g>
        <line x1="296" y1="792" x2="356" y2="662" stroke="#8a8f99" strokeWidth="4" />
        <line x1="312" y1="800" x2="372" y2="670" stroke="#8a8f99" strokeWidth="4" />
        {Array.from({ length: 9 }, (_, i) => {
          const t = (i + 1) / 10;
          return <line key={i} x1={296 + 60 * t} y1={792 - 130 * t} x2={312 + 60 * t} y2={800 - 130 * t} stroke="#8a8f99" strokeWidth="2.5" />;
        })}
        <rect x="100" y="788" width="230" height="52" rx="6" fill="#c2410c" />
        <rect x="100" y="808" width="230" height="4" fill="#f4f0d0" />
        <rect x="78" y="768" width="66" height="72" rx="9" fill="#b33a0b" />
        <rect x="86" y="776" width="40" height="26" rx="4" fill="#9fb7c9" opacity="0.55" />
        <rect className="beacon" x="94" y="760" width="22" height="8" rx="3" fill="#ffb547" />
        <circle cx="136" cy="842" r="17" fill="#0c0c0d" />
        <circle cx="136" cy="842" r="6" fill="#3a3a40" />
        <circle cx="288" cy="842" r="17" fill="#0c0c0d" />
        <circle cx="288" cy="842" r="6" fill="#3a3a40" />
      </g>

      {/* fires, each with its foam and smoke */}
      {FIRES.map((f, i) => (
        <g key={`fire${i}`} transform={`translate(${f.x} ${f.y})`}>
          <g data-fire={i} opacity="0">
            <Flame s={f.s} />
          </g>
          <g data-smoke={i}>
            {[-10, 4, 14].map((dx, k) => (
              <circle key={k} cx={dx} cy={-30 - k * 8} r={9 + k * 2} fill={C.smoke} opacity="0" />
            ))}
          </g>
          <g data-foam={i}>
            {[[-14, -10, 9], [0, -16, 11], [13, -8, 8], [-6, 0, 8], [8, 2, 7], [-2, -26, 7]].map(([dx, dy, r], k) => (
              <circle key={k} cx={dx} cy={dy} r={r} fill={C.foam} opacity="0" />
            ))}
          </g>
        </g>
      ))}

      {/* the jets, drawn on with a dash */}
      {CREW.map((m, i) => (
        <path key={`jet${i}`} data-jet={i} d={aimFor(m).path} pathLength={1} fill="none" stroke={C.foam} strokeWidth="6" strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset="1" opacity="0" />
      ))}

      {CREW.map((m, i) => (
        <g key={`m${i}`} data-crew={i} transform={`translate(${m.x} ${m.y})`}>
          <Fireman dir={m.dir} />
        </g>
      ))}

      <Holder />
      {/* The extinguisher in his hand: top just above the grip, foot just off the street. */}
      {/* The extinguisher in his hand: a still rendered from the scanned 3D model. */}
      <image href="/site/extinguisher-hand.webp" x="914.5" y="745.5" width="70.5" height="122" />
    </svg>
  );
}
