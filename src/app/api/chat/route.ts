import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    // Simple AI chatbot logic for stock/crypto recommendations
    const response = generateChatResponse(message, context);

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Error in chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function generateChatResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();

  // Greetings
  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello! I'm your Market Assistant. I can help you with stock and cryptocurrency information. What would you like to know?";
  }

  // Stock recommendations
  if (lowerMessage.includes('stock') && (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('good'))) {
    return "Based on current market trends, here are some popular Indian stocks:\n\n• **Large Cap**: Reliance Industries (RELIANCE.BSE), TCS (TCS.BSE), HDFC Bank (HDFCBANK.BSE)\n• **Mid Cap**: Zomato, Delhivery, Info Edge\n• **IT Sector**: Infosys, Wipro, Tech Mahindra\n\nRemember to do your own research and consider your risk tolerance before investing!";
  }

  // Crypto recommendations
  if (lowerMessage.includes('crypto') && (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('good'))) {
    return "Here are some popular cryptocurrencies to consider:\n\n• **Bitcoin (BTC)**: Market leader and most established\n• **Ethereum (ETH)**: Leading smart contract platform\n• **Binance Coin (BNB)**: Exchange token with multiple utilities\n• **Cardano (ADA)**: Proof-of-stake blockchain platform\n\nAlways research and understand the risks before investing in crypto!";
  }

  // Market analysis
  if (lowerMessage.includes('market') && (lowerMessage.includes('today') || lowerMessage.includes('now') || lowerMessage.includes('current'))) {
    return "The current market is showing mixed signals. Indian stocks have been resilient with strong IT and banking sectors. In crypto, Bitcoin remains stable around its current levels. Check the dashboard for real-time data!";
  }

  // Investment advice
  if (lowerMessage.includes('invest') || lowerMessage.includes('buy')) {
    return "Investment tips:\n\n1. **Diversify**: Don't put all eggs in one basket\n2. **Research**: Study the company/project fundamentals\n3. **Long-term view**: Markets fluctuate, stay patient\n4. **Risk management**: Only invest what you can afford to lose\n5. **Stay updated**: Follow market news regularly\n\nCheck the news section for the latest market updates!";
  }

  // Price queries
  if (lowerMessage.includes('price') || lowerMessage.includes('worth')) {
    return "You can see real-time prices for all stocks and cryptocurrencies on the dashboard. Simply search for the asset you're interested in, and click on it for detailed information including charts and market data.";
  }

  // Comparison
  if (lowerMessage.includes('compare') || lowerMessage.includes('better') || lowerMessage.includes('vs')) {
    return "To compare assets:\n\n1. Check their market cap and volume\n2. Look at historical performance\n3. Analyze the volatility\n4. Consider the use case (for crypto) or business model (for stocks)\n\nUse the dashboard's sort and filter features to compare multiple assets side by side!";
  }

  // Learning
  if (lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('explain')) {
    return "I can help explain:\n\n• **Market Cap**: Total value of all coins/shares\n• **Volume**: Amount traded in 24 hours\n• **Change %**: Price movement over time\n• **Large/Mid/Small Cap**: Company size classification\n\nWhat specific term would you like me to explain?";
  }

  // Default response
  return "I'm here to help with stock and cryptocurrency questions! You can ask me about:\n\n• Stock or crypto recommendations\n• Market trends and analysis\n• Investment tips\n• Price information\n• Comparing different assets\n\nWhat would you like to know?";
}
