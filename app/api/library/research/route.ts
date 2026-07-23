import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Search PubMed for the latest mental health articles
    const searchUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=mental+health+OR+psychiatry&retmode=json&retmax=5&sort=pub_date';
    const searchResponse = await fetch(searchUrl, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!searchResponse.ok) {
      throw new Error(`Failed to fetch PubMed search: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist;

    if (!ids || ids.length === 0) {
      return NextResponse.json({ research: [] });
    }

    // 2. Fetch summaries for those IDs
    const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      throw new Error(`Failed to fetch PubMed summaries: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    const results = summaryData.result;

    // 3. Format the data for our frontend
    const formattedResearch = ids.map((id: string, index: number) => {
      const item = results[id];
      return {
        id: index + 1,
        title: item.title,
        journal: item.fulljournalname || item.source,
        date: new Date(item.pubdate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        tag: "Research",
        link: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    });

    return NextResponse.json({ research: formattedResearch });
  } catch (error) {
    console.error('Error fetching live research:', error);
    return NextResponse.json({ error: 'Failed to fetch live research' }, { status: 500 });
  }
}
