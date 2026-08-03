/**
 * Data-driven scoring for assessments defined in additionalScreeners.ts.
 * Reads method / bands / cutoffs / interpretations from screener.scoring (Excel-derived).
 */

export type AdditionalScreenerResult = {
  score: number
  severity: string
  interpretation: string
  recommendation: string
  hasCrisisRisk: boolean
}

function bandForScore(
  bands: Array<{
    min: number
    max: number
    severity: string
    interpretation?: string
    recommendation?: string
    hasCrisisRisk?: boolean
  }>,
  score: number
) {
  return (
    bands.find((b) => score >= b.min && score <= b.max) ??
    bands[bands.length - 1]
  )
}

function sumAnswers(
  answers: Record<number, number>,
  questions: any[],
  opts?: { reverseMax?: number; skipUnscored?: boolean }
) {
  let score = 0
  questions.forEach((q, i) => {
    if (answers[i] === undefined) return
    if (opts?.skipUnscored && q.scored === false) return
    const raw = answers[i]
    if (q.reverseScored && opts?.reverseMax !== undefined) {
      score += opts.reverseMax - raw
    } else {
      score += raw
    }
  })
  return score
}

export function scoreAdditionalScreener(
  screener: any,
  answers: Record<number, number>
): AdditionalScreenerResult {
  const scoring = screener?.scoring
  if (!scoring) {
    return {
      score: 0,
      severity: "Unavailable",
      interpretation: "",
      recommendation: "",
      hasCrisisRisk: false,
    }
  }

  const method = scoring.method as string

  if (method === "sum" || method === "sumReverse") {
    const score = sumAnswers(answers, screener.questions, {
      reverseMax: scoring.reverseMax,
      skipUnscored: true,
    })
    const band = bandForScore(scoring.bands, score)
    return {
      score,
      severity: band.severity,
      interpretation: band.interpretation ?? band.severity,
      recommendation: band.recommendation ?? "",
      hasCrisisRisk: Boolean(band.hasCrisisRisk),
    }
  }

  if (method === "who5") {
    const raw = sumAnswers(answers, screener.questions)
    const percentage = raw * 4
    const band = bandForScore(scoring.bands, raw)
    return {
      score: raw,
      severity: `${band.severity} (${percentage}/100)`,
      interpretation: band.interpretation ?? band.severity,
      recommendation: band.recommendation ?? "",
      hasCrisisRisk: false,
    }
  }

  if (method === "audit-c") {
    const scoredIndices: number[] = scoring.scoredQuestionIndices ?? [1, 2, 3]
    let score = 0
    scoredIndices.forEach((i) => {
      if (answers[i] !== undefined) score += answers[i]
    })
    const sexIdx = scoring.sexQuestionIndex ?? 0
    const isMale = answers[sexIdx] === 1
    const cutoff = isMale ? scoring.cutoffs.male : scoring.cutoffs.female
    const outcome = score >= cutoff ? scoring.positive : scoring.negative
    return {
      score,
      severity: outcome.severity,
      interpretation: outcome.interpretation,
      recommendation: outcome.recommendation,
      hasCrisisRisk: false,
    }
  }

  if (method === "c-ssrs") {
    const wish = answers[0] === 1
    const thoughts = answers[1] === 1
    const methodThought = answers[2] === 1
    const intent = answers[3] === 1
    const plan = answers[4] === 1
    const behaviorRecent = answers[5] === 2
    const behaviorLifetime = answers[5] === 1
    const score = [
      wish,
      thoughts,
      methodThought,
      intent,
      plan,
      behaviorRecent || behaviorLifetime,
    ].filter(Boolean).length

    let key: "negative" | "positive" | "high" = "negative"
    if (intent || plan || behaviorRecent) key = "high"
    else if (wish || thoughts || methodThought || behaviorLifetime) key = "positive"

    const outcome = scoring.results[key]
    return {
      score,
      severity: outcome.severity,
      interpretation: outcome.interpretation,
      recommendation: outcome.recommendation,
      hasCrisisRisk: Boolean(outcome.hasCrisisRisk),
    }
  }

  if (method === "asq") {
    const anyOf14 = [0, 1, 2, 3].some((i) => (answers[i] ?? 0) > 0)
    const acute = answers[4] === 1
    const score =
      [0, 1, 2, 3].reduce((n, i) => n + ((answers[i] ?? 0) > 0 ? 1 : 0), 0) +
      (acute ? 1 : 0)

    let key: "negative" | "nonAcute" | "acute" = "negative"
    if (acute) key = "acute"
    else if (anyOf14) key = "nonAcute"

    const outcome = scoring.results[key]
    return {
      score,
      severity: outcome.severity,
      interpretation: outcome.interpretation,
      recommendation: outcome.recommendation,
      hasCrisisRisk: Boolean(outcome.hasCrisisRisk),
    }
  }

  if (method === "cbi") {
    const reverseMax = scoring.reverseMax ?? 100
    const avg = (indices: number[]) => {
      const vals = indices
        .filter((i) => answers[i] !== undefined)
        .map((i) => {
          const q = screener.questions[i]
          const raw = answers[i]
          return q.reverseScored ? reverseMax - raw : raw
        })
      if (!vals.length) return 0
      return vals.reduce((a, b) => a + b, 0) / vals.length
    }

    const personal = avg(scoring.subscales.personal.indices)
    const work = avg(scoring.subscales.work.indices)
    const client = avg(scoring.subscales.client.indices)
    const score = Math.round((personal + work + client) / 3)
    const threshold = scoring.highThreshold ?? 50
    const flags = [
      personal >= threshold ? "Personal Burnout ≥50" : null,
      work >= threshold ? "Work Burnout ≥50" : null,
      client >= threshold ? "Client Burnout ≥50" : null,
    ].filter(Boolean)

    const severity =
      flags.length > 0
        ? `High degree of burnout (≥50): ${flags.join("; ")}`
        : `Personal ${Math.round(personal)}, Work ${Math.round(work)}, Client ${Math.round(client)}`

    return {
      score,
      severity,
      interpretation: scoring.interpretation,
      recommendation: scoring.recommendation,
      hasCrisisRisk: false,
    }
  }

  return {
    score: 0,
    severity: "Unavailable",
    interpretation: "",
    recommendation: "",
    hasCrisisRisk: false,
  }
}
