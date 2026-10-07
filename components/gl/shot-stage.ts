import * as THREE from "three";
import { gsap, ScrollTrigger } from "@/lib/motion";
import { shot } from "@/lib/shot";
import { fireLeft } from "@/lib/foam";
import { extinguisher, studioEnvironment, nozzleTip, hoseTop, contactShadow, HEIGHT } from "./extinguisher3d";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Els = {
  stage: HTMLElement;
  hero: HTMLElement;
  fire: HTMLElement;
  home: HTMLElement;
  land: HTMLElement;
};

/**
 * The extinguisher shot, Kickstart's ProjectorShot idea in real 3D.
 *
 * The scanned extinguisher stands in the hero. Scrolling, it tips off its
 * base, tumbles down into the fire section and lands at the right, hose
 * toward the flames. The section pins; the safety pin comes out, the hose
 * swings up and aims, and foam jets out of its nozzle — tip and direction are
 * projected from the model every frame into the fire canvas (shot.nozzle,
 * shot.nozzleDir) — and smothers the fire, spreading out from where it lands.
 *
 * Two scrubbed tweens over plain numbers, so scrolling back reverses it all.
 * Under reduced motion the model just stands in the hero (no tweens).
 */
export async function mountShotStage({ stage, hero, fire, home, land }: Els, still: boolean) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return () => {};
  }
  const phone = window.matchMedia("(max-width: 620px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, phone ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

  const scene = new THREE.Scene();
  const [env, model] = await Promise.all([studioEnvironment(renderer), extinguisher()]);
  scene.environment = env;
  scene.environmentIntensity = 0.85;

  const key = new THREE.DirectionalLight("#ffffff", 1.6);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight("#9fb6ff", 1.1); // cool night rim in the hero
  rim.position.set(4, 3, -4);
  const fireLight = new THREE.PointLight("#ff6a2b", 0, 0, 1.6); // the flames, from below-left
  scene.add(key, rim, fireLight);

  // Rig origin at the model's centre, so the tumble turns about its middle.
  const { root, parts } = model;
  root.position.set(0, -HEIGHT / 2, -0.03);
  const rig = new THREE.Group();
  rig.rotation.order = "ZYX"; // turn to face first, then tumble in the screen's plane
  rig.add(root);
  scene.add(rig);
  const shadow = contactShadow(0.42, 0.8);
  scene.add(shadow);

  const tip = nozzleTip(parts.hose);
  const pinRest = parts.pin.position.clone();

  // The hose swings up from where it joins the valve, like a nozzle being
  // aimed: hang it from a pivot at its highest point and turn the pivot.
  const pivotAt = hoseTop(parts.hose);
  const hosePivot = new THREE.Group();
  hosePivot.position.copy(pivotAt);
  parts.hose.parent!.add(hosePivot);
  hosePivot.add(parts.hose);
  parts.hose.position.sub(pivotAt);
  const aim = new THREE.Vector3();

  const FOV = 20;
  const D = 6;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, D);
  let W = 1;
  let H = 1;
  let k = 1; // world units per CSS pixel on the z = 0 plane
  const resize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    k = (2 * D * Math.tan((FOV * Math.PI) / 360)) / H;
  };
  resize();
  window.addEventListener("resize", resize);
  const world = (sx: number, sy: number) => new THREE.Vector3((sx - W / 2) * k, (H / 2 - sy) * k, 0);

  const state = { r: 0, s: still ? 0 : 0 };
  const v = new THREE.Vector3();

  const apply = (time: number) => {
    const a = home.getBoundingClientRect();
    const b = land.getBoundingClientRect();
    const f = fire.getBoundingClientRect();
    const heroOn = a.bottom > -H && hero.getBoundingClientRect().bottom > 0;
    const fireOn = f.bottom > 0 && f.top < H;
    if (!heroOn && !fireOn) {
      // Off both sections: leave nothing on the fixed layer.
      if (canvas.style.visibility !== "hidden") canvas.style.visibility = "hidden";
      return;
    }
    if (canvas.style.visibility === "hidden") canvas.style.visibility = "";

    const r = state.r;
    const s = state.s;
    const e = inOut(r);

    // Stand on the bottom centre of each anchor box, sized to its height.
    const p0 = world(a.left + a.width / 2, a.bottom);
    const p1 = world(b.left + b.width / 2, b.bottom);
    const h = lerp(a.height, b.height, e) * k;
    const scale = h / HEIGHT;
    const base = p0.lerp(p1, e);
    // A hop off the floor, then down into the next room.
    const hop = Math.sin(Math.PI * r) * H * 0.1 * k;
    rig.position.set(base.x, base.y + h / 2 + hop, 0);
    rig.scale.setScalar(scale);

    // Facing: three-quarter in the hero with a slow idle sway, turning to put
    // the hose toward the fire as it lands. Tumble: one full turn, end over end.
    const idle = still ? 0 : Math.sin(time * 0.35) * 0.18 * (1 - e);
    rig.rotation.y = lerp(-0.75, -0.3, e) + idle;
    const lean = r < 0.1 ? -Math.sin((r / 0.1) * Math.PI) * 0.08 : 0;
    rig.rotation.z = -Math.PI * 2 * e + lean;

    // The discharge: the pin comes out first, then the body kicks with it.
    const pulled = smooth(0.0, 0.05, s);
    parts.pin.position.set(pinRest.x + pulled * 0.12, pinRest.y - smooth(0.04, 0.12, s) * 0.5, pinRest.z);
    parts.pin.visible = s < 0.12;
    // Then the hose comes up and points at the fire, ~106° from hanging.
    hosePivot.rotation.z = -1.85 * inOut(smooth(0.02, 0.09, s));
    const spraying = s > 0.06 && s < 0.9;
    if (spraying) rig.position.x += Math.sin(time * 47) * 0.0025 * scale;

    // Contact shadow on the floor under it, only while it is on the ground.
    const grounded = 1 - Math.sin(Math.PI * clamp01(r * 1.1));
    shadow.position.set(rig.position.x, base.y + 0.002, 0);
    shadow.scale.setScalar(scale);
    (shadow.material as THREE.MeshBasicMaterial).opacity = grounded;

    // Fire light: comes up as the fire section rises, dies with the fire.
    const firePresence = clamp01((H - f.top) / H);
    fireLight.position.set(rig.position.x - h * 1.2, base.y + h * 0.2, h * 0.8);
    fireLight.intensity = 6 * firePresence * fireLeft(s) * (0.85 + 0.15 * Math.sin(time * 9.7) * Math.sin(time * 6.1));
    rim.intensity = 1.1 * (1 - firePresence * 0.7);

    // The nozzle opening, into fire-section space for the foam.
    rig.updateMatrixWorld(true);
    // And the way it points: from the hose's pivot through its tip, on screen.
    aim.copy(pivotAt).applyMatrix4(parts.hose.parent!.parent!.matrixWorld).project(camera);
    v.copy(tip).applyMatrix4(parts.hose.matrixWorld).project(camera);
    {
      const dx = (v.x - aim.x) * W;
      const dy = -(v.y - aim.y) * H;
      const len = Math.hypot(dx, dy) || 1;
      shot.nozzleDir[0] = dx / len;
      shot.nozzleDir[1] = dy / len;
    }
    const nx = (v.x * 0.5 + 0.5) * W;
    const ny = (-v.y * 0.5 + 0.5) * H;
    shot.nozzle[0] = (nx - f.left) / Math.max(1, f.height);
    shot.nozzle[1] = (ny - f.top) / Math.max(1, f.height);

    fire.dataset.ground = !shot.live || s > 0.55 ? "light" : "dark";
    fire.style.setProperty("--hl", clamp01((s - 0.8) / 0.12).toFixed(3));
    renderer.render(scene, camera);
  };

  const tick = () => apply(performance.now() / 1000);
  stage.appendChild(canvas);
  document.documentElement.classList.add("ext-live");

  let ctx: gsap.Context | undefined;
  if (!still) {
    ctx = gsap.context(() => {
      gsap.to(state, {
        r: 1,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.7 },
      });
      if (shot.live) {
        gsap.to(state, {
          s: 1,
          ease: "none",
          onUpdate: () => void (shot.spray = state.s),
          scrollTrigger: { trigger: fire, start: "top top", end: phone ? "+=170%" : "+=240%", pin: true, scrub: 0.7 },
        });
      } else {
        state.s = shot.spray = 1;
      }
    });
  } else {
    state.s = shot.spray = 1;
  }
  gsap.ticker.add(tick);
  tick();
  // Pins made after load change the page height below them: re-measure all.
  ScrollTrigger.refresh();

  return () => {
    gsap.ticker.remove(tick);
    ctx?.revert();
    window.removeEventListener("resize", resize);
    renderer.dispose();
    env.dispose();
    canvas.remove();
    document.documentElement.classList.remove("ext-live");
    shot.spray = 0;
  };
}
