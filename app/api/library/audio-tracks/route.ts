import { NextResponse } from 'next/server';
import { getAudioTracks } from '@/app/data/audioTracks';

export async function GET() {
  try {
    const tracks = await getAudioTracks();
    return NextResponse.json({ tracks }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch audio tracks:', error);
    return NextResponse.json({ error: 'Failed to fetch audio tracks' }, { status: 500 });
  }
}


