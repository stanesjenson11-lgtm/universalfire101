// pnpm check:foam — the foam is a pure function of progress, spreads out
// from the nozzle, and covers the whole fire section by the end.
import assert from "node:assert/strict";
import { foamSlots, foamBlobs, foamField, THRESHOLD } from "../lib/foam.ts";

for (const [n, aspect] of [[96, 16 / 9], [96, 21 / 9], [48, 9 / 16], [48, 3 / 4]]) {
  // Nozzle bottom-right, sweeping right to left — the site's layout.
  const nozzle = [0.85 * aspect, 0.9];
  const slots = foamSlots(n, aspect, nozzle[0]);
  // The raised hose points left and a little up.
  const dir = [-0.95, -0.3];
  const B = (t) => foamBlobs(t, slots, nozzle, aspect, undefined, dir);
  assert.equal(slots.length, n);

  assert.ok(B(0).every((v, i) => i % 3 !== 2 || v === 0), "foam before spraying");

  const a = Array.from(B(0.3));
  B(0.9);
  assert.deepEqual(Array.from(B(0.3)), a, "not pure");

  // The first blob out leaves from the nozzle itself, heading the way it points.
  const first = B(0.1 + 1e-4);
  const i0 = [...Array(n).keys()].find((i) => first[i * 3 + 2] > 0);
  assert.ok(Math.hypot(first[i0 * 3] - nozzle[0], first[i0 * 3 + 1] - nozzle[1]) < 0.01, "foam does not start at the nozzle");

  const end = B(1);
  let covered = 0, total = 0;
  for (let y = 0; y <= 1; y += 0.02)
    for (let x = 0; x <= aspect; x += 0.02, total++) covered += foamField(x, y, end) >= THRESHOLD ? 1 : 0;
  const share = covered / total;
  assert.ok(share >= 0.99, `only ${(share * 100).toFixed(1)}% covered at n=${n}, aspect=${aspect.toFixed(2)}`);

  assert.ok(foamField(nozzle[0], 0.85, B(0.45)) >= THRESHOLD, "no foam around the nozzle by s=0.45");
  assert.ok(foamField(0.05 * aspect, 0.5, B(0.3)) < THRESHOLD, "far side foamed too early");
  console.log(`ok  n=${n} aspect=${aspect.toFixed(2)} coverage=${(share * 100).toFixed(1)}%`);
}
