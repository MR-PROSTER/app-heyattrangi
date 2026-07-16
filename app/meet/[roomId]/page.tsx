"use client";

import {
  LiveKitRoom,
  VideoConference,
  ControlBar,
  useRoomContext,
  useLocalParticipant,
  LayoutContextProvider,
  GridLayout,
  ParticipantTile,
  useTracks,
  Chat,
  useLayoutContext,
  FocusLayout,
  CarouselLayout,
  usePinnedTracks,
  RoomAudioRenderer,
  useSpeakingParticipants,
  useParticipants,
  useChat,
  TrackToggle,
  ChatToggle,
  DisconnectButton,
  MediaDeviceMenu,
  PreJoin
} from "@livekit/components-react";
import "@livekit/components-styles";
import { RoomEvent, Participant, Track } from "livekit-client";

import { useEffect, useState, useRef, Suspense } from "react";
import AskPragya from "@/components/meet/AskPragya";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

interface CustomConferenceProps {
  isHost: boolean;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

// Custom A/V Toggles for the Bottom Bar
function MicToggle() {
  const { localParticipant } = useLocalParticipant();
  const isEnabled = localParticipant?.isMicrophoneEnabled;
  
  return (
    <button 
      onClick={() => localParticipant?.setMicrophoneEnabled(!isEnabled)}
      className="flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-colors hover:bg-white/10 group"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isEnabled ? 'bg-white/10 text-white group-hover:bg-white/20' : 'bg-red-500 text-white'}`}>
         {isEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
         ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
         )}
      </div>
    </button>
  )
}

function CamToggle() {
  const { localParticipant } = useLocalParticipant();
  const isEnabled = localParticipant?.isCameraEnabled;
  
  return (
    <button 
      onClick={() => localParticipant?.setCameraEnabled(!isEnabled)}
      className="flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-lg transition-colors hover:bg-white/10 group"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isEnabled ? 'bg-white/10 text-white group-hover:bg-white/20' : 'bg-red-500 text-white'}`}>
         {isEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
         ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
         )}
      </div>
    </button>
  )
}

function ScreenShareToggle() {
  const { localParticipant } = useLocalParticipant();
  const isEnabled = localParticipant?.isScreenShareEnabled;
  
  return (
    <button 
      onClick={() => localParticipant?.setScreenShareEnabled(!isEnabled)}
      className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${isEnabled ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
      <span className="text-[10px] mt-1 font-medium">Share</span>
    </button>
  )
}

function CustomChat({ onClose }: { onClose: () => void }) {
  const { send, chatMessages, isSending } = useChat();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      send(message);
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1a1a1a] text-white">
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        <h3 className="font-medium tracking-tight">Chat</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6L18 18"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {chatMessages.map((msg, i) => {
           const isSelf = msg.from?.isLocal;
           return (
             <div key={i} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-white/50 mb-1 px-1">
                  {isSelf ? "You" : msg.from?.identity}
                </span>
                <div className={`px-3 py-2 rounded-xl text-sm max-w-[90%] break-words ${isSelf ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-[#2a2a2a] text-white rounded-tl-sm border border-white/5'}`}>
                   {msg.message}
                </div>
             </div>
           )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-white/10 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
           <input 
             type="text"
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             placeholder="Type a message..."
             className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
           />
           <button type="submit" disabled={!message.trim() || isSending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
           </button>
        </form>
      </div>
    </div>
  )
}

function CustomConference({ isHost, isRecording, onStartRecording, onStopRecording }: CustomConferenceProps) {
  const room = useRoomContext();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const screenTracks = useTracks([Track.Source.ScreenShare]);
  const layoutContext = useLayoutContext();

  const pinnedTracks = usePinnedTracks(layoutContext);
  const activeSpeakers = useSpeakingParticipants();
  const participants = useParticipants();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPragya, setShowPragya] = useState(false);
  const [lastSpeakerSid, setLastSpeakerSid] = useState<string | null>(null);

  useEffect(() => {
    if (activeSpeakers.length > 0) {
      setLastSpeakerSid(activeSpeakers[0].sid);
    }
  }, [activeSpeakers]);

  const isScreenSharing = screenTracks.length > 0;

  let focusTrack: any = pinnedTracks[0];
  if (!focusTrack && activeSpeakers.length > 0) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === activeSpeakers[0].sid);
  }
  if (!focusTrack && lastSpeakerSid) {
    focusTrack = cameraTracks.find((t) => t.participant.sid === lastSpeakerSid);
  }
  if (!focusTrack && cameraTracks.length > 0) {
    focusTrack = cameraTracks.find((t) => !t.participant.isLocal) || cameraTracks[0];
  }

  const isFocusing = focusTrack !== undefined && participants.length > 1;

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#111111] overflow-hidden relative font-sans text-white">
      
      {/* Top Bar */}
      <div className="h-[60px] flex items-center justify-between px-6 shrink-0 z-40 bg-[#111111]">
        <div className="flex items-center gap-3">
           <img src="/images/logo.png" alt="Logo" className="h-6 w-auto" />
           <h2 className="text-xl font-bold tracking-tight text-white">hey attrangi</h2>
        </div>
        <div className="text-white/70 text-sm font-medium flex items-center gap-2">
           {participants.length === 1 ? (
              <>
                 <svg className="animate-spin h-4 w-4 text-white/50" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Waiting for others to join...
              </>
           ) : (
              `${participants.length} Participants`
           )}
        </div>
        <div className="w-[120px]"></div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex overflow-hidden bg-black relative">
        {isScreenSharing && (
          <div className="flex-1 flex items-center justify-center bg-black">
            {screenTracks.map((track) => (
              <ParticipantTile
                key={track.publication.trackSid}
                trackRef={track}
                className="max-h-full max-w-full aspect-video"
              />
            ))}
          </div>
        )}

        <div className={`${isScreenSharing ? "h-[30%]" : "flex-1"} overflow-y-auto w-full`}>
          {!isScreenSharing && isFocusing && focusTrack ? (
            <div className="h-full w-full flex flex-col md:flex-row">
              <div className="flex-1 h-[70%] md:h-full">
                <FocusLayout trackRef={focusTrack as any} className="h-full w-full" />
              </div>
              <div className="h-[30%] md:h-full md:w-[250px] overflow-y-auto bg-[#111] p-2 border-l border-[#222]">
                <CarouselLayout tracks={cameraTracks}>
                  <ParticipantTile />
                </CarouselLayout>
              </div>
            </div>
          ) : (
            <GridLayout tracks={cameraTracks} className="h-full w-full p-2 gap-2">
              <ParticipantTile />
            </GridLayout>
          )}
        </div>

        {/* Sidebars (Chat & Participants) */}
        <div className={`absolute top-0 left-0 h-full w-[350px] bg-[#1a1a1a] border-r border-white/10 z-50 overflow-hidden transition-transform duration-300 ease-in-out ${showChat ? "translate-x-0" : "-translate-x-full"}`}>
          <CustomChat onClose={() => setShowChat(false)} />
        </div>

        <div className={`absolute top-0 right-0 h-full w-[320px] bg-[#1a1a1a] border-l border-white/10 z-50 flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${showParticipants ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <h3 className="font-medium text-white tracking-tight">Participants ({participants.length})</h3>
            <button onClick={() => setShowParticipants(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {participants.map((p) => (
              <div key={p.sid} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#333] flex items-center justify-center text-white font-medium shrink-0 text-sm">
                  {p.identity.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden text-ellipsis whitespace-nowrap">
                  <span className="text-white/90 text-sm font-medium">{p.identity} {p.isLocal ? "(You)" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <AskPragya open={showPragya} onClose={() => setShowPragya(false)} />
      </div>

      {/* Bottom Bar */}
      <div className="h-[80px] bg-[#111111] border-t border-white/10 flex items-center justify-between px-6 shrink-0 z-50">
         {/* Left Side Controls (AV) */}
         <div className="flex items-center gap-2 w-1/3 justify-start">
            <MicToggle />
            <CamToggle />
         </div>

         {/* Center Controls (Features) */}
         <div className="flex items-center gap-2 w-1/3 justify-center">
            <button onClick={() => setShowParticipants(!showParticipants)} className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${showParticipants ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
               <span className="text-[10px] mt-1 font-medium">People</span>
            </button>
            <button onClick={() => setShowChat(!showChat)} className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${showChat ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               <span className="text-[10px] mt-1 font-medium">Chat</span>
            </button>
            
            <ScreenShareToggle />
            
            <button onClick={() => setShowPragya(!showPragya)} className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${showPragya ? 'bg-[#FF6A2D]/20 text-[#FF6A2D]' : 'hover:bg-white/10 text-[#FF6A2D]/80 hover:text-[#FF6A2D]'}`}>
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12 2.1 7.1"></path><path d="M12 12l9.9 4.9"></path></svg>
               <span className="text-[10px] mt-1 font-medium">Pragya</span>
            </button>
            
            {isHost && (
               <button
                  onClick={isRecording ? onStopRecording : onStartRecording}
                  className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-colors ${isRecording ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10 text-white/70 hover:text-white"}`}
               >
                  <div className={`w-4 h-4 rounded-full ${isRecording ? "bg-red-500" : "border-2 border-current"}`} />
                  <span className="text-[10px] mt-1 font-medium">Record</span>
               </button>
            )}
         </div>

         {/* Right Side Controls (Leave) */}
         <div className="flex items-center gap-2 w-1/3 justify-end">
            <button onClick={() => room.disconnect()} className="flex items-center gap-2 px-5 h-10 rounded-lg bg-[#E53E3E] hover:bg-[#C53030] text-white text-sm font-medium transition-colors">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
               Leave
            </button>
         </div>
      </div>
    </div>
  );
}

// 🎙 Inner Component to handle Recording and Transcription logic (inside LiveKitRoom)
function RecordingManager({ roomName, isInitialHost, router }: { roomName: string, isInitialHost: boolean, router: any }) {
  const { send } = useChat();
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(audioBlob);
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Failed to access microphone for recording.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function uploadRecording(blob: Blob) {
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("roomName", roomName);

    try {
      const res = await fetch("/api/meet/upload-audio", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success("Recording saved successfully!");
        if (data.transcript && send) {
          send(`[AUDIO TRANSCRIPT]: ${data.transcript}`);
        }
      } else {
        toast.error("Failed to save recording.");
      }
    } catch (err) {
      toast.error("Error uploading recording.");
    }
  }

  return (
    <CustomConference
      isHost={isInitialHost}
      isRecording={recording}
      onStartRecording={startRecording}
      onStopRecording={stopRecording}
    />
  );
}

function RoomPageContent() {
  const router = useRouter();
  const params = useParams();
  const roomName = params.roomId as string;

  const [preJoinChoices, setPreJoinChoices] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSecureHost, setIsSecureHost] = useState(false);

  useEffect(() => {
    async function getToken() {
      const res = await fetch("/api/meet/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setIsSecureHost(data.isHost);
      }
    }
    getToken();
  }, [roomName]);

  if (!preJoinChoices) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-4 font-sans">
         <div className="mb-8 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
               <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
               <h2 className="text-2xl font-bold tracking-tight text-white">hey attrangi</h2>
            </div>
            <h1 className="text-2xl font-medium text-white/90">Ready to join?</h1>
         </div>

         <div className="w-full max-w-[600px] flex flex-col relative z-10">
            {/* The LiveKit PreJoin component handles its own layout, we just need to wrap it and style it using global css overrides if needed, but it naturally aligns with the requested layout */}
            <PreJoin 
               onSubmit={(values) => setPreJoinChoices(values)}
               defaults={{
                  audioEnabled: true,
                  videoEnabled: true,
               }}
               className="cal-prejoin-wrapper !bg-[#1c1c1c] !border !border-white/10 !rounded-2xl !shadow-2xl !overflow-hidden"
            />
            {/* Inject a tiny bit of custom CSS to make the prejoin look like the Cal.com style if it doesn't already */}
            <style dangerouslySetInnerHTML={{__html: `
               .cal-prejoin-wrapper .lk-prejoin {
                  background: transparent;
                  padding: 1.5rem;
               }
               .cal-prejoin-wrapper .lk-video-container {
                  border-radius: 0.5rem;
                  overflow: hidden;
                  margin-bottom: 1rem;
                  background: #000;
               }
               .cal-prejoin-wrapper .lk-button-group {
                  justify-content: center;
                  gap: 0.5rem;
               }
               .cal-prejoin-wrapper .lk-button {
                  background: rgba(255,255,255,0.1);
                  border: 1px solid rgba(255,255,255,0.05);
                  color: white;
                  border-radius: 0.5rem;
               }
               .cal-prejoin-wrapper .lk-button:hover {
                  background: rgba(255,255,255,0.2);
               }
               .cal-prejoin-wrapper .lk-device-menu {
                  background: #111;
                  color: white;
                  border: 1px solid rgba(255,255,255,0.1);
               }
               .cal-prejoin-wrapper .lk-form-control {
                  background: #111;
                  color: white;
                  border: 1px solid rgba(255,255,255,0.1);
                  border-radius: 0.5rem;
               }
            `}} />
         </div>
      </div>
    );
  }

  if (!token) return <div className="h-screen flex items-center justify-center bg-[#111111] text-white">Joining meeting…</div>;

  return (
    <div className="h-screen w-screen bg-[#111111]">
      <Toaster position="top-center" richColors />
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL!}
        connect={true}
        video={preJoinChoices.videoEnabled}
        audio={preJoinChoices.audioEnabled}
        onDisconnected={() => router.push(`/meet/${roomName}/post-session`)}
        className="h-screen w-screen overflow-hidden"
      >
        <LayoutContextProvider>
          <RecordingManager roomName={roomName} isInitialHost={isSecureHost} router={router} />
          <RoomEvents router={router} />
          <RoomAudioRenderer />
        </LayoutContextProvider>
      </LiveKitRoom>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#111111] text-white">Loading...</div>}>
      <RoomPageContent />
    </Suspense>
  );
}

function RoomEvents({ router }: { router: any }) {
  const room = useRoomContext();
  useEffect(() => {
    if (!room) return;
    const handleParticipantConnected = (participant: Participant) => toast.success(`${participant.identity} joined the room`);
    const handleParticipantDisconnected = (participant: Participant) => {
      toast.info(`${participant.identity} left the room`);
      if (participant.metadata) {
        try {
          const metadata = JSON.parse(participant.metadata);
          if (metadata.isHost) {
            toast.error("Host ended the meeting.");
            setTimeout(() => {
              room.disconnect();
              // The onDisconnected prop of LiveKitRoom will handle the redirect.
            }, 2000);
          }
        } catch (e) { console.error(e); }
      }
    };
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, router]);
  return null;
}
