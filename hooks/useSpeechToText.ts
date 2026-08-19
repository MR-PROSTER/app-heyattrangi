import { useState, useRef, useEffect, useCallback } from "react";

export interface SttLimitInfo {
    message: string
    resetInSeconds?: number
}

export function useSpeechToText(
    onTranscript: (text: string) => void,
    onLimitExceeded?: (info: SttLimitInfo) => void,
    maxDurationSeconds?: number,
    onRecordingStop?: (durationSeconds: number) => void
) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const recordingStartTimeRef = useRef<number>(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
                setRecordingTime(Math.floor(elapsed));
                if (maxDurationSeconds && elapsed >= maxDurationSeconds) {
                     if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
                     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                         mediaRecorderRef.current.stop();
                         setIsRecording(false);
                     }
                }
            }, 1000);
        } else {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            setRecordingTime(0);
        }
        return () => {
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
        };
    }, [isRecording, maxDurationSeconds]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const finalElapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
                if (onRecordingStop) {
                    const clampedElapsed = Math.min(maxDurationSeconds || Infinity, finalElapsed);
                    onRecordingStop(clampedElapsed);
                }

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                    stream.getTracks().forEach((track) => track.stop());

                    if (audioBlob.size === 0) {
                        setIsTranscribing(false);
                        return;
                    }

                    setIsTranscribing(true);
                    const formData = new FormData();
                    formData.append("audio", audioBlob);

                    const response = await fetch("/api/speech/transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    if (!response.ok) {
                        const data = await response.json();
                        if (response.status === 429 || data.error === "LIMIT_EXCEEDED") {
                            if (onLimitExceeded) {
                                onLimitExceeded({ message: data.message || "Daily voice limit reached.", resetInSeconds: data.resetInSeconds })
                            } else {
                                alert(data.message || "Daily voice limit reached. Please try again later.")
                            }
                            return
                        }
                        throw new Error(data.error || "Failed to transcribe audio");
                    }

                    const data = await response.json();
                    if (data.transcript) {
                        onTranscript(data.transcript);
                    }
                } catch (error) {
                    console.error("Transcription error:", error);
                    alert("Transcription failed. Please try again or type your message.");
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
            recordingStartTimeRef.current = Date.now();
            setIsRecording(true);
        } catch (error) {
            console.error("Microphone access denied or error:", error);
            alert("Microphone access was denied. Please allow microphone access to use Speech-to-Text.");
        }
    };

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, stopRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return {
        isRecording,
        isTranscribing,
        recordingTime,
        startRecording,
        stopRecording,
        toggleRecording,
        formatTime
    };
}
