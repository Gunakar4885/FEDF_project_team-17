"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  type: 'stock' | 'crypto';
}

export default function AssetDetailModal({
  isOpen,
  onClose,
  asset,
  type,
}: AssetDetailModalProps) {
  if (!asset) return null;

  const isPositive = asset.change_percent >= 0 || asset.price_change_percentage_24h >= 0;
  const changePercent = type === 'crypto' 
    ? asset.price_change_percentage_24h 
    : asset.change_percent;

  // Generate mock historical data for the chart
  const generateHistoricalData = () => {
    const days = 30;
    const data = [];
    const labels = [];
    const basePrice = asset.current_price;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
      
      const variation = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + variation - (i / days) * (changePercent / 100));
      data.push(price);
    }

    return { labels, data };
  };

  const { labels, data } = generateHistoricalData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Price (INR)',
        data,
        borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return '₹' + context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 2 });
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return '₹' + value.toLocaleString('en-IN');
          },
        },
      },
    },
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `₹${(num / 1e3).toFixed(2)}K`;
    return `₹${num.toFixed(2)}`;
  };

  // Determine the best image to show for the asset.
  const getAssetImage = () => {
    // Prefer provided image (common for crypto)
    if (asset.image) return asset.image as string;
    // Fallback: a finance-related image keyed by asset name
    const query = encodeURIComponent(`${asset.name} finance`);
    return `https://source.unsplash.com/1200x400/?${query}`;
  };
  const templateImageUrl = process.env.NEXT_PUBLIC_DASHBOARD_IMAGE_URL || '/dashboard-template.jpg';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {(asset.image || type === 'crypto') && (
                <img src={asset.image || getAssetImage()} alt={asset.symbol} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <DialogTitle className="text-2xl">{asset.name}</DialogTitle>
                <p className="text-muted-foreground">{asset.symbol}</p>
              </div>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-lg font-semibold ${
                isPositive
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? <TrendingUp /> : <TrendingDown />}
              {Math.abs(changePercent).toFixed(2)}%
            </div>
          </div>
        </DialogHeader>

        {/* Banner image for visual context */}
        <div className="mt-2">
          <img
            src={getAssetImage()}
            alt={`${asset.name} banner`}
            className="w-full h-44 md:h-56 object-cover rounded-lg"
          />
        </div>

        <div className="space-y-6 mt-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Price</p>
            <p className="text-4xl font-bold">
              ₹{asset.current_price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>

          <div
            className="h-[300px] overflow-x-auto overscroll-contain"
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div style={{ width: `${labels.length * 60}px`, height: '100%' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {asset.market_cap && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                <p className="text-lg font-semibold">{formatNumber(asset.market_cap)}</p>
              </div>
            )}
            
            {(asset.volume || asset.total_volume) && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                <p className="text-lg font-semibold">
                  {formatNumber(asset.volume || asset.total_volume)}
                </p>
              </div>
            )}
            
            {asset.high_24h && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">24h High</p>
                <p className="text-lg font-semibold">
                  ₹{asset.high_24h.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
            
            {asset.low_24h && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">24h Low</p>
                <p className="text-lg font-semibold">
                  ₹{asset.low_24h.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {type === 'stock' && asset.sector && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Sector</p>
                <p className="text-lg font-semibold">{asset.sector}</p>
              </div>
            )}

            {type === 'crypto' && asset.market_cap_rank && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Market Rank</p>
                <p className="text-lg font-semibold">#{asset.market_cap_rank}</p>
              </div>
            )}
          </div>

          <div className="mt-4">
            <img
              src={templateImageUrl}
              alt="Dashboard template"
              className="w-full rounded-lg border border-border/50"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
