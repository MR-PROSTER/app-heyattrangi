"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import MindMatrixBadge from "./MindMatrixBadge"
import MindMatrixTimeline from "./MindMatrixTimeline"
import {
  PROFILE_FOCUS,
  PROFILE_INNER_CARD,
  PROFILE_MOTION_MS,
  PROFILE_SUBHEAD,
} from "../ui/profileChrome"
import {
  formatAssessmentDate,
  formatDuration,
  resultHref,
  type MindMatrixHistoryItem,
} from "@/data/mindMatrixProfile"

interface MindMatrixHistoryProps {
  items: MindMatrixHistoryItem[]
  className?: string
}

export default function MindMatrixHistory({ items, className = "" }: MindMatrixHistoryProps) {
  const reduceMotion = useReducedMotion()

  if (!items.length) return null

  return (
    <section aria-labelledby="mind-matrix-history-heading" className={className}>
      <h3 id="mind-matrix-history-heading" className={`${PROFILE_SUBHEAD} mb-1`}>
        History
      </h3>
      <p className="text-xs font-medium text-gray-500 mb-4">
        Last {items.length} check-in{items.length === 1 ? "" : "s"}
      </p>

      <MindMatrixTimeline items={items} />

      <ul className="md:hidden space-y-3" aria-label="Mind Matrix history">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: PROFILE_MOTION_MS, delay: Math.min(index * 0.03, 0.09) }}
          >
            <Link
              href={resultHref(item.riskLevel)}
              className={`block ${PROFILE_INNER_CARD} !p-4 ${PROFILE_FOCUS}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatAssessmentDate(item.date)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-gray-500">
                    {formatDuration(item.durationMinutes)}
                  </p>
                </div>
                <MindMatrixBadge label={item.band} />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
