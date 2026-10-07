// Builds public/models/extinguisher/ from the CC0 Poly Haven scan in
// assets-src/models/korean_fire_extinguisher_01 (by UM JOORIN, polyhaven.com):
//
//  1. Splits the single body primitive into named parts — the scan is made of
//     separate interlocking pieces (cylinder, valve, lever, hose…), so each
//     connected island (vertices welded by position) is classified by where it
//     sits and becomes its own node. That is what lets the site take it apart.
//  2. Rebrands the textures for Universal Fire: the base plate lettering, the
//     cylinder sticker and the inspection tag are repainted in English.
//  3. Writes a .gltf + .bin + JPEGs the browser loads with three's GLTFLoader.
//
// node scripts/build-model.mjs
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-src/models/korean_fire_extinguisher_01");
const OUT = path.join(ROOT, "public/models/extinguisher");
const NAME = "korean_fire_extinguisher_01";

const g = JSON.parse(await readFile(path.join(SRC, `${NAME}_2k.gltf`), "utf8"));
const bin = await readFile(path.join(SRC, `${NAME}.bin`));

const read = (i) => {
  const a = g.accessors[i];
  const v = g.bufferViews[a.bufferView];
  const off = (v.byteOffset || 0) + (a.byteOffset || 0);
  const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const T = { 5126: Float32Array, 5125: Uint32Array, 5123: Uint16Array }[a.componentType];
  return new T(bin.buffer.slice(bin.byteOffset + off, bin.byteOffset + off + a.count * n * T.BYTES_PER_ELEMENT));
};

/* --- 1. islands of the body primitive ------------------------------------ */
const body = g.meshes[0].primitives[0];
const pos = read(body.attributes.POSITION);
const idx = read(body.indices);
const nv = pos.length / 3;
const weld = new Int32Array(nv);
const seen = new Map();
for (let i = 0; i < nv; i++) {
  const k = `${Math.round(pos[i * 3] * 1e4)},${Math.round(pos[i * 3 + 1] * 1e4)},${Math.round(pos[i * 3 + 2] * 1e4)}`;
  if (!seen.has(k)) seen.set(k, i);
  weld[i] = seen.get(k);
}
const parent = Int32Array.from({ length: nv }, (_, i) => i);
const find = (x) => {
  while (parent[x] !== x) x = parent[x] = parent[parent[x]];
  return x;
};
for (let t = 0; t < idx.length; t += 3)
  for (const [a, b] of [[0, 1], [1, 2]]) {
    const ra = find(weld[idx[t + a]]), rb = find(weld[idx[t + b]]);
    if (ra !== rb) parent[ra] = rb;
  }
const islands = new Map();
for (let t = 0; t < idx.length; t += 3) {
  const r = find(weld[idx[t]]);
  if (!islands.has(r)) islands.set(r, { tris: [], min: [1e9, 1e9, 1e9], max: [-1e9, -1e9, -1e9] });
  const s = islands.get(r);
  s.tris.push(idx[t], idx[t + 1], idx[t + 2]);
  for (let k = 0; k < 3; k++)
    for (let c = 0; c < 3; c++) {
      const v = pos[idx[t + k] * 3 + c];
      if (v < s.min[c]) s.min[c] = v;
      if (v > s.max[c]) s.max[c] = v;
    }
}

/* Classify by where each piece sits (metres, y up, z toward the viewer). */
const list = [...islands.values()].sort((a, b) => b.tris.length - a.tris.length);
const cylinder = list[0];
const classify = (s) => {
  if (s === cylinder) return "cylinder";
  const [x0, y0, z0] = s.min;
  const [x1, y1] = s.max;
  if (y1 < 0.13) return "base";
  if (y1 - y0 < 0.03 && x1 - x0 > 0.15) return "strap";
  if (x1 < -0.035) return "hose"; // hose, coupling, nozzle — all left of the valve
  if (y1 < 0.45) return "cylinder"; // decals stuck to the shell
  if (z0 > 0.05 && y0 > 0.55) return "gauge";
  if (y1 > 0.64) return "lever";
  if (x1 > 0.09) return "handle";
  if (x1 < -0.015 && y0 > 0.585) return "pin";
  return "valve";
};
const parts = new Map();
for (const s of list) {
  const name = classify(s);
  if (!parts.has(name)) parts.set(name, []);
  parts.get(name).push(...s.tris);
}
for (const [k, v] of parts) console.log(`${k.padEnd(9)} ${String(v.length / 3).padStart(5)} tris`);

/* --- 3. new buffer: original data + one index buffer per part ------------ */
const chunks = [bin];
let offset = bin.length;
const pad = () => {
  const p = (4 - (offset % 4)) % 4;
  if (p) {
    chunks.push(Buffer.alloc(p));
    offset += p;
  }
};
const nodes = [];
const meshes = [];
const addIndices = (arr) => {
  pad();
  const data = Buffer.from(new Uint32Array(arr).buffer);
  g.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: data.length, target: 34963 });
  g.accessors.push({ bufferView: g.bufferViews.length - 1, componentType: 5125, count: arr.length, type: "SCALAR" });
  chunks.push(data);
  offset += data.length;
  return g.accessors.length - 1;
};
for (const [name, tris] of parts) {
  meshes.push({ name, primitives: [{ ...body, indices: addIndices(tris) }] });
  nodes.push({ name, mesh: meshes.length - 1 });
}
// Gauge glass and inspection tag are their own primitives already.
const [, glass, paper] = g.meshes[0].primitives;
meshes.push({ name: "gauge-glass", primitives: [glass] });
nodes.push({ name: "gauge-glass", mesh: meshes.length - 1 });
meshes.push({ name: "tag", primitives: [paper] });
nodes.push({ name: "tag", mesh: meshes.length - 1 });

g.meshes = meshes;
g.nodes = [{ name: "extinguisher", children: nodes.map((_, i) => i + 1) }, ...nodes];
g.scenes = [{ name: "Scene", nodes: [0] }];
g.scene = 0;
const outBin = Buffer.concat(chunks);
g.buffers = [{ uri: "extinguisher.bin", byteLength: outBin.length }];

/* --- 2. textures: rebranded, sized for the web ---------------------------- */
await mkdir(OUT, { recursive: true });
const T = (n) => path.join(SRC, "textures", `${NAME}_${n}_2k.jpg`);
const emblem = await readFile(path.join(ROOT, "app/icon.svg"), "utf8");
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

// Base plate: the lettering painted over in the plate's own red, then
// "UNIVERSAL FIRE" in the same off-white, slightly worn.
const plate = svg(
  620, 170,
  `<rect width="620" height="170" fill="#8e1b14"/>
   <text x="310" y="118" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="86" fill="#d9d4cc" letter-spacing="6">UNIVERSAL</text>`,
);
// Cylinder sticker: Universal's label in place of the Korean one.
const sticker = svg(
  474, 176,
  `<rect width="474" height="176" rx="6" fill="#f3f2ee"/>
   <rect x="0" y="0" width="474" height="40" fill="#b5121b"/>
   <text x="237" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#fff">UNIVERSAL FIRE SAFETY EQUIPMENTS</text>
   <g transform="translate(14 50) scale(0.6)">${emblem.replace(/<\/?svg[^>]*>/g, "")}</g>
   <text x="150" y="86" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="40" fill="#b5121b">ABC 6 kg</text>
   <text x="150" y="116" font-family="Arial, sans-serif" font-weight="700" font-size="19" fill="#1d1d1f">Dry powder · stored pressure</text>
   <text x="150" y="142" font-family="Arial, sans-serif" font-size="17" fill="#1d1d1f">IS 15683 · ISI · BIS approved</text>
   <text x="150" y="164" font-family="Arial, sans-serif" font-size="15" fill="#555">+91 98430 77907 · 24/7</text>`,
);
await sharp(T("body_diff"))
  .composite([
    { input: plate, left: 30, top: 50 },
    { input: sticker, left: 391, top: 1201 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(OUT, "body_diff.jpg"));

// Inspection tag: the blank back of the tag laid over the Korean front, then
// an English record printed on it (multiplied, so the paper's wear shows).
const back = await sharp(T("paper_diff")).extract({ left: 1037, top: 705, width: 937, height: 1274 }).toBuffer();
const rows = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  .map((m, i) => `<text x="70" y="${520 + i * 92}" font-family="Arial" font-size="40" fill="#333">${m} 2026</text>
                  <text x="420" y="${520 + i * 92}" font-family="Arial" font-size="40" fill="#333">${i < 5 ? "OK" : ""}</text>
                  <line x1="50" x2="890" y1="${545 + i * 92}" y2="${545 + i * 92}" stroke="#c9c4bc" stroke-width="3"/>`)
  .join("");
const record = svg(
  937, 1274,
  `<rect x="40" y="70" width="857" height="150" fill="#b5121b"/>
   <text x="468" y="170" text-anchor="middle" font-family="Arial" font-weight="700" font-size="64" fill="#fff">INSPECTION RECORD</text>
   <text x="70" y="300" font-family="Arial" font-weight="700" font-size="42" fill="#222">Universal Fire Safety Equipments</text>
   <text x="70" y="370" font-family="Arial" font-size="38" fill="#444">Type: ABC dry powder, 6 kg</text>
   <text x="70" y="430" font-family="Arial" font-size="38" fill="#444">Next refill: Jan 2027</text>${rows}`,
);
const tagBase = await sharp(T("paper_diff"))
  .composite([{ input: back, left: 32, top: 46 }])
  .toBuffer();
// (sharp resizes before it composites, so the print goes on at full size first)
const printed = await sharp(tagBase).composite([{ input: record, left: 32, top: 46, blend: "multiply" }]).toBuffer();
await sharp(printed)
  .resize(1024)
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(path.join(OUT, "paper_diff.jpg"));

// The old lettering is also embossed in the normal map and the roughness
// map, and would still catch the light as ghost letters: flatten both under
// the repainted plate (flat normal = rgb 128,128,255; AO 1, mid rough, no metal).
const flat = (rgb) => svg(620, 170, `<rect width="620" height="170" fill="${rgb}"/>`);
await sharp(T("body_nor_gl")).composite([{ input: flat("rgb(128,128,255)"), left: 30, top: 50 }]).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(OUT, "body_nor_gl.jpg"));
await sharp(T("body_arm")).composite([{ input: flat("rgb(255,150,0)"), left: 30, top: 50 }]).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(OUT, "body_arm.jpg"));

// The rest as they are, the small ones at 1K.
const copy = async (n, size) => sharp(T(n)).resize(size).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, `${n}.jpg`));
await Promise.all([
  copy("paper_arm", 1024), copy("paper_nor_gl", 1024),
  copy("glass_diff", 1024), copy("glass_arm", 1024), copy("glass_nor_gl", 1024),
]);
for (const img of g.images) img.uri = path.basename(img.uri).replace(`${NAME}_`, "").replace("_2k", "");

await writeFile(path.join(OUT, "extinguisher.bin"), outBin);
await writeFile(path.join(OUT, "extinguisher.gltf"), JSON.stringify(g));
console.log(`wrote ${path.relative(ROOT, OUT)} (${(outBin.length / 1024).toFixed(0)} kB geometry)`);
