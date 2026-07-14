"use client";

import { useState } from "react";
import { format } from "date-fns";
import { mutate } from "swr";

export default function JournalEditor({ onSaveSuccess }: { onSaveSuccess: () => void }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [moodScore, setMoodScore] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const moods = [
        { score: 1, emoji: "😢", label: "Very Low" },
        { score: 2, emoji: "😕", label: "Low" },
        { score: 3, emoji: "😐", label: "Neutral" },
        { score: 4, emoji: "🙂", label: "Good" },
        { score: 5, emoji: "😄", label: "Great" },
    ];

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/patient/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title || format(new Date(), "EEEE's Reflection"),
                    content,
                    moodScore
                })
            });

            if (res.ok) {
                // Mutate the history list and analytics to update globally
                mutate("/api/patient/journal");
                mutate("/api/patient/journal/analytics");
                setTitle("");
                setContent("");
                setMoodScore(null);
                onSaveSuccess();
            } else {
                console.error("Failed to save journal");
            }
        } catch (error) {
            console.error("Error saving journal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-[24px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder={format(new Date(), "EEEE's Reflection")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-black text-gray-900 border-none outline-none placeholder:text-gray-300 bg-transparent"
                />
                <p className="text-gray-400 text-sm font-medium mt-1">
                    {format(new Date(), "MMMM do, yyyy")}
                </p>
            </div>

            <textarea 
                placeholder="What's on your mind today? Write it down here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 w-full resize-none border-none outline-none text-gray-700 leading-relaxed placeholder:text-gray-300 text-[15px] min-h-[250px]"
            />

            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2">How are you feeling?</p>
                    <div className="flex items-center gap-2">
                        {moods.map(m => (
                            <button
                                key={m.score}
                                onClick={() => setMoodScore(m.score)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${moodScore === m.score ? 'bg-indigo-50 ring-2 ring-indigo-500 scale-110 shadow-sm' : 'bg-gray-50 hover:bg-gray-100 grayscale hover:grayscale-0'}`}
                                title={m.label}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving || !content.trim()}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? "Saving..." : "Save Entry"}
                </button>
            </div>
        </div>
    );
}
