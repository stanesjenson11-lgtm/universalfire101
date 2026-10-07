/**
 * One fullscreen pass for the fire section: flames rising off the floor, and
 * the extinguisher's foam (a metaball field from lib/foam.ts) laid over them.
 * Where there is foam there is no fire. At full coverage the colour is exactly
 * white, the section below's ground, so the hand-over has no seam.
 */

export const MAX_BLOBS = 96;

export const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const fragment = /* glsl */ `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uAspect;
uniform float uFire;
uniform float uFlood;
uniform int uCount;
uniform vec3 uBlobs[${MAX_BLOBS}];
uniform float uThreshold;
uniform float uSpread;

varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// Distance to the nearest cell point — foam bubbles.
float cells(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = vec2(hash(n + g), hash(n + g + 19.19));
      vec2 r = g + o - f;
      md = min(md, dot(r, r));
    }
  }
  return sqrt(md);
}

// Blackbody-ish: black → ember red → orange → amber. No white core — a
// white-hot band at the floor would read as foam.
vec3 ramp(float t) {
  vec3 c = mix(vec3(0.0), vec3(0.42, 0.04, 0.02), smoothstep(0.0, 0.28, t));
  c = mix(c, vec3(0.86, 0.24, 0.04), smoothstep(0.22, 0.55, t));
  c = mix(c, vec3(0.99, 0.55, 0.12), smoothstep(0.5, 0.8, t));
  return mix(c, vec3(1.0, 0.78, 0.32), smoothstep(0.8, 1.0, t));
}

void main() {
  vec2 p = vec2(vUv.x * uAspect, 1.0 - vUv.y);
  float t = uTime;

  // --- foam field (compact kernel, identical to foamField in lib/foam.ts)
  float f = 0.0;
  vec2 grad = vec2(0.0);
  for (int i = 0; i < ${MAX_BLOBS}; i++) {
    if (i >= uCount) break;
    vec3 b = uBlobs[i];
    if (b.z <= 0.0) continue;
    float R2 = b.z * uSpread * b.z * uSpread;
    vec2 d = p - b.xy;
    float q = 1.0 - dot(d, d) / R2;
    if (q > 0.0) {
      f += q * q * q;
      grad += -6.0 * q * q * d / R2;
    }
  }
  f += uFlood * 4.0;
  float wob = (noise(p * 22.0 + vec2(0.0, t * 0.25)) - 0.5) * 0.5 + (noise(p * 70.0) - 0.5) * 0.25;
  float fe = f + wob * uThreshold * 0.9;
  float aa = 2.5 / uRes.y;
  float foam = smoothstep(uThreshold - 0.015 - aa, uThreshold + 0.015, fe);

  // --- fire
  float height = 1.0 - p.y;
  vec2 q1 = vec2(p.x * 2.4, height * 1.7 - t * 1.05);
  vec2 q2 = vec2(p.x * 5.1 + t * 0.12, height * 3.4 - t * 1.9);
  float n = fbm(q1) * 0.85 + fbm(q2) * 0.4;
  float tongues = 0.55 + 0.25 * sin(p.x * 7.0 + fbm(vec2(p.x * 3.0, t * 0.4)) * 6.0);
  float flame = (n - height * (1.3 - tongues * 0.35) + 0.22) * uFire;
  float smoke = smoothstep(0.35, 0.75, fbm(vec2(p.x * 3.3 - t * 0.2, height * 2.0 - t * 0.6)));
  float ft = clamp(flame * 1.55 - smoke * 0.35 * smoothstep(0.55, 1.0, p.y), 0.0, 0.94);
  vec3 col = ramp(ft);
  col += vec3(0.5, 0.1, 0.02) * uFire * 0.28 * smoothstep(0.35, 1.0, p.y);

  vec2 eg = vec2(p.x * 16.0, (p.y + t * 0.32) * 16.0);
  vec2 cell = floor(eg);
  vec2 off = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float ember = step(0.94, hash(cell)) * smoothstep(0.09, 0.0, length(fract(eg) - 0.5 - off * 0.6));
  col += vec3(1.0, 0.62, 0.22) * ember * uFire * smoothstep(0.1, 0.7, p.y);

  // smothered edge: the fire just outside the foam goes dark
  col *= 1.0 - 0.6 * smoothstep(uThreshold * 0.15, uThreshold, f) * (1.0 - foam);

  // --- foam: domed normal from the field gradient, bubbles at the fresh edge
  vec3 nrm = normalize(vec3(-grad * 0.018, 1.0));
  float light = clamp(dot(nrm, normalize(vec3(-0.35, -0.55, 0.76))), 0.0, 1.0);
  float fresh = 1.0 - smoothstep(uThreshold, uThreshold * 6.0, f);
  float b1 = smoothstep(0.18, 0.62, cells(p * 34.0));
  float b2 = smoothstep(0.2, 0.7, cells(p * 85.0 + 7.0));
  vec3 foamCol = mix(vec3(0.74, 0.75, 0.78), vec3(1.0), light);
  foamCol -= vec3(0.10, 0.09, 0.08) * (b1 * 0.8 + b2 * 0.5) * (0.25 + 0.75 * fresh);
  // the settled bulk flattens to exactly the page's white
  foamCol = mix(foamCol, vec3(1.0), clamp(smoothstep(uThreshold * 3.0, uThreshold * 9.0, f) + uFlood, 0.0, 1.0));

  gl_FragColor = vec4(mix(col, foamCol, foam), 1.0);
}
`;
