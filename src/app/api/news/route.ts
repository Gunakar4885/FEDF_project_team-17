import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let newsCache: { data: any[], timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'all'; 
    
    
    if (newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION) {
      const filteredNews = filterNewsByType(newsCache.data, type);
      return NextResponse.json(filteredNews);
    }

    const newsArticles: any[] = [];

    try {
      const cryptoNewsRes = await fetch('https://api.coingecko.com/api/v3/news', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (cryptoNewsRes.ok) {
        const cryptoNews = await cryptoNewsRes.json();
        const formattedCryptoNews = cryptoNews.data?.slice(0, 20).map((item: any) => ({
          id: item.news_id || item.id,
          title: item.title,
          description: item.description || item.content?.substring(0, 200),
          url: item.url,
          image: item.thumb_2x || item.image,
          source: item.author || 'CoinGecko',
          publishedAt: item.updated_at || new Date().toISOString(),
          type: 'crypto',
          sentiment: analyzeSentiment(item.title + ' ' + (item.description || ''))
        })) || [];
        
        newsArticles.push(...formattedCryptoNews);
      }
    } catch (error) {
      console.error('Error fetching crypto news:', error);
    }

    const stockNews = [
      {
        id: 'stock-1',
        title: 'Indian Markets Show Strong Growth Momentum',
        description: 'BSE Sensex and NSE Nifty continue their upward trajectory as investor sentiment remains positive.',
        url: '#',
        source: 'Market Watch',
        publishedAt: new Date().toISOString(),
        type: 'stock',
        sentiment: 'positive'
      },
      {
        id: 'stock-2',
        title: 'IT Sector Leads Market Rally',
        description: 'Technology stocks including TCS, Infosys, and Wipro show significant gains in today\'s trading session.',
        url: '#',
        source: 'Financial Express',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        type: 'stock',
        sentiment: 'positive'
      },
      {
        id: 'stock-3',
        title: 'Banking Sector Consolidation Continues',
        description: 'Major banking stocks show mixed performance as sector consolidation remains in focus.',
        url: '#',
        source: 'Economic Times',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        type: 'stock',
        sentiment: 'neutral'
      }
    ];

    newsArticles.push(...stockNews);

    newsArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    newsCache = {
      data: newsArticles,
      timestamp: Date.now()
    };

    const filteredNews = filterNewsByType(newsArticles, type);
    return NextResponse.json(filteredNews);

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

function filterNewsByType(news: any[], type: string) {
  if (type === 'all') return news;
  return news.filter(item => item.type === type);
}

function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['growth', 'surge', 'rally', 'gain', 'profit', 'bullish', 'strong', 'rise', 'high', 'up', 'increase'];
  const negativeWords = ['loss', 'drop', 'fall', 'decline', 'bearish', 'weak', 'down', 'crash', 'decrease', 'low'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}
