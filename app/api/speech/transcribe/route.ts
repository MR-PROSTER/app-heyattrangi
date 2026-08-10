import { NextRequest, NextResponse } from "next/server";

// Speech Provider Interface
interface SpeechProvider {
  transcribe(audioBlob: Blob): Promise<string>;
}

// Sarvam AI Implementation
class SarvamSpeechProvider implements SpeechProvider {
  async transcribe(audioBlob: Blob): Promise<string> {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      throw new Error("SARVAM_API_KEY is not configured in the environment.");
    }
    
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    
    // Call Sarvam AI REST API
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sarvam API Error:", response.status, errorText);
      throw new Error(`Speech-to-text API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.transcript || "";
  }
}

// Ensure the endpoint runs dynamically
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided." },
        { status: 400 }
      );
    }
    
    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: "Audio file is empty." },
        { status: 400 }
      );
    }

    // Modular provider pattern - easily replaced in the future
    const provider: SpeechProvider = new SarvamSpeechProvider();
    
    const transcript = await provider.transcribe(audioFile);
    
    if (!transcript || transcript.trim().length === 0) {
       return NextResponse.json(
        { error: "No speech detected." },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ transcript: transcript.trim() });
    
  } catch (error: any) {
    console.error("Speech transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
