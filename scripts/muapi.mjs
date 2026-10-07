// Tiny Muapi.ai client (the backend Open-Higgsfield-AI uses), for the hero
// film, the extinguish shot and their stills. The key comes from MUAPI_API_KEY
// — the environment, or on Windows the user variable `setx` writes — and is
// never printed.
//
//   node scripts/muapi.mjs balance
//   node scripts/muapi.mjs upload <file>                         → prints a URL
//   node scripts/muapi.mjs run <endpoint> <out-file> '<json payload>'
//
// `run` submits, polls until done, and downloads the first output to out-file.
import { execSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://api.muapi.ai";

function key() {
  if (process.env.MUAPI_API_KEY) return process.env.MUAPI_API_KEY.trim();
  if (process.platform === "win32") {
    try {
      const out = execSync('reg query HKCU\\Environment /v MUAPI_API_KEY', { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const m = out.match(/MUAPI_API_KEY\s+REG_\w+\s+(.+)/);
      if (m) return m[1].trim();
    } catch {}
  }
  console.error("MUAPI_API_KEY is not set. Run:  setx MUAPI_API_KEY \"your-key\"");
  process.exit(2);
}

async function call(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { "x-api-key": key(), ...(init.headers ?? {}) } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function upload(file) {
  const form = new FormData();
  form.append("file", new Blob([await readFile(file)]), path.basename(file));
  const data = await call(`${BASE}/api/v1/upload_file`, { method: "POST", body: form });
  return data.url || data.file_url || data.data?.url;
}

const OK = new Set(["completed", "succeeded", "success"]);
const BAD = new Set(["failed", "error", "cancelled", "canceled"]);

async function run(endpoint, out, payload) {
  const sub = await call(`${BASE}/api/v1/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const id = sub.request_id || sub.id;
  console.log(`submitted ${endpoint} → ${id}`);
  let result = sub;
  for (let i = 0; id && i < 900; i++) {
    await new Promise((r) => setTimeout(r, i < 10 ? 3000 : 6000));
    result = await call(`${BASE}/api/v1/predictions/${id}/result`).catch((e) => ({ status: "polling", error: e.message }));
    const status = String(result.status ?? "").toLowerCase();
    if (OK.has(status)) break;
    if (BAD.has(status)) throw new Error(`generation failed: ${JSON.stringify(result).slice(0, 400)}`);
    if (i % 5 === 0) console.log(`  ${status || "waiting"}…`);
  }
  const url = result.outputs?.[0] || result.url || result.output?.url;
  if (!url) throw new Error(`no output: ${JSON.stringify(result).slice(0, 400)}`);
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  await writeFile(out, bytes);
  console.log(`saved ${out} (${(bytes.length / 1e6).toFixed(1)} MB) from ${url}`);
  return url;
}

const [cmd, a, b, c] = process.argv.slice(2);
if (cmd === "balance") console.log(await call(`${BASE}/api/v1/account/balance`));
else if (cmd === "upload") console.log(await upload(a));
else if (cmd === "run") await run(a, b, JSON.parse(c));
else console.log("usage: balance | upload <file> | run <endpoint> <out> '<json>'");
