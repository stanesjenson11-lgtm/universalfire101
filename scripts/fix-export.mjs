// Next 16.3 on Windows writes segment-prefetch files for dynamic routes as
// out/<page>/__next.$d$slug/__PAGE__.txt — the exporter joins the segment path
// with "\" and only rewrites "/" to "." (convertSegmentPathToStaticExportFilename).
// The client asks for out/<page>/__next.$d$slug.__PAGE__.txt. Flatten them.
// ponytail: no-op on Linux/macOS builds; delete once Next fixes the join.
import { readdir, rename, rmdir, stat } from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "../out");
let moved = 0;

async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("__next.")) {
      // Every file below becomes a sibling of the folder, path joined with ".".
      const stack = [[p, e.name]];
      while (stack.length) {
        const [d, name] = stack.pop();
        for (const f of await readdir(d, { withFileTypes: true })) {
          const fp = path.join(d, f.name);
          if (f.isDirectory()) stack.push([fp, `${name}.${f.name}`]);
          else {
            await rename(fp, path.join(dir, `${name}.${f.name}`));
            moved++;
          }
        }
      }
      await removeEmpty(p);
    } else await walk(p);
  }
}

async function removeEmpty(d) {
  for (const e of await readdir(d, { withFileTypes: true })) if (e.isDirectory()) await removeEmpty(path.join(d, e.name));
  await rmdir(d);
}

if (await stat(OUT).catch(() => null)) await walk(OUT);
console.log(`fix-export: flattened ${moved} segment file(s)`);
