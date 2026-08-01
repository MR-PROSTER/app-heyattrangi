"use client"

import { type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { PROFILE_CARD_SURFACE, PROFILE_MOTION_MS, PROFILE_SCROLL_MT } from "./profileChrome"

interface ProfileCardProps {
  children: ReactNode
  className?: string
  id?: string
  "aria-labelledby"?: string
}

/**
 * Canonical Profile section card — consistent radius, padding, shadow, 150ms motion.
 */
export default function ProfileCard({
  children,
  className = "",
  id,
  "aria-labelledby": ariaLabelledBy,
}: ProfileCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      id={id}
      aria-labelledby={ariaLabelledBy}
      initial={reduceMotion ? false : { opacity: 0, y: 4 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px", amount: 0.12 }}
      transition={{ duration: PROFILE_MOTION_MS, ease: "easeOut" }}
      className={`${PROFILE_CARD_SURFACE} ${PROFILE_SCROLL_MT} ${className}`}
    >
      {children}
    </motion.section>
  )
}
