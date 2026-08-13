import { prisma } from '@/lib/prisma';
import type { ListenTrack, ListenCategory, ListenCoverIllustration } from '@/data/listenContent';
import type { AudioTrack as PrismaAudioTrack } from '@prisma/client';

export interface DbAudioTrack extends ListenTrack {
  isPremium: boolean;
  imageUrl?: string | null;
}

function mapCategory(dbCat: string): ListenCategory {
  return dbCat as ListenCategory;
}

function mapCoverIllustration(category: ListenCategory, index: number): ListenCoverIllustration {
  const byCategory: Record<ListenCategory, ListenCoverIllustration[]> = {
    Rain: ['rain', 'cloud'],
    Ocean: ['waves'],
    Nature: ['leaves', 'sun'],
    Instrumental: ['moon', 'stone'],
    "Calm Down": ['cloud', 'rain'],
    "Comfort": ['sun', 'stone'],
    "Emotional Release": ['cloud', 'rain'],
    "Focus": ['moon', 'stone'],
    "Ground & Breathe": ['leaves', 'sun'],
    "Lift Your Mood": ['sun', 'leaves'],
    "Reflect": ['moon', 'stone'],
    "Sleep & Wind Down": ['moon', 'cloud'],
  };
  const list = byCategory[category] || ['rain'];
  return list[index % list.length];
}

function formatDuration(durationSeconds?: number | null): string {
  if (!durationSeconds || durationSeconds <= 0) return '5 min';
  const mins = Math.ceil(durationSeconds / 60);
  return `${mins} min`;
}

export function mapAudioTrackToListenTrack(record: PrismaAudioTrack, index: number): DbAudioTrack {
  const category = mapCategory(record.category);
  const audioSrc = record.audioUrl ? encodeURI(record.audioUrl) : '/media/audio/calm-placeholder.wav';

  return {
    id: record.id,
    slug: record.id,
    title: record.title,
    shortDescription: record.description ?? '',
    description: record.description ?? '',
    category,
    artist: 'Hey Attrangi',
    duration: formatDuration(record.duration),
    displayOrder: index + 1,
    audioAvailable: true,
    coverIllustration: record.imageUrl ? (record.imageUrl as any) : mapCoverIllustration(category, index),
    audioSrc,
    isPremium: record.isPremium ?? false,
    imageUrl: record.imageUrl ?? undefined,
    coverImage: record.imageUrl ?? undefined,
  };
}

export async function getAudioTracks(): Promise<DbAudioTrack[]> {
  const records = await prisma.audioTrack.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return records.map(mapAudioTrackToListenTrack);
}

export async function getAudioTrackByIdOrSlug(idOrSlug: string): Promise<DbAudioTrack | null> {
  try {
    let record = await prisma.audioTrack.findUnique({
      where: { id: idOrSlug },
    });

    if (!record) {
      const all = await prisma.audioTrack.findMany();
      record = all.find(
        (r) => r.id === idOrSlug || r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === idOrSlug.toLowerCase()
      ) ?? null;
    }

    if (!record) return null;
    return mapAudioTrackToListenTrack(record, 0);
  } catch {
    return null;
  }
}

