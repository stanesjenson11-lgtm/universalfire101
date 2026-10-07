"use client"

import { useState } from "react"
import { debounce } from "@/lib/utils"
import { AnimationOptions, motion, stagger, useAnimate } from "motion/react"

interface TextProps {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  transition?: AnimationOptions
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number
  className?: string
  onClick?: () => void
}

const VariableFontHoverByLetter = ({
  label,
  fromFontVariationSettings = "'wght' 400, 'slnt' 0",
  toFontVariationSettings = "'wght' 900, 'slnt' -10",
  transition = {
    type: "spring",
    duration: 0.7,
  },
  staggerDuration = 0.03,
  staggerFrom = "first",
  className,
  onClick,
  ...props
}: TextProps) => {
  const [scope, animate] = useAnimate()
  const [isHovered, setIsHovered] = useState(false)

  const mergeTransition = (baseTransition: AnimationOptions) => ({
    ...baseTransition,
    delay: stagger(staggerDuration, {
      from: staggerFrom,
    }),
  })

  const hoverStart = debounce(
    () => {
      if (isHovered) return
      setIsHovered(true)

      animate(
        ".letter",
        { fontVariationSettings: toFontVariationSettings },
        mergeTransition(transition)
      )
    },
    100,
  )

  const hoverEnd = debounce(
    () => {
      setIsHovered(false)

      animate(
        ".letter",
        { fontVariationSettings: fromFontVariationSettings },
        mergeTransition(transition)
      )
    },
    100,
  )

  return (
    <motion.span
      className={`${className}`}
      onHoverStart={hoverStart}
      onHoverEnd={hoverEnd}
      onClick={onClick}
      ref={scope}
      {...props}
    >
      <span className="sr-only">{label}</span>

      {/* Local edit: letters grouped per word, so a long title wraps between
          words instead of between any two letters. */}
      {label.split(" ").map((word, w, words) => (
        <span key={w} className="inline-block whitespace-nowrap" aria-hidden="true">
          {word.split("").map((letter: string, i: number) => (
            <motion.span key={i} className="inline-block letter">
              {letter}
            </motion.span>
          ))}
          {w < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </motion.span>
  )
}

export default VariableFontHoverByLetter
