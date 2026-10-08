import * as THREE from "three";
import { gsap } from "@/lib/motion";
import { shot } from "@/lib/shot";
import { extinguisher, studioEnvironment, contactShadow, partBox, HEIGHT, AXIS_Z } from "./extinguisher3d";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z);

/**
 * Same order as home.inside.parts in lib/content.ts. `meshes` are node names
 * from the scan (scripts/build-model.mjs); "powder" and "siphon" are built
 * here, inside the cylinder, for the cutaway. `explode` is in metres;
 * `delay` staggers when each part leaves.
 */
const PARTS: { meshes: string[]; explode: THREE.Vector3; tilt?: number; delay: number }[] = [
  { meshes: ["lever"], explode: V(0, 0.17), tilt: 0.12, delay: 0 },
  { meshes: ["handle"], explode: V(0, 0.12), delay: 0.04 },
  { meshes: ["pin"], explode: V(-0.12, 0.1), tilt: 0.3, delay: 0.08 },
  { meshes: ["gauge", "gauge-glass"], explode: V(0, 0.07, 0.13), delay: 0.1 },
  { meshes: ["valve"], explode: V(0, 0.07), delay: 0.14 },
  { meshes: ["hose"], explode: V(-0.15, 0.02, 0.03), tilt: 0.08, delay: 0.18 },
  { meshes: ["siphon"], explode: V(0, 0.2), delay: 0.24 },
  { meshes: ["powder"], explode: V(0, 0), delay: 0.3 },
  { meshes: ["cylinder", "strap"], explode: V(0, 0), delay: 0.3 },
  { meshes: ["tag"], explode: V(-0.09, 0.01, -0.04), tilt: -0.2, delay: 0.22 },
  { meshes: ["foot"], explode: V(0, -0.12), delay: 0.2 },
];

type Els = {
  section: HTMLElement;
  host: HTMLElement;
  svg: SVGSVGElement;
  callouts: HTMLElement[];
  intro: HTMLElement;
};

/**
 * The exploded view of the real, scanned extinguisher — scrubbed by scroll,
 * one number p, so scrolling back reverses it exactly:
 *   0.00–0.05  the drifting extinguisher (shot-stage) arrives and merges in
 *   0.05–0.30  it turns into a three-quarter view
 *   0.10–0.32  a quarter of the cylinder is cut away: wall, powder, siphon tube
 *   0.32–0.60  the parts lift off along their own axes, callouts draw in
 *   0.75–0.92  the parts come home, the cut closes
 *   0.80–0.95  it turns back to where it began, and hands back to the drift
 * Its camera matches the drifting one's lens (20°), and it sits underneath that
 * one through each hand-over, so the cross-fade is between identical frames.
 * The progress is the stage's own pin (Inside.tsx), read as shot.inside, so
 * the hand-overs line up and this module, arriving late, makes no pins.
 * `still` renders the finished, exploded frame once (reduced motion).
 */
export async function mountExploded({ section, host, svg, callouts, intro }: Els, still: boolean, cancelled: () => boolean = () => false) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return () => {};
  }
  renderer.debug.checkShaderErrors = false; // see shot-stage.ts: compileAsync instead
  const phone = window.matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, phone ? 1.5 : 1.75));
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

  const scene = new THREE.Scene();
  const [env, model] = await Promise.all([studioEnvironment(renderer), extinguisher({ ownMaterials: true })]);
  if (cancelled()) {
    renderer.dispose();
    env.dispose();
    return () => {};
  }
  scene.environment = env;
  scene.environmentIntensity = 0.9;

  const key = new THREE.DirectionalLight("#ffffff", 1.4);
  key.position.set(-3, 5, 5);
  const rim = new THREE.DirectionalLight("#ff9a5c", 2); // warm, from behind: the fire's side
  rim.position.set(4, 2, -4);
  scene.add(key, rim);

  // The quarter-wedge cut, removed only where both planes clip (x > a, z > b).
  const cutX = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1);
  const cutZ = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1);
  const clip = { clippingPlanes: [cutX, cutZ], clipIntersection: true };

  const { root, parts } = model;
  // The cylinder wall, cut: inside it reads as bare dark steel.
  const shell = parts.cylinder.material as THREE.MeshStandardMaterial;
  Object.assign(shell, clip, { side: THREE.DoubleSide });
  shell.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <dithering_fragment>",
      "#include <dithering_fragment>\n  if (!gl_FrontFacing) gl_FragColor.rgb = vec3(0.11, 0.11, 0.12);",
    );
  };
  Object.assign(parts.strap.material as THREE.Material, clip);

  // Inside: the powder charge, settled with a soft mound, and the siphon tube.
  const powderMat = new THREE.MeshStandardMaterial({ color: "#f1ead6", roughness: 1, side: THREE.DoubleSide, ...clip });
  powderMat.onBeforeCompile = (s) => {
    s.fragmentShader = s.fragmentShader.replace(
      "#include <dithering_fragment>",
      "#include <dithering_fragment>\n  if (!gl_FrontFacing) gl_FragColor.rgb = vec3(0.86, 0.82, 0.7);",
    );
  };
  const powder = new THREE.Mesh(
    new THREE.LatheGeometry(
      [[0, 0.07], [0.087, 0.07], [0.087, 0.39], [0.06, 0.405], [0.025, 0.413], [0, 0.415]].map(([x, y]) => new THREE.Vector2(x, y)),
      96,
    ),
    powderMat,
  );
  powder.name = "powder";
  powder.position.z = AXIS_Z;
  const siphon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 0.47, 24),
    new THREE.MeshStandardMaterial({ color: "#9a9ea6", metalness: 0.9, roughness: 0.3 }),
  );
  siphon.name = "siphon";
  siphon.position.set(0, 0.315, AXIS_Z);
  root.add(powder, siphon);
  parts.powder = powder;
  parts.siphon = siphon;

  // Model axis at the world origin, its middle at y = 0.
  root.position.set(0, -HEIGHT / 2, -AXIS_Z);
  const turn = new THREE.Group().add(root);
  scene.add(turn);
  const shadow = contactShadow(0.6, 0.7);
  shadow.position.y = -HEIGHT / 2 - 0.001;
  scene.add(shadow);

  // Each part: its meshes, where they rest, and the callout point — the
  // centre of the part's own geometry, so lines land on the real piece.
  const groups = PARTS.map((p) => {
    const meshes = p.meshes.map((n) => parts[n]).filter(Boolean);
    const box = new THREE.Box3();
    for (const m of meshes) box.union(partBox(m).translate(m.position));
    const anchor = box.getCenter(new THREE.Vector3());
    if (p.meshes[0] === "powder") anchor.set(0.05, 0.25, AXIS_Z + 0.05);
    if (p.meshes[0] === "cylinder") anchor.set(-0.07, 0.42, AXIS_Z + 0.06);
    // Kept in the first mesh's own space (no rotation at rest, so just less its
    // position): its lift and its tilt — which turns about the scan's origin,
    // at the base, and swings the small parts well aside — carry the anchor too.
    const local = anchor.clone().sub(meshes[0].position);
    return { ...p, meshes, rest: meshes.map((m) => m.position.clone()), local };
  });

  const FOV = 20;
  const TAN = Math.tan((FOV * Math.PI) / 360);
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 20);
  const tmp = new THREE.Vector3();
  let W = 1;
  let H = 1;
  let titleBottom = 0; // px from the stage's top to under the title
  const progress = () => (still ? 0.5 : shot.inside);

  // Phones: name-only labels in narrow columns at the screen's edges.
  const labelW = phone ? 100 : 230;
  const labelEdge = () => (phone ? 10 + labelW : Math.max(262, W * 0.24));

  /*
   * Framing. Desktop: the model stands centred, the title beside it. Narrower
   * (phones, tablets): the title is above it, so at rest the model fills the
   * space under the title; as it comes apart (and the title fades) the camera
   * pulls back to centre it on the whole screen, far enough that the parts
   * clear the label columns. Returns camera distance, look-at height, and a
   * sideways shift (exploded, most of the parts swing out to the left).
   */
  const frameAt = (e: number) => {
    if (W >= 1024) return { dist: lerp(2.68, 3.6, e), ty: lerp(0.07, 0.08, e), cx: 0 };
    const top = titleBottom + 16;
    const restH = Math.min(H - top - 24, H * 0.42); // under the title, no bigger than 42% of the screen
    const restDist = (HEIGHT * H) / (2 * TAN * restH);
    const restF = (top + restH / 2) / H;
    const room = W / 2 - labelEdge() - 8;
    const expDist = Math.max((0.98 * H) / (2 * TAN * (H - 96)), (0.15 * H) / (2 * TAN * room));
    const dist = lerp(restDist, expDist, e);
    const f = lerp(restF, 0.53, e);
    return { dist, ty: (f - 0.5) * 2 * dist * TAN, cx: -0.05 * e };
  };
  const place = (e: number) => {
    const { dist, ty, cx } = frameAt(e);
    camera.position.set(cx, ty + dist * 0.14, dist);
    camera.lookAt(cx, ty, 0);
  };

  // Measure the opening frame (at rest, as it stands when the drifting
  // extinguisher arrives) and publish it for the hand-over: where the model's
  // centre lands on the screen, how tall it is there, and the pitch that makes
  // a model seen straight on (the drifting one) look like this one, seen from
  // above. Shared by every screen size, so the two always line up.
  const publishOpen = () => {
    place(0);
    camera.updateMatrixWorld();
    const sy = (y: number) => ((-tmp.set(0, y, 0).project(camera).y * 0.5 + 0.5) * H + host.offsetTop) / innerHeight;
    const c = sy(0);
    const h = sy(-HEIGHT / 2) - sy(HEIGHT / 2);
    const { dist, ty } = frameAt(0);
    const fromAbove = Math.atan2(ty + dist * 0.14, dist);
    const offAxis = Math.atan((c - 0.5) * 2 * Math.tan((20 * Math.PI) / 360)); // the drifting camera: 20°, whole screen
    // ×1.014: seen pitched and from further off, the drifting model reads
    // ~1.4% shorter at the same scale (measured on phone, tablet and desktop).
    shot.insideOpen = { y: c, h: h * 1.014, pitch: fromAbove - offAxis };
  };

  const layoutCallouts = (p: number, e: number) => {
    const oy = host.offsetTop;
    type C = { el: HTMLElement; ax: number; ay: number; y: number; left: boolean; o: number };
    const all: C[] = groups.map((g, i) => {
      // Follow the part as it moves: its anchor through its own transform.
      g.meshes[0].localToWorld(tmp.copy(g.local));
      tmp.project(camera);
      const ax = (tmp.x * 0.5 + 0.5) * W;
      const ay = (-tmp.y * 0.5 + 0.5) * H;
      return { el: callouts[i], ax, ay, y: ay, left: ax < W / 2, o: smooth(0.42 + i * 0.015, 0.54 + i * 0.015, p) * smooth(0.6, 0.85, e) };
    });
    // Each column in order of height, a label apart, kept on screen.
    const gap = phone ? 30 : 58;
    for (const left of [true, false]) {
      const col = all.filter((c) => c.left === left).sort((a, b) => a.ay - b.ay);
      for (let k = 1; k < col.length; k++) col[k].y = Math.max(col[k].y, col[k - 1].y + gap);
      const over = col.length ? col[col.length - 1].y - (H - (phone ? 24 : 40)) : 0;
      if (over > 0) col.forEach((c) => (c.y -= over));
    }
    const edge = labelEdge();
    const colX = (left: boolean) => (left ? edge : W - edge);
    const tick = phone ? 6 : 10;
    let d = "";
    for (const c of all) {
      const x = colX(c.left);
      c.el.style.opacity = c.o.toFixed(3);
      c.el.style.transform = `translate(${(c.left ? x - labelW : x).toFixed(1)}px, ${(c.y + oy - (phone ? 9 : 18)).toFixed(1)}px)`;
      c.el.style.textAlign = c.left ? "right" : "left";
      if (c.o > 0.02) d += `M${c.ax.toFixed(1)} ${(c.ay + oy).toFixed(1)}L${(c.left ? x + tick : x - tick).toFixed(1)} ${(c.y + oy).toFixed(1)}`;
    }
    const path = svg.firstElementChild as SVGPathElement;
    path.setAttribute("d", d);
    path.style.opacity = (smooth(0.42, 0.56, p) * smooth(0.6, 0.85, e)).toFixed(3);
  };

  const draw = () => {
    const p = progress();
    // Arrives facing as the drifting extinguisher does (-0.95), turns to show
    // the cut, and comes back round a full turn to the same pose to leave.
    turn.rotation.y =
      lerp(-0.95, 0.35, inOut(smooth(0.05, 0.3, p))) +
      0.3 * smooth(0.55, 0.8, p) +
      (Math.PI * 2 - 0.95 - 0.65) * inOut(smooth(0.8, 0.95, p));

    const cut = inOut(smooth(0.1, 0.32, p)) * (1 - inOut(smooth(0.8, 0.94, p)));
    cutX.constant = lerp(1, 0, cut);
    cutZ.constant = lerp(1, 0, cut);
    // Closed, the powder's edge shows through the foot ring: only while cut.
    powder.visible = siphon.visible = cut > 0.001;

    const e = smooth(0.32, 0.6, p) * (1 - smooth(0.75, 0.92, p));
    for (const g of groups) {
      const t = inOut(clamp01((e - g.delay) / 0.7));
      g.meshes.forEach((m, i) => {
        m.position.copy(g.rest[i]).addScaledVector(g.explode, t);
        m.rotation.z = (g.tilt ?? 0) * t;
      });
    }

    place(e);
    (shadow.material as THREE.MeshBasicMaterial).opacity = 1 - e * 0.7;

    // The hand-overs: this model is only shown between them.
    canvas.style.opacity = still || (p > 0.003 && p < 0.997) ? "1" : "0";
    intro.style.opacity = (1 - smooth(0.3, 0.4, p)).toFixed(3);
    renderer.render(scene, camera);
    layoutCallouts(p, e);
  };

  const resize = () => {
    const r = host.getBoundingClientRect();
    W = r.width;
    H = r.height;
    titleBottom = intro.getBoundingClientRect().bottom - r.top;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    publishOpen();
    draw();
  };
  await renderer.compileAsync(scene, camera).catch(() => {});
  if (cancelled()) {
    renderer.dispose();
    env.dispose();
    return () => {};
  }
  host.appendChild(canvas);
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  ro.observe(intro); // the title's height (web font, wrapping) moves the narrow framing

  // Draw when the stage's progress moves.
  let drawn = -1;
  const tick = () => {
    if (progress() === drawn) return;
    drawn = progress();
    draw();
  };
  if (!still) gsap.ticker.add(tick);
  section.dataset.live = "";

  return () => {
    gsap.ticker.remove(tick);
    ro.disconnect();
    renderer.dispose();
    env.dispose();
    canvas.remove();
    delete section.dataset.live;
  };
}
