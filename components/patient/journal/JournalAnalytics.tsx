"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function JournalAnalytics() {
    const { data, error, isLoading } = useSWR("/api/patient/journal/analytics", fetcher);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-10 bg-white rounded-2xl">Failed to load analytics.</div>;
    }

    const { totalEntries, averageMoodScore, topTags, activityChartData } = data?.analytics || {};

    const avgMoodLabel = averageMoodScore ? Math.round(averageMoodScore) : null;
    const moodEmojis: Record<number, string> = { 1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄" };

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Entries (30 Days)</p>
                        <h3 className="text-3xl font-black text-gray-900">{totalEntries || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 text-2xl">
                        {avgMoodLabel ? moodEmojis[avgMoodLabel] : '📊'}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Avg Mood (30 Days)</p>
                        <h3 className="text-3xl font-black text-gray-900">
                            {averageMoodScore ? averageMoodScore.toFixed(1) : "N/A"} <span className="text-lg text-gray-400 font-medium">/ 5</span>
                        </h3>
                    </div>
                </div>
            </div>

            {/* Tags and Trends */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Common Themes</h3>
                {topTags && topTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {topTags.map((tag: string, idx: number) => (
                            <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 text-sm font-bold px-4 py-2 rounded-xl">
                                {tag}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Not enough data to determine themes yet. Keep writing!</p>
                )}
            </div>

            {/* Activity Chart Placeholder (Simple visual) */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Activity (Last 30 Days)</h3>
                {activityChartData && activityChartData.length > 0 ? (
                    <div className="flex items-end gap-2 h-40">
                        {/* A very simple CSS bar chart based on the data */}
                        {activityChartData.map((d: any, idx: number) => {
                            const height = Math.min((d.count / 3) * 100, 100); // Normalize roughly
                            return (
                                <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative">
                                    <div 
                                        className="w-full bg-indigo-100 rounded-t-sm group-hover:bg-indigo-400 transition-colors"
                                        style={{ height: `${height}%`, minHeight: '4px' }}
                                    ></div>
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                        {d.date}: {d.count} entries
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No activity data recorded in the last 30 days.
                    </div>
                )}
            </div>
        </div>
    );
}
