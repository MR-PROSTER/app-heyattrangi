"use client"

import { useState, useEffect, useRef } from "react"
import { User } from "@prisma/client"
import Link from "next/link"

interface VideoSettingsSectionProps {
    user: User
}

export default function VideoSettingsSection({ user }: VideoSettingsSectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
    const [selectedVideo, setSelectedVideo] = useState<string>("")
    const [selectedAudio, setSelectedAudio] = useState<string>("")
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [permissionError, setPermissionError] = useState<string | null>(null)

    // Settings States (Load from localStorage if available)
    const [isMirrored, setIsMirrored] = useState(true)
    const [isHD, setIsHD] = useState(true)
    
    // Aesthetic UI states matching Zoom
    const [touchUp, setTouchUp] = useState(true)
    const [touchUpLevel, setTouchUpLevel] = useState(50)
    const [lowLight, setLowLight] = useState(true)
    const [lowLightMode, setLowLightMode] = useState("Auto")
    const [alwaysDisplayNames, setAlwaysDisplayNames] = useState(false)
    const [turnOffVideoJoining, setTurnOffVideoJoining] = useState(false)
    const [alwaysShowPreview, setAlwaysShowPreview] = useState(true)

    // Initial load: get permissions and enumerate devices
    useEffect(() => {
        let isMounted = true

        const initDevices = async () => {
            try {
                // Request initial permissions to trigger the browser prompt
                const initialStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                
                if (!isMounted) {
                    initialStream.getTracks().forEach(track => track.stop())
                    return
                }

                const deviceList = await navigator.mediaDevices.enumerateDevices()
                setDevices(deviceList)

                const videoDevices = deviceList.filter(d => d.kind === 'videoinput')
                const audioDevices = deviceList.filter(d => d.kind === 'audioinput')

                if (videoDevices.length > 0) setSelectedVideo(videoDevices[0].deviceId)
                if (audioDevices.length > 0) setSelectedAudio(audioDevices[0].deviceId)

                // We stop the initial stream immediately because we will request a specific one in the next effect
                initialStream.getTracks().forEach(track => track.stop())

                // Load saved preferences
                const savedMirrored = localStorage.getItem("heyattrangi_video_mirror")
                if (savedMirrored !== null) setIsMirrored(savedMirrored === "true")
                
                const savedHD = localStorage.getItem("heyattrangi_video_hd")
                if (savedHD !== null) setIsHD(savedHD === "true")

            } catch (err: any) {
                console.error("Error accessing media devices.", err)
                setPermissionError("We couldn't access your camera or microphone. Please check your browser permissions.")
            }
        }

        initDevices()

        return () => {
            isMounted = false
        }
    }, [])

    // Effect to handle stream changes when selected device or HD toggles change
    useEffect(() => {
        let currentStream: MediaStream | null = null

        const startStream = async () => {
            if (!selectedVideo) return

            // Stop previous stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }

            try {
                const constraints: MediaStreamConstraints = {
                    audio: selectedAudio ? { deviceId: { exact: selectedAudio } } : true,
                    video: {
                        deviceId: { exact: selectedVideo },
                        width: isHD ? { ideal: 1280 } : { ideal: 640 },
                        height: isHD ? { ideal: 720 } : { ideal: 480 }
                    }
                }

                currentStream = await navigator.mediaDevices.getUserMedia(constraints)
                setStream(currentStream)
                
                if (videoRef.current) {
                    videoRef.current.srcObject = currentStream
                }
            } catch (err: any) {
                console.error("Error applying constraints:", err)
            }
        }

        startStream()

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [selectedVideo, selectedAudio, isHD]) // Re-run when devices or HD setting changes

    const handleMirrorToggle = (checked: boolean) => {
        setIsMirrored(checked)
        localStorage.setItem("heyattrangi_video_mirror", String(checked))
    }

    const handleHDToggle = (checked: boolean) => {
        setIsHD(checked)
        localStorage.setItem("heyattrangi_video_hd", String(checked))
    }

    const videoDevices = devices.filter(d => d.kind === 'videoinput')
    const audioDevices = devices.filter(d => d.kind === 'audioinput')

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm text-left max-w-4xl mx-auto relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Video Settings</h2>
                <Link 
                    href="/meet/test-room-123?user=TestUser"
                    target="_blank"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    Test Meeting
                </Link>
            </div>

            {permissionError && (
                <div className="bg-red-50 text-red-500 text-sm font-bold p-4 rounded-xl mb-6">
                    {permissionError}
                </div>
            )}

            <div className="flex flex-col items-center mb-8">
                {/* Video Preview Container */}
                <div className="w-full max-w-[640px] aspect-video bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-inner relative border border-gray-200">
                    <video 
                        ref={videoRef}
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover"
                        style={{
                            transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                            // Simulate touch up with a slight blur/brightness CSS filter for UI purposes
                            filter: touchUp ? `blur(${touchUpLevel * 0.01}px) brightness(1.05)` : 'none'
                        }}
                    />
                    
                    {!stream && !permissionError && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm font-medium">
                            <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Accessing Camera...
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-8 max-w-3xl mx-auto px-4">
                
                {/* Camera Selection */}
                <div>
                    <h3 className="text-sm font-black text-gray-900 mb-3">Camera</h3>
                    <select 
                        value={selectedVideo} 
                        onChange={e => setSelectedVideo(e.target.value)}
                        className="w-full max-w-md bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                        {videoDevices.length === 0 && <option>No cameras found</option>}
                        {videoDevices.map((d, i) => (
                            <option key={d.deviceId} value={d.deviceId}>
                                {d.label || `Camera ${i + 1}`}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-6 mt-4 text-sm font-medium text-gray-700">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" disabled />
                            <span className="group-hover:text-gray-900">Original ratio</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={isHD}
                                onChange={e => handleHDToggle(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                            />
                            <span className="group-hover:text-gray-900">HD</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={isMirrored}
                                onChange={e => handleMirrorToggle(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                            />
                            <span className="group-hover:text-gray-900">Mirror my video</span>
                        </label>
                    </div>
                </div>

                {/* Microphone Selection */}
                <div>
                    <h3 className="text-sm font-black text-gray-900 mb-3">Microphone</h3>
                    <select 
                        value={selectedAudio} 
                        onChange={e => setSelectedAudio(e.target.value)}
                        className="w-full max-w-md bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 shadow-sm"
                    >
                        {audioDevices.length === 0 && <option>No microphones found</option>}
                        {audioDevices.map((d, i) => (
                            <option key={d.deviceId} value={d.deviceId}>
                                {d.label || `Microphone ${i + 1}`}
                            </option>
                        ))}
                    </select>
                </div>

                {/* My Video Effects */}
                <div>
                    <h3 className="text-sm font-black text-gray-900 mb-3">My Video</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer w-48 group">
                                <input 
                                    type="checkbox" 
                                    checked={touchUp}
                                    onChange={e => setTouchUp(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Touch up my appearance</span>
                            </label>
                            {touchUp && (
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={touchUpLevel}
                                    onChange={e => setTouchUpLevel(parseInt(e.target.value))}
                                    className="w-48 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer w-48 group">
                                <input 
                                    type="checkbox" 
                                    checked={lowLight}
                                    onChange={e => setLowLight(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Adjust for low light</span>
                            </label>
                            {lowLight && (
                                <select 
                                    value={lowLightMode}
                                    onChange={e => setLowLightMode(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="Auto">Auto</option>
                                    <option value="Manual">Manual</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="pt-6 border-t border-gray-100 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={alwaysDisplayNames}
                            onChange={e => setAlwaysDisplayNames(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Always display participant name on their videos</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={turnOffVideoJoining}
                            onChange={e => setTurnOffVideoJoining(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Turn off my video when joining a meeting</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={alwaysShowPreview}
                            onChange={e => setAlwaysShowPreview(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Always show video preview dialog when joining a video meeting</span>
                    </label>
                </div>
            </div>
        </div>
    )
}
