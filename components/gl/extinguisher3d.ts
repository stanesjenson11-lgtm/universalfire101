import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";

/**
 * The photoreal extinguisher: Poly Haven's CC0 scan, split into its real parts
 * and rebranded for Universal Fire by scripts/build-model.mjs. Loaded once,
 * shared by the scroll shot and the exploded view.
 *
 * Parts (node names): cylinder, strap, hose, valve, lever, handle, pin, gauge,
 * gauge-glass, tag — plus "foot", a moulded black base cup added here. The
 * scan stood on a display stand ("base"), which is hidden: an extinguisher
 * stands on its own foot. Units are metres; it stands on y = 0, 0.659 m tall.
 */
export const HEIGHT = 0.659;

let gltf: Promise<GLTF> | null = null;
export const loadExtinguisher = () => (gltf ??= new GLTFLoader().loadAsync("/models/extinguisher/extinguisher.gltf"));

let hdr: Promise<THREE.DataTexture> | null = null;
/** The studio HDRI, prefiltered for one renderer (WebGL textures are per context). */
export async function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const tex = await (hdr ??= new HDRLoader().loadAsync("/models/env/studio_small_09_1k.hdr"));
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose();
  return env;
}

/** The cylinder's axis in the scan (metres): x 0, z 0.029. */
export const AXIS_Z = 0.029;

/**
 * The foot: a moulded plastic cup the cylinder sits in, its rim just over the
 * cylinder's bottom edge, a rounded heel and a recessed sole — the base of a
 * real stored-pressure extinguisher.
 */
function foot() {
  const profile = [
    [0, 0.004], [0.078, 0.004], [0.084, 0.0], [0.091, 0.003], [0.0955, 0.011],
    [0.0965, 0.024], [0.0965, 0.074], [0.0952, 0.081], [0.0935, 0.083],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const m = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 96),
    new THREE.MeshPhysicalMaterial({ color: "#121214", roughness: 0.52, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, side: THREE.DoubleSide }),
  );
  m.name = "foot";
  m.position.z = AXIS_Z;
  m.castShadow = true;
  return m;
}

/** A fresh copy of the model whose materials can be changed without touching the other copy. */
export async function extinguisher(options: { ownMaterials?: boolean } = {}) {
  const { scene } = await loadExtinguisher();
  const root = scene.clone(true);
  const parts: Record<string, THREE.Mesh> = {};
  root.traverse((o) => {
    if (!(o as THREE.Mesh).isMesh) return;
    const m = o as THREE.Mesh;
    if (options.ownMaterials) m.material = (m.material as THREE.Material).clone();
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.envMapIntensity = 1;
    m.castShadow = true;
    parts[m.name] = m;
  });
  parts.base.visible = false;
  parts.foot = foot();
  root.add(parts.foot);
  return { root, parts };
}

/**
 * The nozzle opening, in the model's space: the lowest point of the hose,
 * which hangs down beside the cylinder with its nozzle at the end.
 */
export function nozzleTip(hose: THREE.Mesh) {
  const p = hose.geometry.getAttribute("position");
  const index = hose.geometry.getIndex()!;
  let best = 0;
  let y = Infinity;
  for (let i = 0; i < index.count; i++) {
    const v = index.getX(i);
    if (p.getY(v) < y) {
      y = p.getY(v);
      best = v;
    }
  }
  return new THREE.Vector3(p.getX(best), p.getY(best), p.getZ(best));
}

/** Where the hose joins the valve: its highest point, the pivot it swings on. */
export function hoseTop(hose: THREE.Mesh) {
  const p = hose.geometry.getAttribute("position");
  const index = hose.geometry.getIndex()!;
  let best = 0;
  let y = -Infinity;
  for (let i = 0; i < index.count; i++) {
    const v = index.getX(i);
    if (p.getY(v) > y) {
      y = p.getY(v);
      best = v;
    }
  }
  return new THREE.Vector3(p.getX(best), p.getY(best), p.getZ(best));
}

/** A soft, round contact shadow drawn once on a canvas. */
export function contactShadow(size: number, strength = 0.75) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  g.filter = "blur(12px)";
  g.fillStyle = `rgba(0,0,0,${strength})`;
  g.beginPath();
  g.ellipse(64, 64, 38, 38, 0, 0, Math.PI * 2);
  g.fill();
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  return m;
}
