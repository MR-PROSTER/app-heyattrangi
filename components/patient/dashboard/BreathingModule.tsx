"use client"
import { useState, useEffect } from "react"

export default function BreathingModule({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const techniques = [
        { name: "4-7-8 breathing", duration: 180, cycleTime: 19 }, // 4s in, 7s hold, 8s out
        { name: "Box", duration: 240, cycleTime: 16 }, // 4s in, 4s hold, 4s out, 4s hold
        { name: "Focus", duration: 300, cycleTime: 10 }, // 5s in, 5s out
        { name: "Sleep", duration: 600, cycleTime: 20 }, // Extra slow breathing
    ]
    
    const [isActive, setIsActive] = useState(false)
    const [activeTechnique, setActiveTechnique] = useState(techniques[0])
    const [secondsLeft, setSecondsLeft] = useState(techniques[0].duration)
    
    useEffect(() => {
        if (!isActive) return
        
        let timer = setInterval(() => {
            setSecondsLeft(s => {
                if (s <= 1) {
                    setIsActive(false)
                    return activeTechnique.duration
                }
                return s - 1
            })
        }, 1000)
        
        return () => clearInterval(timer)
    }, [isActive])

    if (!isOpen) return null;

    // We position 6 circles rotated around a central origin. 
    // They start small/close together, and expand outwards while scaling.
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity">
            <style>{`
                @keyframes breathe-flower {
                    0%, 100% { 
                        transform: rotate(var(--rot)) translateY(0px) scale(0.6); 
                        opacity: 0.15;
                    }
                    50% { 
                        transform: rotate(var(--rot)) translateY(-45px) scale(1.1); 
                        opacity: 0.7;
                    }
                }
                
                .flower-circle {
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    mix-blend-mode: screen;
                    animation: breathe-flower var(--cycle, 10s) ease-in-out infinite;
                    animation-play-state: paused;
                    transform-origin: center center;
                }
                
                .is-active .flower-circle {
                    animation-play-state: running;
                }
            `}</style>
            
            <div className="w-full max-w-md h-[80vh] max-h-[750px] bg-gradient-to-b from-[#2e7d58] to-[#143a28] rounded-[40px] shadow-2xl relative overflow-hidden flex flex-col items-center py-10 px-6">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-50"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Header */}
                <div className="text-center mb-16 mt-4 z-10">
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Breathe.</h2>
                    <p className="text-[#a3e3c0] font-medium text-sm">Your breath changes everything.</p>
                </div>

                {/* Animation Area */}
                <div className={`flex-1 flex items-center justify-center relative w-full ${isActive ? 'is-active' : ''}`} style={{ '--cycle': `${activeTechnique.cycleTime}s` } as React.CSSProperties}>
                    <div className="relative w-[150px] h-[150px] flex items-center justify-center z-10">
                        {/* The Flower of Life overlapping circles */}
                        <div className="flower-circle" style={{ '--rot': '0deg' } as React.CSSProperties}></div>
                        <div className="flower-circle" style={{ '--rot': '60deg' } as React.CSSProperties}></div>
                        <div className="flower-circle" style={{ '--rot': '120deg' } as React.CSSProperties}></div>
                        <div className="flower-circle" style={{ '--rot': '180deg' } as React.CSSProperties}></div>
                        <div className="flower-circle" style={{ '--rot': '240deg' } as React.CSSProperties}></div>
                        <div className="flower-circle" style={{ '--rot': '300deg' } as React.CSSProperties}></div>
                        
                        {/* Center Element */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center">
                                <span className="text-white text-3xl font-light tracking-widest">{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls Area */}
                <div className="w-full mt-16 mb-6 flex flex-col items-center gap-8 z-10">
                    {/* Breathing Pattern Options */}
                    <div className="flex gap-2.5 overflow-x-auto w-full justify-center px-4 no-scrollbar">
                        {techniques.map(tech => (
                            <button 
                                key={tech.name}
                                onClick={() => {
                                    setActiveTechnique(tech);
                                    setSecondsLeft(tech.duration);
                                    setIsActive(false);
                                }}
                                className={`px-5 py-2.5 rounded-full text-[12px] font-bold shrink-0 transition-colors ${
                                    activeTechnique.name === tech.name 
                                        ? "bg-white/20 text-white shadow-sm border border-white/10" 
                                        : "bg-white/5 text-white/50 hover:bg-white/10"
                                }`}
                            >
                                {tech.name}
                            </button>
                        ))}
                    </div>
                    
                    {/* Play/Pause Button */}
                    <button 
                        onClick={() => setIsActive(!isActive)}
                        className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#1a4a38] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        {isActive ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
                        ) : (
                            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
