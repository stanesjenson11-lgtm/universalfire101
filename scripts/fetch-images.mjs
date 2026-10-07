// One-off: copies every image the old WordPress site uses into public/site/,
// full-size where WordPress kept an original next to the resized copy.
// Source list = <img> tags in assets-src/wp/pages.json + CSS backgrounds the
// REST API doesn't expose (listed by hand from the crawl).
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public/site");
const pages = JSON.parse(await readFile(path.join(ROOT, "assets-src/wp/pages.json"), "utf8"));

const EXTRA = [
  "2021/12/logo-final1.png",
  "2024/08/fav.png",
  "2024/01/commercial-building.webp",
  "2024/01/hospital_1.webp",
  "2024/01/kitchen_1.webp",
  "2024/01/office_1.webp",
  "2024/01/schools-and-hos_1.webp",
  "2024/01/commercial-building-300x300-2.jpg",
  "2023/12/office.jpg",
  "2023/12/hospital.jpg",
  "2023/12/restaurant.jpg",
  "2024/01/school-and-college-e1708079406125.png",
  "2023/12/factory.jpg",
  "2024/02/99830-1024x585-1.webp",
  "2024/01/Fire-Safety-2.webp",
  "2024/03/fire-extinguisher.webp",
].map((p) => `https://universalfire101.com/wp-content/uploads/${p}`);

const urls = new Set(EXTRA);
for (const p of pages) {
  for (const m of p.content.rendered.matchAll(/<img[^>]+src="([^"]+)"/g)) urls.add(m[1]);
}

await mkdir(OUT, { recursive: true });
const SIZED = /-\d{2,4}x\d{2,4}(?=\.[a-z]+$)/i;
let ok = 0;
const failed = [];
for (const url of urls) {
  if (!/wp-content\/uploads/.test(url) || /\.svg$/i.test(url)) continue;
  const name = decodeURIComponent(url.split("/").pop()).replace(SIZED, "");
  const dest = path.join(OUT, name);
  if (await access(dest).then(() => true, () => false)) { ok++; continue; }
  // Original first; WordPress' resized copy if the original is gone.
  let res;
  for (const u of [url.replace(SIZED, ""), url]) {
    res = await fetch(u);
    if (res.ok) break;
  }
  if (!res.ok) { failed.push(url); continue; }
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  ok++;
}
console.log(`fetched ${ok} images into public/site`);
if (failed.length) console.log("failed:\n" + failed.join("\n"));
