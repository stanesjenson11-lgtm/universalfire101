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
export async function mountShotStage({ stage, hero, fire, home, land }: Els, still: boolean, cancelled: () => boolean = () => false) {
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
  // Superseded while loading (a remount): build nothing — a second set of
  // pins on the same sections would fight this one's.
  if (cancelled()) {
    renderer.dispose();
    env.dispose();
    return () => {};
  }
  scene.environment = env;
  scene.environmentIntensity = 0.85;

  const key = new THREE.DirectionalLight("#ffffff", 1.6);
  key.position.set(-3, 5, 6);
  const rim = new THREE.DirectionalLight("#9fb6ff", 1.1); // cool night rim in the hero
  rim.position.set(4, 3, -4);
  const fireLight = new THREE.PointLight("#ff6a2b", 0, 0, 1.6); // the flames, from below-left
  scene.add(key, rim, fireLight);
  // The exploded view's lights (components/gl/exploded.ts), turned by the pitch
  // the companion takes for the hand-over: it arrives lit the way it is there.
  const X = new THREE.Vector3(1, 0, 0);
  const keyOut = key.position.clone();
  const rimOut = rim.position.clone();
  const keyIn = new THREE.Vector3(-3, 5, 5).applyAxisAngle(X, 0.14);
  const rimIn = new THREE.Vector3(4, 2, -4).applyAxisAngle(X, 0.14);
  const cool = new THREE.Color("#9fb6ff");
  const warm = new THREE.Color("#ff9a5c");

  // Rig origin at the model's centre, so the tumble turns about its middle.
  const { root, parts } = model;
  root.position.set(0, -HEIGHT / 2, -0.03);
  const rig = new THREE.Group();
  // Turn to face, then pitch toward the camera (as the exploded view's camera
  // looks down), then tumble in the screen's plane.
  rig.rotation.order = "ZXY";
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

  /*
   * Companion: after the fire it keeps you company down the page, drifting in
   * the margin beside each section — gsap.com/scroll's props, but this one is
   * the product. One pose per section (side of the screen, height, size,
   * facing, lean); it eases from pose to pose as each section passes.
   *  - At "Inside every extinguisher" it flies to the centre at exactly the
   *    size, angle and tilt the exploded view starts from, and the two models
   *    cross-fade (shot.inside): it merges in, and comes back out the same way.
   *  - From the products on it keeps to the left margin and turns as you
   *    scroll. At "Looked after, all year" it rockets off down to the right,
   *    dripping foam, and comes back up for "Send an enquiry".
   *  - Its long moves are a rocket boost (lying over toward where it is going
   *    on a jet of foam), a trail of foam residue, or both; only while you
   *    are actually scrolling.
   *  - It ends standing upright in the footer's 24/7 band.
   * Only where the margins are wide enough to hold it.
   */
  const companion = !still && window.matchMedia("(min-width: 1280px)").matches;
  type Pose = {
    sel: string; side: number; y: number; h: number; yaw: number; tilt: number; o: number;
    fx?: number; onPage?: boolean; exact?: boolean; pitch?: number; el?: HTMLElement | null;
    /** How it travels into this pose. */
    move?: { rocket?: boolean; trail?: boolean };
  };
  const POSES = ([
    { sel: "#about", side: 1, y: 0.62, h: 0.24, yaw: 0.7, tilt: -0.16, o: 1 },
    // The exploded view's opening frame: centred, 69% of the screen, facing -0.95.
    { sel: "#inside", side: 0, fx: 0.5, y: 0.572, h: 0.69, yaw: -0.95, tilt: 0, pitch: 0.14, o: 1, exact: true, move: { rocket: true } },
    { sel: "#products", side: -1, y: 0.6, h: 0.24, yaw: -0.5, tilt: 0.2, o: 1, move: { trail: true } },
    { sel: "#specs", side: -1, y: 0.64, h: 0.24, yaw: -0.5, tilt: 0.12, o: 1 },
    // Away: off the bottom right of the screen, until the enquiry form.
    { sel: "#services", side: 0, fx: 1.15, y: 1.45, h: 0.24, yaw: -0.5, tilt: 0, o: 0, move: { rocket: true, trail: true } },
    { sel: "#sectors", side: 0, fx: 1.15, y: 1.45, h: 0.24, yaw: -0.5, tilt: 0, o: 0 },
    { sel: "#equipment", side: 0, fx: 1.15, y: 1.45, h: 0.24, yaw: -0.5, tilt: 0, o: 0 },
    { sel: "#why", side: 0, fx: 1.15, y: 1.45, h: 0.24, yaw: -0.5, tilt: 0, o: 0 },
    // (moves under the left margin unseen, to rise back up there)
    { sel: "#licence", side: -1, y: 1.45, h: 0.24, yaw: -0.5, tilt: 0.1, o: 0 },
    { sel: "#contact", side: -1, y: 0.62, h: 0.24, yaw: -0.5, tilt: 0.1, o: 1 },
    { sel: "footer", side: 1, y: 0.16, h: 0.24, yaw: -0.5, tilt: 0, o: 1, fx: 0.58, onPage: true, exact: true, move: { trail: true } }, // upright in the 24/7 band
  ] as Pose[]).map((p) => ({ ...p, el: document.querySelector<HTMLElement>(p.sel) }));
  const pose = { x: 0, y: 0, h: 0, yaw: 0, tilt: 0, pitch: 0, o: 0, rocket: 0, trail: 0, dx: 0, dy: 0, ins: 0 };
  let lastY = window.scrollY;
  let lean = 0;
  let speed = 0;
  const companionPose = (time: number) => {
    const mid = H * 0.5;
    let c = 0;
    POSES.forEach((p, i) => p.el && p.el.getBoundingClientRect().top <= mid && (c = i));
    const cur = POSES[c];
    const next = POSES[Math.min(c + 1, POSES.length - 1)];
    // Holds its pose through a section (however long — pinned ones are), and
    // moves on as the next section rises from the bottom to the middle.
    const nextTop = next === cur ? H : next.el!.getBoundingClientRect().top;
    const t = inOut(clamp01((H - nextTop) / (H - mid)));
    // In the middle of the margin beside the 72rem content column.
    const margin = Math.max(56, (W - 1152) / 4);
    const sx = (p: Pose) => (p.fx !== undefined ? W * p.fx : p.side > 0 ? W - margin : margin);
    // onPage poses sit on their section (y from its top) and scroll with it.
    const py = (p: Pose) => (p.onPage ? p.el!.getBoundingClientRect().top + p.y * H : p.y * H);
    // Exact poses (the hand-over, the finale) get no idle drift.
    const ex = lerp(cur.exact ? 1 : 0, next.exact ? 1 : 0, t);
    pose.x = lerp(sx(cur), sx(next), t);
    pose.y = lerp(py(cur), py(next), t) + Math.sin(time * 0.7) * H * 0.012 * (1 - ex);
    pose.h = lerp(cur.h, next.h, t) * H;
    // Drifts idly up to the exploded view; from the products on it turns with
    // the scroll instead (one turn every five screens or so).
    const spin = Math.max(0, H - POSES[2].el!.getBoundingClientRect().top) / H * 1.2;
    pose.yaw = lerp(cur.yaw, next.yaw, t) + (c === 0 ? Math.sin(time * 0.25) * 0.6 * (1 - ex) : spin);
    pose.pitch = lerp(cur.pitch ?? 0, next.pitch ?? 0, t);
    // How far into the hand-over pose: it takes on the exploded view's light.
    pose.ins = c === 0 ? t : c === 1 ? 1 - t : 0;
    // While the exploded view holds the screen, it is the exploded model. That
    // one is already showing underneath, identical, so this one just fades.
    const merged = c === 1 ? smooth(0.006, 0.05, shot.inside) * (1 - smooth(0.95, 0.99, shot.inside)) : 0;
    // Fading out it holds on until it is nearly off the screen.
    pose.o = lerp(cur.o, next.o, next.o < cur.o ? t * t * t : t) * (1 - merged);
    // Leans into the scroll, a beat behind it.
    const vel = window.scrollY - lastY;
    lastY = window.scrollY;
    lean += (Math.max(-0.35, Math.min(0.35, vel * 0.004)) - lean) * 0.06;
    speed += (Math.min(1, Math.abs(vel) / 3) - speed) * 0.15;
    pose.tilt = lerp(cur.tilt, next.tilt, t) + (Math.sin(time * 0.5) * 0.04 - lean) * (1 - ex);
    // Long moves: rocket and/or trail, as the pose it is heading for says.
    const dx = sx(next) - sx(cur);
    const dy = py(next) - py(cur);
    const len = Math.hypot(dx, dy) || 1;
    pose.dx = dx / len;
    pose.dy = dy / len;
    const crossing = len > W * 0.2 && next !== cur ? Math.sin(Math.PI * t) : 0;
    pose.rocket = next.move?.rocket ? crossing : 0;
    pose.trail = next.move?.trail ? crossing * speed : 0;
  };

  /* Foam the companion leaves behind: flat white puffs on their own canvas,
     under the 3D one so the extinguisher sits in front of its own jet. */
  const fx = document.createElement("canvas");
  fx.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  const g2 = fx.getContext("2d")!;
  type Puff = { x: number; y: number; vx: number; vy: number; r0: number; r1: number; age: number; life: number };
  let puffs: Puff[] = [];
  let lastT = 0;
  const foam = (time: number, nx: number, ny: number, rocket: number, trail: number) => {
    const dt = Math.min(1, lastT ? time - lastT : 0.016); // real time, so puffs clear even at low frame rates
    lastT = time;
    if (fx.width !== W || fx.height !== H) {
      fx.width = W;
      fx.height = H;
    }
    const R = (a: number, b: number) => a + Math.random() * (b - a);
    // Rocket: a hard jet out of the nozzle, opposite to the way it flies.
    if (rocket * speed > 0.15)
      for (let i = 0; i < Math.round(rocket * speed * 5); i++)
        puffs.push((() => {
          const v = R(380, 720);
          const j = R(-60, 60);
          return { x: nx + R(-3, 3), y: ny + R(-3, 3), vx: -pose.dx * v - pose.dy * j, vy: -pose.dy * v + pose.dx * j, r0: R(3, 6), r1: R(16, 30), age: 0, life: R(0.5, 0.9) };
        })());
    // Trail: drips and splats left where it passed, sinking a little.
    if (trail > 0.12 && Math.random() < trail * 0.9)
      puffs.push({ x: nx + R(-6, 6), y: ny + R(-4, 4), vx: R(-20, 20), vy: R(20, 70), r0: R(4, 8), r1: R(9, 18), age: 0, life: R(1.2, 2) });
    g2.clearRect(0, 0, W, H);
    puffs = puffs.filter((p) => (p.age += dt) < p.life);
    for (const p of puffs) {
      const u = p.age / p.life;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy = p.vy * 0.96 + 30 * dt;
      const r = p.r0 + (p.r1 - p.r0) * (1 - (1 - u) * (1 - u));
      const a = 1 - u * u;
      g2.beginPath();
      g2.arc(p.x, p.y, r, 0, Math.PI * 2);
      g2.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
      g2.fill();
      g2.lineWidth = 1;
      g2.strokeStyle = `rgba(110,110,120,${(a * 0.35).toFixed(3)})`; // so it reads on white too
      g2.stroke();
    }
  };

  const apply = (time: number) => {
    const a = home.getBoundingClientRect();
    const b = land.getBoundingClientRect();
    const f = fire.getBoundingClientRect();
    const heroOn = a.bottom > -H && hero.getBoundingClientRect().bottom > 0;
    const fireOn = f.bottom > 0 && f.top < H;
    // 0 while the fire section holds the screen, 1 once it has gone.
    const after = companion ? clamp01((H * 0.9 - f.bottom) / (H * 0.6)) : 0;
    if (!heroOn && !fireOn && !companion) {
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

    // Into companion mode as the fire section leaves.
    let o = 1;
    if (after > 0) {
      companionPose(time);
      const blend = inOut(after);
      const target = world(pose.x, pose.y);
      rig.position.lerp(target, blend);
      rig.scale.setScalar(lerp(scale, (pose.h * k) / HEIGHT, blend));
      rig.rotation.y = lerp(rig.rotation.y, pose.yaw, blend);
      // Rocketing, it lies over with its head toward where it is going.
      const flying = lerp(pose.tilt, Math.atan2(-pose.dx, -pose.dy), pose.rocket);
      rig.rotation.z = lerp(rig.rotation.z, flying, blend);
      rig.rotation.x = pose.pitch * blend;
      o = lerp(1, pose.o, blend);
    }
    if (!companion && !fireOn && !heroOn) o = 0;
    canvas.style.opacity = o.toFixed(3);
    if (o < 0.01) {
      if (puffs.length) foam(time, 0, 0, 0, 0);
      return;
    }

    // The discharge: the pin comes out first, then the body kicks with it.
    const pulled = smooth(0.0, 0.05, s);
    parts.pin.position.set(pinRest.x + pulled * 0.12, pinRest.y - smooth(0.04, 0.12, s) * 0.5, pinRest.z);
    parts.pin.visible = s < 0.12 || after > 0.5;
    // Then the hose comes up and points at the fire, ~106° from hanging —
    // and hangs back down once the job is done and it moves on.
    hosePivot.rotation.z = -1.85 * inOut(smooth(0.02, 0.09, s)) * (1 - inOut(after));
    const spraying = s > 0.06 && s < 0.9;
    if (spraying) rig.position.x += Math.sin(time * 47) * 0.0025 * scale;

    // Contact shadow on the floor under it, only while it is on the ground.
    const grounded = 1 - Math.sin(Math.PI * clamp01(r * 1.1));
    shadow.position.set(rig.position.x, base.y + 0.002, 0);
    shadow.scale.setScalar(scale);
    (shadow.material as THREE.MeshBasicMaterial).opacity = grounded * (1 - after);

    // Fire light: comes up as the fire section rises, dies with the fire.
    const firePresence = clamp01((H - f.top) / H);
    fireLight.position.set(rig.position.x - h * 1.2, base.y + h * 0.2, h * 0.8);
    fireLight.intensity = 6 * firePresence * fireLeft(s) * (0.85 + 0.15 * Math.sin(time * 9.7) * Math.sin(time * 6.1));
    rim.intensity = 1.1 * (1 - firePresence * 0.7);
    const ins = after > 0 ? pose.ins * inOut(after) : 0;
    key.intensity = lerp(1.6, 1.4, ins);
    key.position.lerpVectors(keyOut, keyIn, ins);
    rim.position.lerpVectors(rimOut, rimIn, ins);
    rim.color.lerpColors(cool, warm, ins);
    rim.intensity = lerp(rim.intensity, 2, ins);
    scene.environmentIntensity = lerp(0.85, 0.9, ins);

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
    if (companion) foam(time, nx, ny, after > 0.95 ? pose.rocket : 0, after > 0.95 ? pose.trail : 0);

    fire.dataset.ground = !shot.live || s > 0.55 ? "light" : "dark";
    fire.style.setProperty("--hl", clamp01((s - 0.8) / 0.12).toFixed(3));
    renderer.render(scene, camera);
  };

  const tick = () => apply(performance.now() / 1000);
  stage.appendChild(fx);
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
    fx.remove();
    document.documentElement.classList.remove("ext-live");
    shot.spray = 0;
  };
}
