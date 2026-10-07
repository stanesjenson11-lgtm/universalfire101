import { TextHighlighter } from "@/components/fancy/text/text-highlighter";

/**
 * Renders content.ts strings: ==text== becomes a yellow highlighter mark that
 * sweeps in when scrolled to, [label](#slug) becomes an in-page link.
 *
 * `scrub` swaps the highlighter for a plain <mark> whose sweep follows the
 * --hl custom property, for the fire scene, where the mark must wait for the
 * foam rather than for the viewport (kept for scrubbed scenes).
 */
const TOKEN = /==(.+?)==|\[(.+?)\]\((.+?)\)/g;

export default function Rich({ text, scrub = false }: { text: string; scrub?: boolean }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && scrub) {
      out.push(
        <mark key={m.index} className="uf-mark">
          {m[1]}
        </mark>,
      );
    } else if (m[1]) {
      out.push(
        <TextHighlighter
          key={m.index}
          highlightColor="var(--color-glow)"
          className="rounded-[0.2em] px-[0.12em] -mx-[0.12em] text-ink"
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          useInViewOptions={{ once: true, amount: 1, margin: "0px 0px -15% 0px" }}
        >
          {m[1]}
        </TextHighlighter>,
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
