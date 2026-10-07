/**
 * The foam, as a pure function of spray progress — no simulation, no state.
 * Scrubbing the page back therefore un-sprays it exactly.
 *
 * Space: the fire section, in height units. x runs 0 → aspect (width/height),
 * y runs 0 (top) → 1 (bottom), so blobs stay round at any screen shape.
 *
 * Every blob leaves the nozzle at its own moment as part of a jet — out along
 * the hose's own direction, then curving down onto the fire — and lands on a
 * slot of a jittered grid. Slots are taken column by
 * column away from the nozzle — the stream sweeps across the fire, as the
 * PASS drill teaches — each column from the floor up, so the foam piles.
 * Each landed blob swells to overlap its neighbours, so by s = 1 the field
 * covers the whole section (scripts/check-foam.mjs proves it).
 */

export const EMIT_START = 0.1; // after the hose has been raised
export const EMIT_SPAN = 0.66;
const FLIGHT = 0.14; // long enough that ~20 blobs are in the air at once: a stream, not drops
const GROW = 0.14;

// Deterministic jitter: the same layout on every render and every device.
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function foamSlots(n: number, aspect: number, fromX = 0) {
  const cols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
  const rows = Math.ceil(n / cols);
  const cw = aspect / cols;
  const ch = 1 / rows;
  // Overlap: any point is within ~1.06 cells of a jittered centre, edges included.
  const r = 1.3 * Math.max(cw, ch);
  const slots: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < cols * rows && slots.length < n; i++) {
    const c = i % cols;
    const row = Math.floor(i / cols);
    slots.push({
      x: (c + 0.5 + (hash(i) - 0.5) * 0.5) * cw,
      y: (row + 0.5 + (hash(i + 99) - 0.5) * 0.5) * ch,
      r,
    });
  }
  // Column by column outward from the nozzle, each from the floor up.
  const ring = (x: number) => Math.round(Math.abs(x - fromX) / cw);
  return slots.sort((a, b) => ring(a.x) - ring(b.x) || b.y - a.y);
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Blob i's [x, y, r] at spray progress s ∈ [0, 1]. r = 0 means not yet sprayed.
 * `out` is reused frame to frame (a Float32Array of n * 3).
 */
export function foamBlobs(
  s: number,
  slots: ReturnType<typeof foamSlots>,
  nozzle: [number, number],
  aspect: number,
  out = new Float32Array(slots.length * 3),
  /** Unit direction the nozzle points, in section space (y down). */
  dir: [number, number] = [0, 0],
) {
  const n = slots.length;
  for (let i = 0; i < n; i++) {
    const slot = slots[i];
    const emit = EMIT_START + (i / n) * EMIT_SPAN;
    const u = (s - emit) / FLIGHT;
    let x = 0, y = 0, r = 0;
    if (u >= 0 && u < 1) {
      // The jet: a quadratic curve whose first leg runs out of the nozzle
      // along the hose, bending down under its own weight onto the slot.
      const reach = 0.12 + 0.35 * Math.hypot(slot.x - nozzle[0], slot.y - nozzle[1]);
      const cx = nozzle[0] + dir[0] * reach;
      const cy = nozzle[1] + dir[1] * reach + 0.04;
      const e = easeOut(u);
      const k = 1 - e;
      x = k * k * nozzle[0] + 2 * k * e * cx + e * e * slot.x;
      y = k * k * nozzle[1] + 2 * k * e * cy + e * e * slot.y;
      // Leaves the width of the nozzle, opens out as it travels.
      r = slot.r * (0.09 + 0.24 * e);
    } else if (u >= 1) {
      const g = clamp01((s - emit - FLIGHT) / GROW);
      x = slot.x;
      y = slot.y;
      r = slot.r * (0.33 + 0.67 * easeOut(g));
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = r;
  }
  return out;
}

/**
 * Compact metaball kernel: each blob reaches SPREAD × its radius and no
 * further, so foam never appears ahead of the sweep (a 1/d² field has a long
 * tail that sums to "foam" everywhere). A lone blob crosses THRESHOLD exactly
 * at its radius.
 */
export const SPREAD = 1.6;
export const THRESHOLD = Math.pow(1 - 1 / (SPREAD * SPREAD), 3);

/** Field at a point — the same sum the shader runs. Foam where ≥ THRESHOLD. */
export function foamField(px: number, py: number, blobs: Float32Array) {
  let f = 0;
  for (let i = 0; i < blobs.length; i += 3) {
    const R = blobs[i + 2] * SPREAD;
    if (!R) continue;
    const dx = px - blobs[i];
    const dy = py - blobs[i + 1];
    const q = 1 - (dx * dx + dy * dy) / (R * R);
    if (q > 0) f += q * q * q;
  }
  return f;
}

/** How hard the fire still burns: out once the sweep has passed. */
export const fireLeft = (s: number) => 1 - clamp01((s - 0.1) / 0.84);
