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
    }[]
}

export const triageQuestions: TriageQuestion[] = [
    {
        id: "tq1",
        text: "How would you describe your mood over the past few days?",
        options: [
            { label: "Mostly happy" },
            { label: "Sometimes low", triggerScreener: "phq9" },
            { label: "Frequently low", triggerScreener: "phq9" },
            { label: "Very low", triggerScreener: "phq9" }
        ]
    },
    {
        id: "tq2",
        text: "Have you been feeling anxious, nervous, or on edge?",
        options: [
            { label: "Not at all" },
            { label: "A little bit", triggerScreener: "gad7" },
            { label: "Quite a bit", triggerScreener: "gad7" },
            { label: "Extremely", triggerScreener: "gad7" }
        ]
    },
    {
        id: "tq3",
        text: "How has your sleep been lately?",
        options: [
            { label: "Good, no issues" },
            { label: "Trouble falling asleep" }, // Could map to ISI later
            { label: "Waking up often" },
            { label: "Sleeping too much", triggerScreener: "phq9" } 
        ]
    },
    {
        id: "tq4",
        text: "How is your energy and concentration?",
        options: [
            { label: "Normal" },
            { label: "Easily distracted" }, // Could map to ASRS later
            { label: "Very tired / Burned out" } // Could map to Burnout scale later
        ]
    }
]

// ---------------------------------------------------------
// SCREENERS
// ---------------------------------------------------------

export const screeners: Record<string, Screener> = {
    "phq9": {
        id: "phq9",
        name: "PHQ-9 (Depression)",
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
            { min: 5, max: 9, severity: "Mild", recommendations: ["Try grounding techniques (5-4-3-2-1)", "Breathing exercises"] },
            { min: 10, max: 14, severity: "Moderate", recommendations: ["Start daily meditation", "Consider talking to a counselor"] },
            { min: 15, max: 21, severity: "Severe", recommendations: ["Recommend therapist session", "Anxiety management protocol"] }
        ]
    }
}
