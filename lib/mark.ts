/**
 * The Universal Fire emblem, redrawn from the old 150px PNG as geometry so it
 * stays sharp at every size: black ring, grey lower band, "UNIVERSAL" on the
 * arc, a red-brown gear ringed by four yellow cycle arrows, and a spoked wheel
 * with a flame at its hub. "FIRE" sits on the band.
 *
 * Pure numbers → path strings, shared by components/ui/Emblem.tsx, the loader
 * and the share card. viewBox is 0 0 200 200.
 */

export const EMBLEM = {
  navy: "#1D2A6E",
  gear: "#B8411C",
  arrow: "#F4CF1E",
  grey: "#A3A6AB",
  red: "#D7261E",
  spoke: "#3A8FD0",
  ring: "#111418",
};

const f = (n: number) => +n.toFixed(2);
const pt = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [f(cx + r * Math.cos(a)), f(cy + r * Math.sin(a))] as const;
};

/** Gear: `teeth` square-ish teeth between rIn and rOut. */
function gear(cx: number, cy: number, rOut: number, rIn: number, teeth: number) {
  const step = 360 / teeth;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts = [
      pt(cx, cy, rIn, a - step * 0.5),
      pt(cx, cy, rIn, a - step * 0.22),
      pt(cx, cy, rOut, a - step * 0.16),
      pt(cx, cy, rOut, a + step * 0.16),
      pt(cx, cy, rIn, a + step * 0.22),
    ];
    d += (i ? "L" : "M") + pts.map((p) => p.join(" ")).join("L");
  }
  return d + "Z";
}

/** One cycle arrow: an arc band from a0 to a1 (degrees) with a head at a1. */
function arrow(cx: number, cy: number, r: number, w: number, a0: number, a1: number) {
  const o0 = pt(cx, cy, r + w / 2, a0);
  const o1 = pt(cx, cy, r + w / 2, a1);
  const i1 = pt(cx, cy, r - w / 2, a1);
  const i0 = pt(cx, cy, r - w / 2, a0);
  const hOut = pt(cx, cy, r + w * 1.05, a1);
  const hIn = pt(cx, cy, r - w * 1.05, a1);
  const tip = pt(cx, cy, r, a1 + 14);
  const R = r + w / 2;
  const Ri = r - w / 2;
  return (
    `M${o0.join(" ")}A${R} ${R} 0 0 1 ${o1.join(" ")}` +
    `L${hOut.join(" ")}L${tip.join(" ")}L${hIn.join(" ")}L${i1.join(" ")}` +
    `A${Ri} ${Ri} 0 0 0 ${i0.join(" ")}Z`
  );
}

const C = { x: 100, y: 102 };

export const emblemPaths = {
  /** Lower grey band: the disc below y = 108. */
  band: `M${f(100 - Math.sqrt(90 ** 2 - 8 ** 2))} 110A90 90 0 0 0 ${f(100 + Math.sqrt(90 ** 2 - 8 ** 2))} 110Z`,
  gear: gear(C.x, C.y, 44, 35, 9),
  arrows: [20, 110, 200, 290].map((a) => arrow(C.x, C.y, 53, 8, a, a + 58)).join(""),
  spokes: Array.from({ length: 8 }, (_, i) => {
    const [x, y] = pt(C.x, C.y, 21, i * 22.5 + 11);
    const [x2, y2] = pt(C.x, C.y, 21, i * 22.5 + 191);
    return `M${x} ${y}L${x2} ${y2}`;
  }).join(""),
  flame: `M${C.x} ${C.y - 11}c5 6 9 9 8 15-1 4-4 6-8 6s-7-2-8-6c-1-4 1-7 4-9 0 3 1 5 3 5-1-4 0-8 1-11z`,
  hub: { cx: C.x, cy: C.y, r: 24 },
  /** Arc the ring lettering runs along (left → right over the top). */
  textArc: "M27 104A73 73 0 0 1 173 104",
};
