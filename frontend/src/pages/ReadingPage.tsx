// src/pages/ReadingPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '../stores/useTarotStore';
import { TarotCard } from '../components/TarotCard';
import { useTarotChat } from '../hooks/useTarotChat';
import { ChatBox } from '../components/ChatBox';
import { useTarotReading } from '../hooks/useTarotReading';
import { LoadingDots } from '../components/LoadingDots';

const getSpreadSize = (spread: 'Destiny' | 'Cruz' | 'Love'): number => {
  switch (spread) {
    case 'Destiny':
      return 3;
    case 'Cruz':
      return 4;
    case 'Love':
      return 2;
    default:
      return 3;
  }
};

const ReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const { cards, question, spread, initializeSpread, isInitializing } = useTarotStore();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const { sendMessage, messages, isLoading: isChatLoading } = useTarotChat(activeCardIndex);
  const { isLoading: isCardLoading } = useTarotReading(activeCardIndex);
  const hasInitialized = useRef(false);

  // Initialize the spread once when the component mounts
  useEffect(() => {
    if (!question) {
      console.log('[ReadingPage] No question found, redirecting to home');
      navigate('/');
      return;
    }

    if (!hasInitialized.current && !cards.length && !isInitializing) {
      console.log('[ReadingPage] Mount effect - Current state:', {
        question,
        spread,
        cardsLength: cards.length,
        isInitializing
      });

      const size = getSpreadSize(spread);
      console.log('[ReadingPage] Initializing spread with size:', size);
      initializeSpread(size);
      hasInitialized.current = true;
    }
  }, [question, spread, cards.length, isInitializing, navigate, initializeSpread]);

  // Log state changes
  useEffect(() => {
    console.log('[ReadingPage] State update:', {
      cardsLength: cards.length,
      isInitializing,
      activeCardIndex,
      currentCardStatus: cards[activeCardIndex]?.status
    });
  }, [cards, isInitializing, activeCardIndex]);

  // Show loading state while initializing
  if (isInitializing || !cards.length) {
    console.log('[ReadingPage] Showing loading state');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-cyan-950 to-emerald-900">
        <div className="text-center">
          <LoadingDots />
          <p className="mt-4 text-yellow-50">Shuffling the cards...</p>
        </div>
      </div>
    );
  }

  console.log('[ReadingPage] Rendering main content');
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-950 to-emerald-900 text-yellow-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4" data-testid="question-display">
            {question}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="card-grid">
          {cards.map((card, index) => (
            <TarotCard
              key={index}
              card={card}
              isActive={index === activeCardIndex}
              onClick={() => setActiveCardIndex(index)}
            />
          ))}
        </div>

        <div className="mt-8" data-testid="chat-section">
          {isCardLoading ? (
            <div className="mb-4 p-4 bg-black/20 backdrop-blur-sm rounded-lg flex justify-center">
              <LoadingDots />
            </div>
          ) : cards[activeCardIndex]?.text ? (
            <div className="mb-4 p-4 bg-black/20 backdrop-blur-sm rounded-lg" data-testid="card-text">
              {cards[activeCardIndex].text}
            </div>
          ) : null}

          <ChatBox
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={isChatLoading}
            inputProps={{
              'data-testid': 'chat-input',
              placeholder: 'Ask about this card...',
              className: 'bg-black/20 backdrop-blur-sm border-pink-500/50'
            }}
            sendButtonProps={{
              'data-testid': 'send-message',
              className: 'bg-pink-500 hover:bg-pink-600'
            }}
          />
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
            disabled={activeCardIndex === 0}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 rounded-lg"
            data-testid="prev-card"
          >
            Previous Card
          </button>
          <button
            onClick={() => setActiveCardIndex(prev => Math.min(cards.length - 1, prev + 1))}
            disabled={activeCardIndex === cards.length - 1}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 rounded-lg"
            data-testid="next-card"
          >
            Next Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadingPage;
