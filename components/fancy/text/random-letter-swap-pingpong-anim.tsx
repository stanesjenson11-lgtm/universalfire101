"use client"

import { useEffect, useMemo, useRef } from "react"
import { debounce } from "@/lib/utils"
import { prefersReduced } from "@/lib/motion"
import { AnimationOptions, motion, useAnimate } from "motion/react"

interface TextProps {
  label: string
  reverse?: boolean
  transition?: AnimationOptions
  staggerDuration?: number
  className?: string
  onClick?: () => void
  /** Play one swap-and-back on its own after this many ms. Off when undefined. */
  autoPlayDelay?: number
}

// Local edits to the fancy-components original: the shuffle is memoised (it
// re-randomised on every render, so hover-out reversed a different order than
// hover-in), the default transition is an ease-out tween rather than a spring
// (no bounce, per DESIGN.md), and autoPlayDelay lets the hero play once on load.
const RandomLetterSwapPingPong = ({
  label,
  reverse = true,
  transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  staggerDuration = 0.02,
  className,
  onClick,
  autoPlayDelay,
  ...props
}: TextProps) => {
  const [scope, animate] = useAnimate()
  const blocked = useRef(false)

  const mergeTransition = (transition: AnimationOptions, i: number) => ({
    ...transition,
    delay: i * staggerDuration,
  })

  const shuffledIndices = useMemo(
    () => Array.from({ length: label.length }, (_, i) => i).sort(() => Math.random() - 0.5),
    [label],
  )

  const swap = (out: boolean) => {
    for (let i = 0; i < label.length; i++) {
      const randomIndex = shuffledIndices[i]
      animate(
        ".letter-" + randomIndex,
        { y: out ? (reverse ? "130%" : "-130%") : 0 },
        mergeTransition(transition, i),
      )
      animate(
        ".letter-secondary-" + randomIndex,
        { top: out ? "0%" : reverse ? "-130%" : "130%" },
        mergeTransition(transition, i),
      )
    }
  }

  const hoverStart = debounce(() => {
    if (blocked.current) return
    blocked.current = true
    swap(true)
  }, 100)

  const hoverEnd = debounce(() => {
    blocked.current = false
    swap(false)
  }, 100)

  useEffect(() => {
    if (autoPlayDelay === undefined || prefersReduced()) return
    const total = (label.length * staggerDuration + Number(transition.duration ?? 0.7)) * 1000
    const a = setTimeout(() => swap(true), autoPlayDelay)
    const b = setTimeout(() => swap(false), autoPlayDelay + total * 0.75)
    return () => {
      clearTimeout(a)
      clearTimeout(b)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayDelay])

  return (
    <motion.span
      className={`flex items-center relative overflow-hidden ${className ?? ""}`}
      onHoverStart={hoverStart}
      onHoverEnd={hoverEnd}
      onClick={onClick}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {label.split("").map((letter: string, i: number) => {
        return (
          <span className="whitespace-pre relative flex" key={i} aria-hidden={true}>
            <motion.span className={`relative pb-[0.12em] letter-${i}`} style={{ top: 0 }}>
              {letter}
            </motion.span>
            <motion.span
              className={`absolute letter-secondary-${i}`}
              style={{ top: reverse ? "-130%" : "130%" }}
            >
              {letter}
            </motion.span>
          </span>
        )
      })}
    </motion.span>
  )
}

export default RandomLetterSwapPingPong
