/**
 * Clinical self-assessments shown on Explore → Assessments.
 */

export interface ClinicalAssessment {
  id: string
  title: string
  shortName: string
  description: string
  time: string
  image: string
  href: string
}

export const CLINICAL_ASSESSMENTS: ClinicalAssessment[] = [
  {
    id: "asrs",
    title: "Adult ADHD Self-Report Scale",
    shortName: "ASRS-v1.1",
    description:
      "Start the assessment to know if your struggles with attention and focus might be more than occasional distractions.",
    time: "3 mins quiz",
    image: "/assessments/adhd.png",
    href: "/patient/assessments/asrs",
  },
  {
    id: "ocd",
    title: "How severe are my OCD symptoms?",
    shortName: "OCI-R",
    description:
      "Start the assessment to understand whether your thoughts or behaviours might be signs of OCD.",
    time: "5 mins quiz",
    image: "/assessments/ocd.png",
    href: "/patient/assessments/ocd",
  },
  {
    id: "phq-9",
    title: "Am I Sad or Depressed?",
    shortName: "PHQ-9",
    description:
      "Start with the assessment to understand whether your feelings of sadness may be more than a temporary mood.",
    time: "5 mins quiz",
    image: "/assessments/depression.png",
    href: "/patient/assessments/phq-9",
  },
  {
    id: "gad-7",
    title: "Am I Anxious?",
    shortName: "GAD-7",
    description:
      "Take this quick assessment to understand if your feelings of worry or stress indicate anxiety.",
    time: "3 mins quiz",
    image: "/assessments/anxiety.png",
    href: "/patient/assessments/gad-7",
  },
  {
    id: "ptsd",
    title: "Primary Care PTSD Screen",
    shortName: "PC-PTSD-5",
    description:
      "Start the assessment to understand if you might be experiencing signs of Post-Traumatic Stress.",
    time: "4 mins quiz",
    image: "/assessments/ptsd.png",
    href: "/patient/assessments/ptsd",
  },
  {
    id: "gad-2",
    title: "GAD-2 — Generalized Anxiety Disorder-2",
    shortName: "GAD-2",
    description:
      "Anxiety, ultra-brief screen. Over the last 2 weeks, how often have you been bothered by the following problems?",
    time: "1 min quiz",
    image: "/assessments/anxiety.png",
    href: "/patient/assessments/gad-2",
  },
  /*
  {
    id: "phq-2",
    title: "PHQ-2 — Patient Health Questionnaire-2",
    shortName: "PHQ-2",
    description:
      "Depression, ultra-brief screen. Over the last 2 weeks, how often have you been bothered by the following problems?",
    time: "1 min quiz",
    image: "/assessments/depression.png",
    href: "/patient/assessments/phq-2",
  },
  */
  {
    id: "pss-10",
    title: "PSS-10 — Perceived Stress Scale",
    shortName: "PSS-10",
    description:
      "General perceived stress. In the last month, how often have you experienced the following?",
    time: "3 mins quiz",
    image: "/assessments/anxiety.png",
    href: "/patient/assessments/pss-10",
  },
  {
    id: "who-5",
    title: "WHO-5 — Well-Being Index",
    shortName: "WHO-5",
    description:
      "General well-being check-in. Please indicate which is closest to how you have been feeling over the last two weeks.",
    time: "2 mins quiz",
    image: "/assessments/depression.png",
    href: "/patient/assessments/who-5",
  },
  {
    id: "asq",
    title: "ASQ — Ask Suicide-Screening Questions",
    shortName: "ASQ",
    description:
      "Suicide risk screen (NIMH Toolkit). Free — U.S. federal government work for clinical use.",
    time: "2 mins quiz",
    image: "/assessments/ptsd.png",
    href: "/patient/assessments/asq",
  },
  {
    id: "c-ssrs",
    title: "C-SSRS — Columbia Suicide Severity Rating Scale",
    shortName: "C-SSRS",
    description:
      "Screen Version (Recent). Suicide severity screen with skip logic and crisis routing.",
    time: "3 mins quiz",
    image: "/assessments/ptsd.png",
    href: "/patient/assessments/c-ssrs",
  },
  {
    id: "rses",
    title: "Rosenberg Self-Esteem Scale",
    shortName: "RSES",
    description:
      "Statements about your general feelings about yourself. Indicate how much you agree or disagree with each.",
    time: "3 mins quiz",
    image: "/assessments/ocd.png",
    href: "/patient/assessments/rses",
  },
  {
    id: "audit-c",
    title: "AUDIT-C — Alcohol Use Disorders Identification Test, Concise",
    shortName: "AUDIT-C",
    description:
      "First 3 items of AUDIT. Sex at administration affects cutoff (women ≥3, men ≥4).",
    time: "2 mins quiz",
    image: "/assessments/adhd.png",
    href: "/patient/assessments/audit-c",
  },
  {
    id: "audit",
    title: "AUDIT — Alcohol Use Disorders Identification Test",
    shortName: "AUDIT",
    description:
      "Full Alcohol Use Disorders Identification Test with WHO 4-zone risk framework.",
    time: "4 mins quiz",
    image: "/assessments/adhd.png",
    href: "/patient/assessments/audit",
  },
  {
    id: "scoff",
    title: "SCOFF Questionnaire",
    shortName: "SCOFF",
    description:
      "Eating disorders screening questionnaire (1 point per Yes; cutoff ≥2).",
    time: "2 mins quiz",
    image: "/assessments/ocd.png",
    href: "/patient/assessments/scoff",
  },
  {
    id: "cbi",
    title: "Copenhagen Burnout Inventory",
    shortName: "CBI",
    description:
      "Personal, work-related, and client-related burnout. High degree of burnout described as ≥50 on the 0–100 scale.",
    time: "6 mins quiz",
    image: "/assessments/anxiety.png",
    href: "/patient/assessments/cbi",
  },
]
