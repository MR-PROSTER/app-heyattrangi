import { NextRequest, NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import stream from "stream";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Speech Provider Interface
interface SpeechProvider {
  transcribe(audioBlob: Blob): Promise<string>;
}

// Utility to convert WebM buffer to WAV buffer using fluent-ffmpeg
async function convertWebmToWav(webmBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputStream = new stream.Readable();
    inputStream.push(webmBuffer);
    inputStream.push(null);

    const bufs: Buffer[] = [];
    const outputStream = new stream.PassThrough();
    outputStream.on("data", (chunk) => bufs.push(chunk));
    outputStream.on("end", () => resolve(Buffer.concat(bufs)));
    outputStream.on("error", reject);

    ffmpeg(inputStream)
      .inputFormat("webm")
      .outputFormat("wav")
      .audioChannels(1)
      .audioFrequency(16000)
      .on("error", (err: Error) => reject(new Error("FFMPEG Conversion Error: " + err.message)))
      .pipe(outputStream);
  });
}

// VocabDotAI Implementation
class VocabSpeechProvider implements SpeechProvider {
  async transcribe(audioBlob: Blob): Promise<string> {
    const token = process.env.ASR_AUTH_TOKEN;
    if (!token) {
      throw new Error("ASR_AUTH_TOKEN is not configured in the environment.");
    }
    
    const arrayBuffer = await audioBlob.arrayBuffer();
    const webmBuffer = Buffer.from(arrayBuffer);
    const wavBuffer = await convertWebmToWav(webmBuffer);
    
    const response = await fetch("https://stt.vocabdotai.com/v1/transcribe?language=hinglish", {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "audio/wav",
      },
      body: new Blob([new Uint8Array(wavBuffer)], { type: "audio/wav" }), // Send raw WAV binary wrapped as Blob for standard fetch
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("VocabDotAI API Error:", response.status, errorText);
      throw new Error(`Speech-to-text API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Defensive response parser
    const transcript = data.text ?? data.transcript ?? data.transcription ?? data.result;
    
    if (typeof transcript === "string") {
      return transcript;
    }
    
    throw new Error("Invalid transcription format received from provider.");
  }
}

// Ensure the endpoint runs dynamically inside Node.js runtime (not Edge)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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

    // Modular provider pattern - swapping to VocabDotAI
    const provider: SpeechProvider = new VocabSpeechProvider();
    
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
