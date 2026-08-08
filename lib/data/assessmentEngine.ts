export interface Option {
    label: string
    value: number
}

export interface Question {
    id: string
    text: string
    options: Option[]
}

export interface ScoringRule {
    min: number
    max: number
    severity: string
    recommendations: string[]
}

export interface Screener {
    id: string
    name: string
    intro: string
    questions: Question[]
    scoring: ScoringRule[]
    priorityWeight: number
    confidenceLevel: string
}

// ---------------------------------------------------------
// TRIAGE
// ---------------------------------------------------------

export interface TriageQuestion {
    id: string
    text: string
    options: {
        label: string
        triggerScreener?: string // If selected, this screener is added to the queue
        who5Value?: number       // For WHO-5 scoring
    }[]
}

const who5Options = [
    { label: "All of the time", who5Value: 5 },
    { label: "Most of the time", who5Value: 4 },
    { label: "More than half the time", who5Value: 3 },
    { label: "Less than half the time", who5Value: 2 },
    { label: "Some of the time", who5Value: 1 },
    { label: "At no time", who5Value: 0 }
]

export const triageQuestions: TriageQuestion[] = [
    // WHO-5 Wellbeing Index
    { id: "who5_1", text: "Over the last 2 weeks, I have felt cheerful and in good spirits.", options: who5Options },
    { id: "who5_2", text: "Over the last 2 weeks, I have felt calm and relaxed.", options: who5Options },
    { id: "who5_3", text: "Over the last 2 weeks, I have felt active and vigorous.", options: who5Options },
    { id: "who5_4", text: "Over the last 2 weeks, I woke up feeling fresh and rested.", options: who5Options },
    { id: "who5_5", text: "Over the last 2 weeks, my daily life has been filled with things that interest me.", options: who5Options },
    
    // Symptom Gateway Questions
    {
        id: "gw_dep", text: "Have you felt down, depressed, or lost interest for most days over the past 2 weeks?",
        options: [{ label: "Yes", triggerScreener: "phq9" }, { label: "No" }]
    },
    {
        id: "gw_anx", text: "Do you often feel excessively worried or anxious?",
        options: [{ label: "Yes", triggerScreener: "gad7" }, { label: "No" }]
    },
    {
        id: "gw_panic", text: "Do you experience sudden episodes of intense fear or panic?",
        options: [{ label: "Yes", triggerScreener: "panic" }, { label: "No" }]
    },
    {
        id: "gw_ocd", text: "Do unwanted thoughts or repetitive rituals interfere with your life?",
        options: [{ label: "Yes", triggerScreener: "ocd" }, { label: "No" }]
    },
    {
        id: "gw_ptsd", text: "Have you experienced a traumatic event that still affects you?",
        options: [{ label: "Yes", triggerScreener: "ptsd" }, { label: "No" }]
    },
    {
        id: "gw_adhd", text: "Have you had lifelong problems with attention, organization, or impulsivity?",
        options: [{ label: "Yes", triggerScreener: "asrs" }, { label: "No" }]
    },
    {
        id: "gw_bipolar", text: "Have there been periods where you needed very little sleep and felt unusually energetic?",
        options: [{ label: "Yes", triggerScreener: "mdq" }, { label: "No" }]
    },
    {
        id: "gw_psychosis", text: "Have you ever heard or seen things others couldn't, or strongly believed things others didn't?",
        options: [{ label: "Yes", triggerScreener: "psychosis" }, { label: "No" }]
    },
    {
        id: "gw_eating", text: "Are you very concerned about your weight or eating habits?",
        options: [{ label: "Yes", triggerScreener: "scoff" }, { label: "No" }]
    },
    {
        id: "gw_substance", text: "Has alcohol or drug use caused problems in your life?",
        options: [{ label: "Yes", triggerScreener: "audit" }, { label: "No" }]
    },
    {
        id: "gw_sleep", text: "Have you had significant sleep problems for more than a month?",
        options: [{ label: "Yes", triggerScreener: "isi" }, { label: "No" }]
    },
    {
        id: "gw_suicide", text: "Have you had thoughts of harming yourself?",
        options: [{ label: "Yes", triggerScreener: "suicide" }, { label: "No" }]
    }
]

// ---------------------------------------------------------
// SCREENERS
// ---------------------------------------------------------

export const screeners: Record<string, Screener> = {
    "phq9": {
        id: "phq9",
        name: "PHQ-9 (Depression)",
        priorityWeight: 60,
        confidenceLevel: "High",
        intro: "Based on what you shared, I'd like to ask a few standard questions about your mood. Over the last 2 weeks, how often have you been bothered by any of the following problems?",
        questions: [
            {
                id: "phq9_1", text: "Little interest or pleasure in doing things",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_2", text: "Feeling down, depressed, or hopeless",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_3", text: "Trouble falling or staying asleep, or sleeping too much",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_4", text: "Feeling tired or having little energy",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_5", text: "Poor appetite or overeating",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_6", text: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_7", text: "Trouble concentrating on things, such as reading the newspaper or watching television",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_8", text: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "phq9_9", text: "Thoughts that you would be better off dead or of hurting yourself in some way",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            }
        ],
        scoring: [
            { min: 0, max: 4, severity: "Minimal", recommendations: ["Continue standard self-care", "Use the journal module"] },
            { min: 5, max: 9, severity: "Mild", recommendations: ["Start daily mindfulness routine", "Use mood tracker"] },
            { min: 10, max: 14, severity: "Moderate", recommendations: ["Consider speaking to a therapist", "Try CBT worksheets in the library"] },
            { min: 15, max: 19, severity: "Moderately Severe", recommendations: ["Recommend therapist session", "Retest PHQ-9 in 2 weeks"] },
            { min: 20, max: 27, severity: "Severe", recommendations: ["Urgent consultation recommended", "Please reach out to crisis support if needed"] }
        ]
    },
    "gad7": {
        id: "gad7",
        name: "GAD-7 (Anxiety)",
        priorityWeight: 50,
        confidenceLevel: "High",
        intro: "You mentioned feeling anxious. Let's do a quick check on that. Over the last 2 weeks, how often have you been bothered by the following problems?",
        questions: [
            {
                id: "gad7_1", text: "Feeling nervous, anxious, or on edge",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_2", text: "Not being able to stop or control worrying",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_3", text: "Worrying too much about different things",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_4", text: "Trouble relaxing",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_5", text: "Being so restless that it is hard to sit still",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_6", text: "Becoming easily annoyed or irritable",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            },
            {
                id: "gad7_7", text: "Feeling afraid, as if something awful might happen",
                options: [
                    { label: "Not at all", value: 0 },
                    { label: "Several days", value: 1 },
                    { label: "More than half the days", value: 2 },
                    { label: "Nearly every day", value: 3 }
                ]
            }
        ],
        scoring: [
            { min: 0, max: 4, severity: "Minimal", recommendations: ["No specific action needed"] },
            { min: 5, max: 9, severity: "Mild", recommendations: ["Try grounding techniques (Object Focus)", "Breathing exercises"] },
            { min: 10, max: 14, severity: "Moderate", recommendations: ["Start daily meditation", "Consider talking to a counselor"] },
            { min: 15, max: 21, severity: "Severe", recommendations: ["Recommend therapist session", "Anxiety management protocol"] }
        ]
    },
    "panic": {
        id: "panic",
        name: "Panic Screener",
        priorityWeight: 55,
        confidenceLevel: "Screening only",
        intro: "You mentioned experiencing sudden episodes of intense fear or panic. Let's explore that.",
        questions: [{ id: "panic_1", text: "In the past month, have you had recurrent unexpected panic attacks?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Consider panic management module"] }]
    },
    "ocd": {
        id: "ocd",
        name: "OCD Screener",
        priorityWeight: 45,
        confidenceLevel: "Screening only",
        intro: "You mentioned unwanted thoughts or repetitive rituals. Let's look into this.",
        questions: [{ id: "ocd_1", text: "Do you experience repetitive, intrusive thoughts that cause distress?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Consider speaking to a therapist"] }]
    },
    "ptsd": {
        id: "ptsd",
        name: "PTSD Screener",
        priorityWeight: 70,
        confidenceLevel: "Screening only",
        intro: "You mentioned a traumatic event that still affects you.",
        questions: [{ id: "ptsd_1", text: "In the past month, have you had nightmares or flashbacks about the event?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Specialized trauma support recommended"] }]
    },
    "asrs": {
        id: "asrs",
        name: "ASRS (ADHD)",
        priorityWeight: 40,
        confidenceLevel: "Screening only",
        intro: "Let's explore your experiences with attention and organization.",
        questions: [{ id: "asrs_1", text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?", options: [{ label: "Never", value: 0 }, { label: "Very Often", value: 1 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["ADHD evaluation recommended"] }]
    },
    "mdq": {
        id: "mdq",
        name: "MDQ (Bipolar)",
        priorityWeight: 90,
        confidenceLevel: "Screening only",
        intro: "You mentioned periods of unusual energy and less need for sleep.",
        questions: [{ id: "mdq_1", text: "Has there ever been a period of time when you were not your usual self and you felt so good or so hyper that other people thought you were not your normal self?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Consult a psychiatrist"] }]
    },
    "psychosis": {
        id: "psychosis",
        name: "Psychosis Screener",
        priorityWeight: 95,
        confidenceLevel: "Screening only",
        intro: "You mentioned experiencing unusual perceptions or beliefs.",
        questions: [{ id: "psy_1", text: "Do you ever hear or see things that other people cannot?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Urgent consultation recommended"] }]
    },
    "scoff": {
        id: "scoff",
        name: "SCOFF (Eating)",
        priorityWeight: 65,
        confidenceLevel: "Screening only",
        intro: "Let's ask a couple questions about your eating habits.",
        questions: [{ id: "scoff_1", text: "Do you worry you have lost control over how much you eat?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Consider nutritional counseling"] }]
    },
    "audit": {
        id: "audit",
        name: "AUDIT/DAST (Substance)",
        priorityWeight: 75,
        confidenceLevel: "Screening only",
        intro: "You mentioned some concerns about substance use.",
        questions: [{ id: "audit_1", text: "How often do you have six or more drinks on one occasion?", options: [{ label: "Never", value: 0 }, { label: "Daily or almost daily", value: 1 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Substance use counseling recommended"] }]
    },
    "isi": {
        id: "isi",
        name: "ISI (Sleep)",
        priorityWeight: 30,
        confidenceLevel: "Screening only",
        intro: "Let's explore your sleep patterns.",
        questions: [{ id: "isi_1", text: "Please rate the current severity of your insomnia problems.", options: [{ label: "None", value: 0 }, { label: "Severe", value: 1 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Try sleep hygiene module"] }]
    },
    "suicide": {
        id: "suicide",
        name: "Suicide Risk",
        priorityWeight: 100,
        confidenceLevel: "Screening only",
        intro: "I want to ask a few questions to ensure your safety.",
        questions: [{ id: "suicide_1", text: "In the past month, have you had thoughts about killing yourself?", options: [{ label: "Yes", value: 1 }, { label: "No", value: 0 }] }],
        scoring: [{ min: 0, max: 0, severity: "Minimal", recommendations: [] }, { min: 1, max: 1, severity: "Flagged", recommendations: ["Please contact emergency services immediately"] }]
    }
}
