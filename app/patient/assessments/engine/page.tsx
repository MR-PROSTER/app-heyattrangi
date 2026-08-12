import AssessmentEngine from "@/components/assessments/AssessmentEngine"

export default function AssessmentEnginePage() {
    return (
        <div className="flex-1 h-[calc(100vh-80px)] md:h-[calc(100vh-96px)] w-full bg-white p-2.5 sm:p-6 md:p-8 flex flex-col font-sans">
            <AssessmentEngine />
        </div>
    )
}
