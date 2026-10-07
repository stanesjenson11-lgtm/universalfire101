/**
 * Renders content.ts strings: ==text== becomes a highlighter mark,
 * [label](#slug) an in-page link.
 *
 * A mark's sweep follows the --hl custom property (globals.css .uf-mark).
 * By default it is scroll-scrubbed per mark (ScrubMarks: the highlight draws
 * across as the phrase rises through the screen, and undraws on the way back
 * up). `scrub` hands it to the surrounding section instead — the fire scene
 * draws its marks only once the foam has reached them.
 */
const TOKEN = /==(.+?)==|\[(.+?)\]\((.+?)\)/g;

export default function Rich({ text, scrub = false }: { text: string; scrub?: boolean }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <mark key={m.index} className="uf-mark" data-scrub={scrub ? undefined : ""}>
          {m[1]}
        </mark>,
      );
    } else {
      out.push(
        <a key={m.index} href={m[3]} className="text-fire hover:underline">
          {m[2]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
