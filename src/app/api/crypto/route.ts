import { NextResponse } from 'next/server';


let cryptoCache: any = null;
let cryptoCacheTime = 0;
const CACHE_DURATION = 30000; 

export async function GET() {
  try {
   
    const now = Date.now();
    if (cryptoCache && (now - cryptoCacheTime) < CACHE_DURATION) {
      return NextResponse.json(cryptoCache);
    }

    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto data');
    }

    const data = await response.json();

    const formattedData = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      price_change_percentage_1h: coin.price_change_percentage_1h_in_currency || 0,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      price_change_percentage_7d: coin.price_change_percentage_7d_in_currency || 0,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      ath: coin.ath,
      atl: coin.atl,
    }));

    
    cryptoCache = formattedData;
    cryptoCacheTime = now;

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}
