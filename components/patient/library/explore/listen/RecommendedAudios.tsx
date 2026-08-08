import React, { useEffect, useState } from 'react';
import { Lock, Play } from 'lucide-react';
import { useListenPlayer } from '@/components/patient/library/explore/listen/ListenPlayerContext';
import ListenCover from '@/components/patient/library/explore/listen/ListenCover';
import type { ListenTrack } from '@/data/listenContent';

interface AudioTrack extends ListenTrack {
  isPremium: boolean;
  imageUrl?: string;
}

export default function RecommendedAudios() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const { playTrack, currentTrack, isPlaying } = useListenPlayer();

  const userHasPremium = false; // Placeholder until authentication is wired.

  useEffect(() => {
    async function fetchTracks() {
      try {
        const res = await fetch('/api/library/audio-tracks');
        if (res.ok) {
          const data = await res.json();
          setTracks(data.tracks ?? []);
        }
      } catch (err) {
        console.error('Failed to load audio tracks', err);
      }
    }
    fetchTracks();
  }, []);

  if (tracks.length === 0) {
    return <p className="text-sm text-slate-500">No audio sessions available.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tracks.map((track) => {
        const isCurrent = currentTrack?.id === track.id;
        const isThisPlaying = isCurrent && isPlaying;

        return (
          <div
            key={track.id}
            onClick={() => playTrack(track)}
            className="group relative cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden p-4 flex items-center gap-4"
          >
            <div className="relative shrink-0">
              <ListenCover
                illustration={track.coverIllustration ?? 'rain'}
                size="md"
                title={track.title}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                  {track.category}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {track.duration}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-800 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                {track.title}
              </h4>
              {track.description ? (
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {track.description}
                </p>
              ) : null}
            </div>

            {track.isPremium && !userHasPremium && (
              <div className="absolute top-2 right-2 bg-slate-100/90 rounded-full p-1 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

