import { useState, useRef, useEffect, useCallback } from "react";

export function useSpeechToText(onTranscript: (text: string) => void) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);

    useEffect(() => {
        if (isRecording) {
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
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
    }, [isRecording]);

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
