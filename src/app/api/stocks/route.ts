import { NextResponse } from 'next/server';


let stockCache: any = null;
let stockCacheTime = 0;
const CACHE_DURATION = 30000; 


const generateIndianStocks = () => {
  const indianStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', sector: 'Oil & Gas', basePrice: 2450 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', basePrice: 3650 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', sector: 'Banking', basePrice: 1580 },
    { symbol: 'INFY', name: 'Infosys Ltd', sector: 'IT', basePrice: 1450 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', sector: 'Banking', basePrice: 1120 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', sector: 'FMCG', basePrice: 2380 },
    { symbol: 'ITC', name: 'ITC Ltd', sector: 'FMCG', basePrice: 445 },
    { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', basePrice: 625 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', sector: 'Telecom', basePrice: 1550 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', basePrice: 1780 },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', sector: 'Construction', basePrice: 3450 },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', sector: 'Finance', basePrice: 6850 },
    { symbol: 'WIPRO', name: 'Wipro Ltd', sector: 'IT', basePrice: 425 },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India', sector: 'Automobile', basePrice: 10800 },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', sector: 'Paints', basePrice: 2850 },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', sector: 'IT', basePrice: 1240 },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', sector: 'Banking', basePrice: 1050 },
    { symbol: 'TITAN', name: 'Titan Company Ltd', sector: 'Consumer Goods', basePrice: 3250 },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', sector: 'Cement', basePrice: 9500 },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', sector: 'Conglomerate', basePrice: 2450 },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical', sector: 'Pharma', basePrice: 1580 },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', sector: 'Automobile', basePrice: 780 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', sector: 'Steel', basePrice: 145 },
    { symbol: 'POWERGRID', name: 'Power Grid Corporation', sector: 'Power', basePrice: 285 },
    { symbol: 'NTPC', name: 'NTPC Ltd', sector: 'Power', basePrice: 340 },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', sector: 'Oil & Gas', basePrice: 245 },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', sector: 'Finance', basePrice: 1650 },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd', sector: 'FMCG', basePrice: 2450 },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', sector: 'IT', basePrice: 1580 },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile', basePrice: 2850 },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', sector: 'Steel', basePrice: 880 },
    { symbol: 'DIVISLAB', name: 'Divi\'s Laboratories', sector: 'Pharma', basePrice: 3650 },
    { symbol: 'DRREDDY', name: 'Dr. Reddy\'s Laboratories', sector: 'Pharma', basePrice: 5800 },
    { symbol: 'CIPLA', name: 'Cipla Ltd', sector: 'Pharma', basePrice: 1450 },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Healthcare', basePrice: 6250 },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ', sector: 'Infrastructure', basePrice: 1180 },
    { symbol: 'GRASIM', name: 'Grasim Industries', sector: 'Cement', basePrice: 2350 },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', sector: 'Banking', basePrice: 980 },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd', sector: 'Automobile', basePrice: 4850 },
    { symbol: 'BPCL', name: 'Bharat Petroleum', sector: 'Oil & Gas', basePrice: 285 },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', sector: 'Mining', basePrice: 420 },
    { symbol: 'BRITANNIA', name: 'Britannia Industries', sector: 'FMCG', basePrice: 4850 },
    { symbol: 'SHREECEM', name: 'Shree Cement Ltd', sector: 'Cement', basePrice: 25000 },
    { symbol: 'HINDALCO', name: 'Hindalco Industries', sector: 'Metals', basePrice: 625 },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', sector: 'Automobile', basePrice: 4250 },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance', sector: 'Insurance', basePrice: 1450 },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', sector: 'Insurance', basePrice: 680 },
    { symbol: 'ICICIGI', name: 'ICICI Lombard General', sector: 'Insurance', basePrice: 1850 },
    { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd', sector: 'Automobile', basePrice: 9250 },
    { symbol: 'VEDL', name: 'Vedanta Ltd', sector: 'Mining', basePrice: 445 },
  ];


  const additionalStocks = Array.from({ length: 50 }, (_, i) => ({
    symbol: `STOCK${i + 51}`,
    name: `Indian Company ${i + 51}`,
    sector: ['IT', 'Banking', 'FMCG', 'Pharma', 'Auto'][i % 5],
    basePrice: Math.random() * 5000 + 100,
  }));

  const allStocks = [...indianStocks, ...additionalStocks];

  return allStocks.map((stock, index) => {
    const changePercent = (Math.random() - 0.5) * 10; 
    const currentPrice = stock.basePrice * (1 + changePercent / 100);
    const volume = Math.floor(Math.random() * 10000000) + 100000;
    const marketCap = currentPrice * (Math.random() * 100000000 + 10000000);

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      current_price: parseFloat(currentPrice.toFixed(2)),
      change_percent: parseFloat(changePercent.toFixed(2)),
      change_amount: parseFloat((currentPrice - stock.basePrice).toFixed(2)),
      volume: volume,
      market_cap: Math.floor(marketCap),
      high_24h: parseFloat((currentPrice * 1.02).toFixed(2)),
      low_24h: parseFloat((currentPrice * 0.98).toFixed(2)),
      open_price: parseFloat((stock.basePrice * (1 + (Math.random() - 0.5) * 0.05)).toFixed(2)),
      previous_close: stock.basePrice,
      rank: index + 1,
    };
  });
};

export async function GET() {
  try {
    // Check cache
    const now = Date.now();
    if (stockCache && (now - stockCacheTime) < CACHE_DURATION) {
      return NextResponse.json(stockCache);
    }

    
    const stockData = generateIndianStocks();

   
    stockCache = stockData;
    stockCacheTime = now;

    return NextResponse.json(stockData);
  } catch (error) {
    console.error('Error generating stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}
