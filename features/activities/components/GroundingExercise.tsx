"use client"

import React, { useState } from "react"

const steps = [
  { count: 5, label: "Things you can see", instruction: "Look around and name five things you can see.", placeholder: "I see..." },
  { count: 4, label: "Things you can touch", instruction: "Notice four things you can physically feel around you.", placeholder: "I feel..." },
  { count: 3, label: "Things you can hear", instruction: "Listen and identify three sounds around you.", placeholder: "I hear..." },
  { count: 2, label: "Things you can smell", instruction: "Notice two things you can smell right now.", placeholder: "I smell..." },
  { count: 1, label: "Thing you can taste", instruction: "Notice one thing you can taste right now.", placeholder: "I taste..." }
];
interface GroundingExerciseProps {
  onExit?: () => void;
  onDone?: () => void;
}

export default function GroundingExercise({ onExit, onDone }: GroundingExerciseProps = {}) {
  const [screen, setScreen] = useState<"intro" | "exercise" | "complete">("intro");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({
    0: ["", "", "", "", ""],
    1: ["", "", "", ""],
    2: ["", "", ""],
    3: ["", ""],
    4: [""]
  });

  const handleBegin = () => {
    setScreen("exercise");
    setCurrentStep(0);
    setAnswers({
      0: ["", "", "", "", ""],
      1: ["", "", "", ""],
      2: ["", "", ""],
      3: ["", ""],
      4: [""]
    });
  };

  const handleInputChange = (stepIdx: number, inputIdx: number, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [stepIdx]: prev[stepIdx].map((item, idx) => idx === inputIdx ? val : item)
    }));
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setScreen("complete");
    }
  };

  const handleStartOver = () => {
    setScreen("intro");
    setCurrentStep(0);
    setAnswers({
      0: ["", "", "", "", ""],
      1: ["", "", "", ""],
      2: ["", "", ""],
      3: ["", ""],
      4: [""]
    });
  };

  const activeStep = steps[currentStep];

  return (
    <div style={styles.container}>
      <style>{`
        .gnd-input:focus {
          outline: none;
          border-color: #4a90a4;
          box-shadow: 0 0 0 2px rgba(74, 144, 164, 0.15);
        }
        .gnd-btn {
          transition: all 0.2s ease-in-out;
        }
        .gnd-btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        .gnd-btn:active {
          transform: translateY(0);
        }
      `}</style>
      
      <div style={styles.card}>
        {screen === "intro" && (
          <div style={styles.content}>
            <h1 style={styles.title}>5-4-3-2-1 Grounding Exercise</h1>
            <p style={styles.subtitle}>
              A quick technique to calm anxiety and reconnect with the present moment.
            </p>
            <p style={styles.paragraph}>
              You'll be guided through your five senses, one at a time. Go slowly, and actually look, listen, and feel as you go — there's no need to rush.
            </p>
            <button className="gnd-btn" style={styles.primaryBtn} onClick={handleBegin}>
              Begin
            </button>
          </div>
        )}

        {screen === "exercise" && (
          <div style={styles.content}>
            {/* Progress Dots */}
            <div style={styles.progressContainer}>
              {steps.map((_, idx) => {
                let dotStyle = { ...styles.dot };
                if (idx === currentStep) {
                  dotStyle = { ...dotStyle, ...styles.dotActive };
                } else if (idx < currentStep) {
                  dotStyle = { ...dotStyle, ...styles.dotCompleted };
                } else {
                  dotStyle = { ...dotStyle, ...styles.dotUpcoming };
                }
                return <div key={idx} style={dotStyle} />;
              })}
            </div>

            {/* Step Content */}
            <div style={styles.stepHeader}>
              <div style={styles.largeNumber}>{activeStep.count}</div>
              <span style={styles.senseLabel}>{activeStep.label}</span>
              <p style={styles.instruction}>{activeStep.instruction}</p>
            </div>

            {/* Dynamic Inputs */}
            <div style={styles.inputsList}>
              {Array.from({ length: activeStep.count }).map((_, idx) => (
                <input
                  key={idx}
                  type="text"
                  className="gnd-input"
                  style={styles.input}
                  placeholder={`${activeStep.placeholder} ${idx + 1}`}
                  value={answers[currentStep][idx] || ""}
                  onChange={(e) => handleInputChange(currentStep, idx, e.target.value)}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div style={styles.navRow}>
              <button
                className="gnd-btn"
                style={currentStep === 0 ? styles.disabledBtn : styles.secondaryBtn}
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                Back
              </button>
              <button className="gnd-btn" style={styles.primaryBtn} onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        )}

        {screen === "complete" && (
          <div style={styles.content}>
            <div style={styles.iconContainer}>
              <span style={styles.icon}>🌿</span>
            </div>
            <h1 style={styles.title}>Nice work.</h1>
            <p style={styles.paragraph}>
              You've moved through all five senses. Take one more slow breath before you go back to what you were doing.
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button 
                className="gnd-btn" 
                style={onDone ? styles.secondaryBtn : styles.primaryBtn} 
                onClick={handleStartOver}
              >
                Start Over
              </button>
              {onDone && (
                <button className="gnd-btn" style={styles.primaryBtn} onClick={onDone}>
                  Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        If anxiety is a frequent or intense struggle, consider talking to a therapist or counselor.
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: "24px 16px",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
    border: "1px solid #f1f5f9",
    padding: "36px 32px",
    boxSizing: "border-box",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 12px 0",
    lineHeight: "1.25",
  },
  subtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: "0 0 20px 0",
    lineHeight: "1.5",
    fontWeight: 500,
  },
  paragraph: {
    fontSize: "15px",
    color: "#475569",
    margin: "0 0 28px 0",
    lineHeight: "1.6",
  },
  primaryBtn: {
    minWidth: "140px",
    padding: "12px 24px",
    backgroundColor: "#4a90a4",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(74, 144, 164, 0.2)",
  },
  secondaryBtn: {
    minWidth: "100px",
    padding: "12px 20px",
    backgroundColor: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
  },
  disabledBtn: {
    minWidth: "100px",
    padding: "12px 20px",
    backgroundColor: "#f1f5f9",
    color: "#94a3b8",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "not-allowed",
  },
  progressContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "32px",
    justifyContent: "center",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    transition: "all 0.3s ease",
  },
  dotActive: {
    backgroundColor: "#4a90a4",
    transform: "scale(1.25)",
  },
  dotCompleted: {
    backgroundColor: "#82b7c6",
  },
  dotUpcoming: {
    backgroundColor: "#e2e8f0",
  },
  stepHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
    width: "100%",
  },
  largeNumber: {
    fontSize: "64px",
    fontWeight: 900,
    color: "#4a90a4",
    lineHeight: "1",
    marginBottom: "8px",
  },
  senseLabel: {
    fontSize: "11px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    color: "#4a90a4",
    marginBottom: "12px",
  },
  instruction: {
    fontSize: "17px",
    fontWeight: 700,
    color: "#1e293b",
    margin: "0",
    lineHeight: "1.4",
  },
  inputsList: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "32px",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    color: "#334155",
    backgroundColor: "#f8fafc",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  navRow: {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  iconContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    backgroundColor: "#f0fdf4",
    borderRadius: "50%",
    marginBottom: "20px",
  },
  icon: {
    fontSize: "32px",
  },
  footer: {
    marginTop: "16px",
    fontSize: "12px",
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: "400px",
    lineHeight: "1.5",
  },
}
