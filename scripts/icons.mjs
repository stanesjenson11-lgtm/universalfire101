// One-off: favicon + apple icon from the emblem geometry (lib/mark.ts). The
// ring lettering is left off — it is unreadable at icon sizes.
import { writeFile } from "node:fs/promises";
import sharp from "sharp";
import { EMBLEM as K, emblemPaths as P } from "../lib/mark.ts";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
<circle cx="100" cy="100" r="94" fill="#fff" stroke="${K.ring}" stroke-width="8"/>
<path d="${P.band}" fill="${K.grey}"/>
<path d="${P.arrows}" fill="${K.arrow}" transform="translate(100 102) scale(1.45) translate(-100 -102)"/>
<path d="${P.gear}" fill="${K.gear}" transform="translate(100 102) scale(1.45) translate(-100 -102)"/>
<circle cx="100" cy="102" r="35" fill="#fff" stroke="${K.navy}" stroke-width="6"/>
<path d="${P.flame}" fill="${K.red}" transform="translate(100 102) scale(1.45) translate(-100 -102)"/>
</svg>`;
await writeFile("app/icon.svg", svg);
await sharp(Buffer.from(svg)).resize(180, 180).flatten({ background: "#0E1A2F" }).png().toFile("app/apple-icon.png");
// A PNG under the .ico name: every current browser reads it.
await sharp(Buffer.from(svg)).resize(48, 48).png().toFile("public/favicon.ico");
console.log("icons written");
