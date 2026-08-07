import { scoreAdditionalScreener } from "./scoreAdditionalScreener"

export type AssessmentResult = {
  score: number
  severity: string
  interpretation: string
  recommendation: string
  hasCrisisRisk: boolean
}

export function scoreAssessment(
  screenerId: string,
  screener: any,
  answers: Record<number, number>
): AssessmentResult {
  let score = 0
  let severity = "None-minimal"
  let interpretation = ""
  let recommendation = ""
  let hasCrisisRisk = false

  if (screenerId === 'phq-9') {
    Object.values(answers).forEach((val) => (score += val))
    if (score <= 4) severity = "None-minimal"
    else if (score <= 9) severity = "Mild"
    else if (score <= 14) severity = "Moderate"
    else if (score <= 19) severity = "Moderately Severe"
    else severity = "Severe"

    // Item 9 is index 8 (9th question)
    if (answers[8] && answers[8] > 0) hasCrisisRisk = true
    interpretation = `PHQ-9 Severity: ${severity}`
  } else if (screenerId === 'gad-7') {
    Object.values(answers).forEach((val) => (score += val))
    if (score <= 4) severity = "Minimal"
    else if (score <= 9) severity = "Mild"
    else if (score <= 14) severity = "Moderate"
    else severity = "Severe"
    interpretation = `GAD-7 Severity: ${severity}`
  } else if (screenerId === 'asrs') {
    // Part A is first 6 questions
    let partAScore = 0
    for (let i = 0; i < 6; i++) {
      if (answers[i] !== undefined) {
        const q = screener.questions[i]
        if (answers[i] >= q.positiveThreshold) partAScore++
      }
    }
    score = partAScore
    severity = partAScore >= 4 ? "Positive Screen for ADHD" : "Negative Screen"
    interpretation = `ASRS Part A Score: ${partAScore}/6. ${severity}`
  } else if (screenerId === 'ptsd') {
    if (answers[0] === 0) {
      severity = "N/A - No trauma exposure reported"
    } else {
      // Sum the remaining 5 questions
      for (let i = 1; i <= 5; i++) {
        if (answers[i]) score += answers[i]
      }
      severity = score >= 3 ? "Positive Screen (Consider clinical follow-up)" : "Negative Screen"
    }
    interpretation = `PTSD Screen: ${severity}`
  } else if (screenerId === 'ocd') {
    Object.values(answers).forEach((val) => (score += val))
    severity = score >= 21 ? "Positive Screen for OCD" : "Likely Negative"
    interpretation = `OCI-R Score: ${score}. ${severity}`
  } else if (screener?.scoring) {
    const additionalResult = scoreAdditionalScreener(screener, answers)
    return {
      score: additionalResult.score,
      severity: additionalResult.severity,
      interpretation: additionalResult.interpretation,
      recommendation: additionalResult.recommendation,
      hasCrisisRisk: additionalResult.hasCrisisRisk,
    }
  }

  return { score, severity, interpretation, recommendation, hasCrisisRisk }
}
