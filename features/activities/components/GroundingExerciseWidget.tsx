"use client"

import { useState, type CSSProperties } from "react"

/**
 * Self-contained 5-4-3-2-1 grounding widget — intro, five sense steps with
 * free-text inputs, then a completion screen. Styled with the site's own
 * design tokens (cream canvas, teal accent, brand CTA), same shape as the
 * reference: Begin → step through senses → Start Over.
 */

interface GroundingStep {
  count: number
  sense: string
  instruction: string
  placeholder: string
}

const STEPS: readonly GroundingStep[] = [
  {
    count: 5,
    sense: "Things you can see",
    instruction: "Look around and name five things you can see.",
    placeholder: "I see...",
  },
  {
    count: 4,
    sense: "Things you can touch",
    instruction: "Notice four things you can physically feel around you.",
    placeholder: "I feel...",
  },
  {
    count: 3,
    sense: "Things you can hear",
    instruction: "Listen and identify three sounds around you.",
    placeholder: "I hear...",
  },
  {
    count: 2,
    sense: "Things you can smell",
    instruction: "Notice two things you can smell right now.",
    placeholder: "I smell...",
  },
  {
    count: 1,
    sense: "Thing you can taste",
    instruction: "Notice one thing you can taste right now.",
    placeholder: "I taste...",
  },
]

type Screen = "intro" | "exercise" | "complete"

interface GroundingExerciseWidgetProps {
  title?: string
}

export function GroundingExerciseWidget({
  title = "5-4-3-2-1 Grounding Exercise",
}: GroundingExerciseWidgetProps) {
  const [screen, setScreen] = useState<Screen>("intro")
  const [currentStep, setCurrentStep] = useState(0)

  const step = STEPS[currentStep]

  const start = () => {
    setCurrentStep(0)
    setScreen("exercise")
  }

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((i) => i + 1)
    } else {
      setScreen("complete")
    }
  }

  const back = () => {
    if (currentStep > 0) setCurrentStep((i) => i - 1)
  }

  const reset = () => {
    setScreen("intro")
  }

  return (
    <div style={styles.page}>
      <style>{`
        .gnd-input:focus { outline: none; border-color: var(--color-accent); }
        .gnd-btn-primary:hover { opacity: 0.9; }
        .gnd-btn-secondary:hover { opacity: 0.85; }
        .gnd-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
      <div style={styles.widget}>
        {screen === "intro" ? (
          <div>
            <h1 style={styles.title}>{title}</h1>
            <p style={styles.subtitle}>
              A quick technique to calm anxiety and reconnect with the present moment.
            </p>
            <p style={styles.introText}>
              You&apos;ll be guided through your five senses, one at a time. Go slowly, and
              actually look, listen, and feel as you go — there&apos;s no need to rush.
            </p>
            <button
              type="button"
              className="gnd-btn gnd-btn-primary"
              style={{ ...styles.btnPrimary, width: "100%" }}
              onClick={start}
            >
              Begin
            </button>
          </div>
        ) : null}

        {screen === "exercise" ? (
          <div>
            <div style={styles.dots} role="img" aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
              {STEPS.map((s, i) => (
                <div
                  key={s.sense}
                  style={{
                    ...styles.dot,
                    ...(i < currentStep
                      ? styles.dotDone
                      : i === currentStep
                        ? styles.dotActive
                        : null),
                  }}
                />
              ))}
            </div>

            <div style={styles.stepCount}>{step.count}</div>
            <div style={styles.senseLabel}>{step.sense}</div>
            <div style={styles.instruction}>{step.instruction}</div>

            <div>
              {Array.from({ length: step.count }, (_, i) => (
                <input
                  key={`${currentStep}-${i}`}
                  type="text"
                  className="gnd-input"
                  placeholder={step.placeholder}
                  style={styles.input}
                />
              ))}
            </div>

            <div style={styles.buttons}>
              <button
                type="button"
                className="gnd-btn gnd-btn-secondary"
                style={styles.btnSecondary}
                disabled={currentStep === 0}
                onClick={back}
              >
                Back
              </button>
              <button
                type="button"
                className="gnd-btn gnd-btn-primary"
                style={styles.btnPrimary}
                onClick={next}
              >
                {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        ) : null}

        {screen === "complete" ? (
          <div>
            <div style={styles.checkmark}>🌿</div>
            <h1 style={styles.title}>Nice work.</h1>
            <p style={styles.introText}>
              You&apos;ve moved through all five senses. Take one more slow breath before
              you go back to what you were doing.
            </p>
            <button
              type="button"
              className="gnd-btn gnd-btn-primary"
              style={{ ...styles.btnPrimary, width: "100%" }}
              onClick={reset}
            >
              Start Over
            </button>
          </div>
        ) : null}

        <div style={styles.footerNote}>
          If anxiety is a frequent or intense struggle, consider talking to a therapist or
          counselor.
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100dvh",
    width: "100%",
    background: "var(--color-canvas)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
  },
  widget: {
    background: "var(--color-surface)",
    borderRadius: 16,
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    maxWidth: 480,
    width: "100%",
    padding: 32,
    textAlign: "center",
    color: "var(--color-ink)",
    fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
  },
  title: { fontSize: "1.3rem", fontWeight: 700, margin: "0 0 4px" },
  subtitle: { color: "var(--color-ink-subtle)", fontSize: "0.9rem", marginBottom: 24 },
  introText: { color: "var(--color-ink-subtle)", lineHeight: 1.6, marginBottom: 24 },
  dots: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "var(--color-hairline)",
    transition: "background 0.3s",
  },
  dotActive: { background: "var(--color-accent)" },
  dotDone: { background: "color-mix(in srgb, var(--color-accent) 70%, black)" },
  stepCount: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "var(--color-accent)",
    lineHeight: 1,
    marginBottom: 8,
  },
  senseLabel: {
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "color-mix(in srgb, var(--color-accent) 75%, var(--color-ink))",
    marginBottom: 12,
  },
  instruction: { fontSize: "1.05rem", lineHeight: 1.5, marginBottom: 28, minHeight: 60 },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: 8,
    border: "1px solid var(--color-hairline)",
    borderRadius: 8,
    fontSize: "0.95rem",
    background: "var(--color-canvas)",
    color: "var(--color-ink)",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  buttons: { display: "flex", gap: 12, marginTop: 20 },
  btnPrimary: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "var(--color-brand)",
    color: "#ffffff",
    fontFamily: "inherit",
  },
  btnSecondary: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    borderRadius: 8,
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    background: "var(--color-hairline)",
    color: "var(--color-ink)",
    fontFamily: "inherit",
  },
  checkmark: { fontSize: "3rem", marginBottom: 12 },
  footerNote: { marginTop: 20, fontSize: "0.78rem", color: "var(--color-ink-subtle)" },
}
