import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // We use a free rss2json service to convert the ScienceDaily Mental Health RSS into JSON
    // ScienceDaily RSS: https://www.sciencedaily.com/rss/mind_brain/mental_health.xml
    const rssUrl = 'https://www.sciencedaily.com/rss/mind_brain/mental_health.xml';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(apiUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS data: ${response.status}`);
    }

    const data = await response.json();
    
    // Map the RSS data to match our frontend's expected schema
    const formattedNews = (data.items || []).slice(0, 5).map((item: any, index: number) => ({
      id: index + 1,
      source: 'ScienceDaily',
      title: item.title,
      time: new Date(item.pubDate).toLocaleDateString(),
      image: item.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=300&auto=format&fit=crop", // Fallback image
      link: item.link
    }));

    return NextResponse.json({ news: formattedNews });
  } catch (error) {
    console.error('Error fetching live news:', error);
    return NextResponse.json({ error: 'Failed to fetch live news' }, { status: 500 });
  }
}
