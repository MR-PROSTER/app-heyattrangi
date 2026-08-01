"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import MindMatrixBadge from "./MindMatrixBadge"
import { PROFILE_FOCUS, PROFILE_MOTION_MS } from "../ui/profileChrome"
import {
  formatAssessmentDate,
  formatDuration,
  resultHref,
  type MindMatrixHistoryItem,
} from "@/data/mindMatrixProfile"

interface MindMatrixTimelineProps {
  items: MindMatrixHistoryItem[]
  className?: string
}

export default function MindMatrixTimeline({ items, className = "" }: MindMatrixTimelineProps) {
  const reduceMotion = useReducedMotion()

  if (!items.length) return null

  return (
    <ol
      className={`hidden md:block space-y-0 ${className}`}
      aria-label="Mind Matrix history timeline"
    >
      {items.map((item, index) => (
        <motion.li
          key={item.id}
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={reduceMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: PROFILE_MOTION_MS, delay: Math.min(index * 0.03, 0.09) }}
          className="relative flex gap-4 pb-6 last:pb-0"
        >
          <div className="flex flex-col items-center" aria-hidden="true">
            <span className="mt-2 h-2.5 w-2.5 rounded-full bg-orange-500 ring-4 ring-orange-50" />
            {index < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-gray-200" />
            ) : null}
          </div>

          <Link
            href={resultHref(item.riskLevel)}
            className={`group min-w-0 flex-1 min-h-11 rounded-xl border border-transparent px-3 py-2 -mx-1
              transition-[background-color,border-color,box-shadow] duration-150
              hover:border-gray-100 hover:bg-white hover:shadow-sm
              ${PROFILE_FOCUS}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-950">
                {formatAssessmentDate(item.date)}
              </p>
              <MindMatrixBadge label={item.band} />
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {formatDuration(item.durationMinutes)}
            </p>
          </Link>
        </motion.li>
      ))}
    </ol>
  )
}
