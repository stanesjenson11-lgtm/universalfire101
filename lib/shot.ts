/**
 * Numbers shared by the 3D extinguisher rig (components/gl/shot-stage.ts) and
 * the fire canvas (components/gl/FireFoamCanvas.tsx). Plain mutable state,
 * read every frame — no React re-renders in the loop. Kickstart's pattern.
 */
export const shot = {
  /** 0 → 1: spray progress inside the pinned fire section. */
  spray: 0,
  /** The nozzle tip, in fire-section space (height units, y down) — projected
   *  from the 3D model every frame, so the foam leaves the real opening. */
  nozzle: [1.5, 0.9] as [number, number],
  /** Which way the raised nozzle points on screen (unit vector, y down). */
  nozzleDir: [-1, 0] as [number, number],
  /** Set when the fire canvas has a working WebGL context. */
  live: false,
};
