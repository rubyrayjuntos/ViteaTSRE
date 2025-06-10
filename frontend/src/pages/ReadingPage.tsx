// src/pages/ReadingPage.tsx
import React, { useState, useEffect } from 'react';
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
  const { cards, question, spread, initializeSpread } = useTarotStore();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const { sendMessage, messages, isLoading: isChatLoading } = useTarotChat(activeCardIndex);
  const { } = useTarotReading(activeCardIndex);

  // Initialize the spread if we don't have cards yet
  useEffect(() => {
    if (!cards.length && question) {
      const size = getSpreadSize(spread);
      initializeSpread(size);
    } else if (!question) {
      // If there's no question, redirect back to home
      navigate('/');
    }
  }, [cards.length, question, spread, initializeSpread, navigate]);

  if (!cards.length || !question) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
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
        {cards[activeCardIndex]?.text && (
          <div className="mb-4 p-4 bg-muted rounded-lg" data-testid="card-text">
            {cards[activeCardIndex].text}
          </div>
        )}

        <ChatBox
          messages={messages}
          onSendMessage={sendMessage}
          isLoading={isChatLoading}
          inputProps={{
            'data-testid': 'chat-input',
            placeholder: 'Ask about this card...'
          }}
          sendButtonProps={{
            'data-testid': 'send-message'
          }}
        />
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={() => setActiveCardIndex(prev => Math.max(0, prev - 1))}
          disabled={activeCardIndex === 0}
          className="btn btn-secondary"
          data-testid="prev-card"
        >
          Previous Card
        </button>
        <button
          onClick={() => setActiveCardIndex(prev => Math.min(cards.length - 1, prev + 1))}
          disabled={activeCardIndex === cards.length - 1}
          className="btn btn-secondary"
          data-testid="next-card"
        >
          Next Card
        </button>
      </div>
    </div>
  );
};

export default ReadingPage;
