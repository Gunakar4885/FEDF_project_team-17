"use client";

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface AssetCardProps {
  name: string;
  symbol: string;
  price: number;
  change: number;
  image?: string;
  marketCap?: number;
  volume?: number;
  onClick?: () => void;
}

export default function AssetCard({
  name,
  symbol,
  price,
  change,
  image,
  marketCap,
  volume,
  onClick,
}: AssetCardProps) {
  const isPositive = change >= 0;

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `₹${(num / 1e3).toFixed(2)}K`;
    return `₹${num.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-card to-card/50 border-border/50"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {image && (
                <img
                  src={image}
                  alt={symbol}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h3 className="font-semibold text-foreground">{symbol}</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                  {name}
                </p>
              </div>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPositive
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(change).toFixed(2)}%
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-2xl font-bold text-foreground">
                ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>

            {(marketCap || volume) && (
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                {marketCap && (
                  <div>
                    <p className="font-medium">Market Cap</p>
                    <p>{formatNumber(marketCap)}</p>
                  </div>
                )}
                {volume && (
                  <div className="text-right">
                    <p className="font-medium">Volume</p>
                    <p>{formatNumber(volume)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
