"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, RefreshCw, ArrowUpDown } from 'lucide-react';
import AssetCard from '@/components/AssetCard';
import AssetDetailModal from '@/components/AssetDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsSection } from '@/components/NewsSection';
import { ChatBot } from '@/components/ChatBot';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stocks, setStocks] = useState<any[]>([]);
  const [crypto, setCrypto] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [assetType, setAssetType] = useState<'stock' | 'crypto'>('stock');
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'change' | 'marketCap'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=' + encodeURIComponent('/dashboard'));
    }
  }, [session, isPending, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stocksRes, cryptoRes] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/crypto'),
      ]);

      if (stocksRes.ok) {
        const stocksData = await stocksRes.json();
        setStocks(stocksData);
      }

      if (cryptoRes.ok) {
        const cryptoData = await cryptoRes.json();
        setCrypto(cryptoData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchData();

      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const filterAndSortAssets = (assets: any[], type: 'stock' | 'crypto') => {
    let filtered = assets.filter((asset) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        asset.name.toLowerCase().includes(searchLower) ||
        asset.symbol.toLowerCase().includes(searchLower)
      );
    });

    // Sort assets
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'price':
          aValue = a.current_price;
          bValue = b.current_price;
          break;
        case 'change':
          aValue = type === 'crypto' ? a.price_change_percentage_24h : a.change_percent;
          bValue = type === 'crypto' ? b.price_change_percentage_24h : b.change_percent;
          break;
        case 'marketCap':
          aValue = a.market_cap || 0;
          bValue = b.market_cap || 0;
          break;
        default: // rank
          aValue = type === 'crypto' ? a.market_cap_rank : a.rank;
          bValue = type === 'crypto' ? b.market_cap_rank : b.rank;
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  };

  const categorizeStocks = (stocks: any[]) => {
    const largeCap: any[] = [];
    const midCap: any[] = [];
    const smallCap: any[] = [];

    stocks.forEach((stock) => {
      const marketCap = stock.market_cap || 0;
      // Large cap: > 20,000 Cr, Mid cap: 5,000-20,000 Cr, Small cap: < 5,000 Cr
      if (marketCap >= 20000_00_00000) {
        largeCap.push(stock);
      } else if (marketCap >= 5000_00_00000) {
        midCap.push(stock);
      } else {
        smallCap.push(stock);
      }
    });

    return { largeCap, midCap, smallCap };
  };

  const toggleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const filteredStocks = filterAndSortAssets(stocks, 'stock');
  const { largeCap, midCap, smallCap } = categorizeStocks(filteredStocks);
  const filteredCrypto = filterAndSortAssets(crypto, 'crypto');

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Market Dashboard
                  </h1>
                  <p className="text-muted-foreground">Real-time stocks & crypto in INR</p>
                </div>
              </div>

              {/* Search and Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSort('price')}
                    className="gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    Price
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSort('change')}
                    className="gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    Change
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleSort('marketCap')}
                    className="gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    Market Cap
                  </Button>
                  <Button
                    onClick={fetchData}
                    size="sm"
                    className="gap-2"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs - Crypto First */}
            <Tabs defaultValue="crypto" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="crypto">
                  Crypto ({filteredCrypto.length})
                </TabsTrigger>
                <TabsTrigger value="stocks">
                  Stocks ({filteredStocks.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crypto">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-[180px] rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCrypto.map((coin) => (
                      <AssetCard
                        key={coin.id}
                        name={coin.name}
                        symbol={coin.symbol}
                        price={coin.current_price}
                        change={coin.price_change_percentage_24h}
                        image={coin.image}
                        marketCap={coin.market_cap}
                        volume={coin.total_volume}
                        onClick={() => {
                          setSelectedAsset(coin);
                          setAssetType('crypto');
                        }}
                      />
                    ))}
                  </div>
                )}

                {!loading && filteredCrypto.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No cryptocurrencies found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stocks">
                <Tabs defaultValue="large" className="w-full">
                  <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
                    <TabsTrigger value="large">
                      Large Cap ({largeCap.length})
                    </TabsTrigger>
                    <TabsTrigger value="mid">
                      Mid Cap ({midCap.length})
                    </TabsTrigger>
                    <TabsTrigger value="small">
                      Small Cap ({smallCap.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="large">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-[180px] rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {largeCap.map((stock) => (
                          <AssetCard
                            key={stock.symbol}
                            name={stock.name}
                            symbol={stock.symbol}
                            price={stock.current_price}
                            change={stock.change_percent}
                            marketCap={stock.market_cap}
                            volume={stock.volume}
                            onClick={() => {
                              setSelectedAsset(stock);
                              setAssetType('stock');
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {!loading && largeCap.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No large cap stocks found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="mid">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-[180px] rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {midCap.map((stock) => (
                          <AssetCard
                            key={stock.symbol}
                            name={stock.name}
                            symbol={stock.symbol}
                            price={stock.current_price}
                            change={stock.change_percent}
                            marketCap={stock.market_cap}
                            volume={stock.volume}
                            onClick={() => {
                              setSelectedAsset(stock);
                              setAssetType('stock');
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {!loading && midCap.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No mid cap stocks found</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="small">
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <Skeleton key={i} className="h-[180px] rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {smallCap.map((stock) => (
                          <AssetCard
                            key={stock.symbol}
                            name={stock.name}
                            symbol={stock.symbol}
                            price={stock.current_price}
                            change={stock.change_percent}
                            marketCap={stock.market_cap}
                            volume={stock.volume}
                            onClick={() => {
                              setSelectedAsset(stock);
                              setAssetType('stock');
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {!loading && smallCap.length === 0 && (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground">No small cap stocks found</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>

          {/* News Sidebar - 1/3 width on large screens */}
          <div className="lg:col-span-1">
            <NewsSection />
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      <AssetDetailModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
        type={assetType}
      />

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}