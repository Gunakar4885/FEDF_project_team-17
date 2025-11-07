"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Newspaper, TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: string;
  type: 'crypto' | 'stock';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const NewsSection = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchNews = async (type: string = 'all') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/news?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(activeTab);
    
    // Refresh news every 5 minutes
    const interval = setInterval(() => {
      fetchNews(activeTab);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary" />
          <CardTitle>Market News</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="all">All News</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="stock">Stocks</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {loading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                ))}
              </>
            ) : (
              <div
                className="space-y-3 max-h-[600px] overflow-y-auto overscroll-contain pr-2"
                onWheel={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onWheelCapture={(e) => e.stopPropagation()}
                onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onTouchMoveCapture={(e) => e.stopPropagation()}
              >
                {news.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                            {article.title}
                          </h3>
                          {getSentimentIcon(article.sentiment)}
                        </div>
                        
                        {article.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {article.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {article.type === 'crypto' ? 'Crypto' : 'Stock'}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${getSentimentColor(article.sentiment)}`}>
                              {article.sentiment}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>

                        {article.url && article.url !== '#' && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            Read more
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {news.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No news articles available</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
