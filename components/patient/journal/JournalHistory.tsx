"use client";

import useSWR from "swr";
import { format } from "date-fns";

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface JournalEntry {
    id: string;
    title: string;
    content: string;
    moodScore: number | null;
    tags: string[];
    createdAt: string;
}

const moodEmojis: Record<number, string> = {
    1: "😢", 2: "😕", 3: "😐", 4: "🙂", 5: "😄"
};

export default function JournalHistory() {
    const { data, error, isLoading } = useSWR("/api/patient/journal", fetcher);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center py-10 bg-white rounded-2xl">Failed to load journal history.</div>;
    }

    const entries: JournalEntry[] = data?.entries || [];

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-[24px] p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-300">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No entries yet</h3>
                <p className="text-gray-500 max-w-sm">You haven't written any journal entries. Head over to the 'Write Entry' tab to start your first reflection!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {entries.map(entry => (
                <div key={entry.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {entry.title || "Daily Reflection"}
                            </h3>
                            <p className="text-xs font-medium text-gray-400 mt-1">
                                {format(new Date(entry.createdAt), "MMMM do, yyyy 'at' h:mm a")}
                            </p>
                        </div>
                        {entry.moodScore && (
                            <div className="bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100" title={`Mood: ${entry.moodScore}/5`}>
                                {moodEmojis[entry.moodScore]}
                            </div>
                        )}
                    </div>
                    
                    <p className="text-gray-600 text-[14px] leading-relaxed whitespace-pre-wrap line-clamp-4">
                        {entry.content}
                    </p>

                    {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                            {entry.tags.map((tag, idx) => (
                                <span key={idx} className="bg-indigo-50 text-indigo-600 text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
