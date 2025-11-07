"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const generateChatResponse = (message: string, context?: any): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello! I'm your Market Assistant. I can help you with stock and cryptocurrency information. What would you like to know?";
  }

  if (lowerMessage.includes('stock') && (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('good'))) {
    return "Based on current market trends, here are some popular Indian stocks:\n\n• **Large Cap**: Reliance Industries (RELIANCE.BSE), TCS (TCS.BSE), HDFC Bank (HDFCBANK.BSE)\n• **Mid Cap**: Zomato, Delhivery, Info Edge\n• **IT Sector**: Infosys, Wipro, Tech Mahindra\n\nRemember to do your own research and consider your risk tolerance before investing!";
  }

  if (lowerMessage.includes('crypto') && (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('good'))) {
    return "Here are some popular cryptocurrencies to consider:\n\n• **Bitcoin (BTC)**: Market leader and most established\n• **Ethereum (ETH)**: Leading smart contract platform\n• **Binance Coin (BNB)**: Exchange token with multiple utilities\n• **Cardano (ADA)**: Proof-of-stake blockchain platform\n\nAlways research and understand the risks before investing in crypto!";
  }

  if (lowerMessage.includes('market') && (lowerMessage.includes('today') || lowerMessage.includes('now') || lowerMessage.includes('current'))) {
    return "The current market is showing mixed signals. Indian stocks have been resilient with strong IT and banking sectors. In crypto, Bitcoin remains stable around its current levels. Check the dashboard for real-time data!";
  }

  if (lowerMessage.includes('invest') || lowerMessage.includes('buy')) {
    return "Investment tips:\n\n1. **Diversify**: Don't put all eggs in one basket\n2. **Research**: Study the company/project fundamentals\n3. **Long-term view**: Markets fluctuate, stay patient\n4. **Risk management**: Only invest what you can afford to lose\n5. **Stay updated**: Follow market news regularly\n\nCheck the news section for the latest market updates!";
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('worth')) {
    return "You can see real-time prices for all stocks and cryptocurrencies on the dashboard. Simply search for the asset you're interested in, and click on it for detailed information including charts and market data.";
  }

  if (lowerMessage.includes('compare') || lowerMessage.includes('better') || lowerMessage.includes('vs')) {
    return "To compare assets:\n\n1. Check their market cap and volume\n2. Look at historical performance\n3. Analyze the volatility\n4. Consider the use case (for crypto) or business model (for stocks)\n\nUse the dashboard's sort and filter features to compare multiple assets side by side!";
  }

  if (lowerMessage.includes('learn') || lowerMessage.includes('understand') || lowerMessage.includes('explain')) {
    return "I can help explain:\n\n• **Market Cap**: Total value of all coins/shares\n• **Volume**: Amount traded in 24 hours\n• **Change %**: Price movement over time\n• **Large/Mid/Small Cap**: Company size classification\n\nWhat specific term would you like me to explain?";
  }

  return "I'm here to help with stock and cryptocurrency questions! You can ask me about:\n\n• Stock or crypto recommendations\n• Market trends and analysis\n• Investment tips\n• Price information\n• Comparing different assets\n\nWhat would you like to know?";
};

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Market Assistant. Ask me about stocks or cryptocurrencies!",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Keep track of whether user is near bottom so we only autoscroll when appropriate
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 40; // px from bottom to still consider at bottom
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      shouldAutoScrollRef.current = atBottom;
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll to bottom on new messages if user hasn't scrolled away
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (!shouldAutoScrollRef.current) return;
    // Use rAF to ensure layout is ready
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages]);

  // Ensure we scroll to bottom when opening chat
  useEffect(() => {
    if (!isOpen) return;
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [isOpen]);

  const sendToApi = async (messageText: string, contextToSend: Message[]) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageText, context: contextToSend })
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const fallbackText = generateChatResponse(messageText, contextToSend);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: fallbackText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const fallbackText = generateChatResponse(messageText, contextToSend);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const messageToSend = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend,
      sender: 'user',
      timestamp: new Date()
    };
    const contextWithNew = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    if (isLoading) {
      setQueue(prev => [...prev, messageToSend]);
      return;
    }
    await sendToApi(messageToSend, contextWithNew);
  };

  useEffect(() => {
    if (!isLoading && queue.length > 0) {
      const next = queue[0];
      setQueue(prev => prev.slice(1));
      const context = [...messages];
      sendToApi(next, context);
    }
  }, [isLoading, queue, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-opacity ${
          isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col overflow-hidden rounded-xl">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <CardTitle className="text-lg">Market Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 flex flex-col min-h-0">
            {/* Messages */}
            <ScrollArea
              className="flex-1 min-h-0 p-4"
              viewportRef={scrollRef}
              viewportClassName="overscroll-contain"
              viewportProps={{
                onWheel: (e) => {
                  e.stopPropagation();
                },
                onWheelCapture: (e) => e.stopPropagation(),
                onTouchMove: (e) => {
                  e.stopPropagation();
                },
                onTouchMoveCapture: (e) => e.stopPropagation(),
              }}
            >
              <div className="space-y-4 pr-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex px-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground mr-1'
                          : 'bg-muted ml-1'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about stocks or crypto..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
