import { home } from "@/lib/content";
import Rich from "@/components/ui/Rich";
import FireFoamCanvas from "@/components/gl/FireFoamCanvas";

/**
 * The fire. Its type is always ink: on the flames it is a dark silhouette,
 * and once the foam from the extinguisher has covered it, it reads crisp on
 * white. The CSS default (white, marks drawn) is the finished scene — what
 * no-JS, no-WebGL and reduced-motion visitors get.
 */
export default function Fire() {
  return (
    <section id="fire" data-ground="light" className="fire-stage relative h-svh min-h-[36rem] overflow-hidden bg-white text-ink">
      <FireFoamCanvas />
      {/* Where the extinguisher lands, hose toward the flames: smaller on narrow
          screens, where the words come close and the raised hose would cross them. */}
      <div
        data-ext="land"
        aria-hidden="true"
        className="absolute right-[7vw] bottom-[5svh] h-[32svh] w-[16vw] max-[1279px]:h-[24svh] max-[1023px]:h-[22svh] max-[620px]:right-[5vw] max-[620px]:bottom-[2svh] max-[620px]:h-[16svh] max-[620px]:w-[16vw]"
      />
      <div className="relative z-[var(--z-content)] mx-auto flex h-full max-w-[58rem] flex-col items-center justify-center px-gutter text-center max-[620px]:justify-start max-[620px]:pt-[18svh]">
        <h2 className="text-h1 font-semibold">{home.fire.heading}</h2>
        {home.fire.body.map((p) => (
          <p key={p} className="mt-5 max-w-[50ch] text-lead font-medium">
            <Rich text={p} scrub />
          </p>
        ))}
      </div>
    </section>
  );
}
