"use client";

import { Fragment, useEffect, useRef } from "react";
import { useInView } from "motion/react";
import NumberTicker, { type NumberTickerRef } from "@/components/fancy/text/basic-number-ticker";
import { prefersReduced } from "@/lib/motion";

/** Free-standing numbers only: "15 bar", "0.001–20 %/m" — never "8B", "W305", "FDNJ002U-R". */
const NUMBER = /(?<![\w.])\d+(?:\.\d+)?(?![\w.]*[A-Za-z])/g;

function Tick({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const ticker = useRef<NumberTickerRef>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  useEffect(() => {
    if (seen && !prefersReduced()) ticker.current?.startAnimation();
  }, [seen]);
  const decimals = value.split(".")[1]?.length ?? 0;
  const target = Number(value);
  return (
    <span ref={ref} className="inline-block tabular-nums">
      <NumberTicker
        ref={ticker}
        from={0}
        target={target}
        decimals={decimals}
        autoStart={false}
        transition={{ duration: Math.min(1.6, 0.6 + Math.log10(target + 1) * 0.35), ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}

/** Any string, with its numbers counting up as they scroll into view. */
export default function Num({ children }: { children: string }) {
  const parts = children.split(NUMBER);
  const nums = children.match(NUMBER) ?? [];
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p}
          {i < nums.length && <Tick value={nums[i]} />}
        </Fragment>
      ))}
    </>
  );
}
