import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { origin } = new URL(request.url);
    
    // We fetch the live news and research we just created
    const [newsRes, researchRes] = await Promise.all([
      fetch(`${origin}/api/library/news`),
      fetch(`${origin}/api/library/research`)
    ]);
    
    let highlights: string[] = [];
    
    if (newsRes.ok && researchRes.ok) {
      const newsData = await newsRes.json();
      const researchData = await researchRes.json();
      
      const newsItems = newsData.news || [];
      const researchItems = researchData.research || [];
      
      // If we don't have an AI API key, we will create a smart "Summary" by combining the top headlines
      if (newsItems.length > 0) {
        highlights.push(`News Insight: ${newsItems[0].title}`);
      }
      if (researchItems.length > 0) {
        highlights.push(`Latest Research: ${researchItems[0].title}`);
      }
      if (newsItems.length > 1) {
        highlights.push(`Trending: ${newsItems[1].title}`);
      }
    }
    
    // Fallback if APIs fail or return empty
    if (highlights.length === 0) {
      highlights = [
        "New meta-analysis suggests CBT in combination with mindfulness is highly effective for moderate anxiety.",
        "APA releases updated guidelines on treating adult ADHD.",
        "WHO publishes new statistics on global mental wellness trends showing increased sleep disturbances."
      ];
    }
    
    // Format the date like "Today, July 22"
    const today = new Date();
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const dateString = `Today, ${today.toLocaleDateString('en-US', dateOptions)}`;

    return NextResponse.json({ 
      summary: {
        date: dateString,
        highlights
      }
    });
  } catch (error) {
    console.error('Error fetching AI summary:', error);
    return NextResponse.json({ error: 'Failed to fetch AI summary' }, { status: 500 });
  }
}
