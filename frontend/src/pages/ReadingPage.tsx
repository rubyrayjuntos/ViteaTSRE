// src/pages/ReadingPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '../stores/useTarotStore';
import { useTarotReading } from '../hooks/useTarotReading';
import { LoadingDots } from '../components/LoadingDots';
import { TarotCard } from '../components/TarotCard';
import { ChatBubble } from '../components/ChatBubble';
import { env } from '../env';

interface ChatResponse {
  response: string;
}

export const ReadingPage: React.FC = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isPapiLoading, setIsPapiLoading] = useState(false);
  const { cards, cardDisplayStates, isInitializing, spreadSize, messages, addMessage } = useTarotStore();

  // Create an array of indices for the spread
  const cardIndices = Array.from({ length: spreadSize }, (_, i) => i);

  const handleAskPapi = async () => {
    if (!userInput.trim() || !cards[activeCardIndex]) return;

    const cardId = cards[activeCardIndex].id;
    setIsPapiLoading(true);
    
    try {
      // Add user message to the store
      addMessage({
        cardId,
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      });

      // Clear input immediately after sending
      setUserInput('');

      // Make API call to get Papi's response
      const response = await fetch(`${env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          userMessage: userInput,
          previousMessages: messages
            .filter((m) => m.cardId === cardId)
            .map((m) => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Papi');
      }

      const data = await response.json() as ChatResponse;
      
      // Add Papi's response to the store
      addMessage({
        cardId,
        role: 'assistant',
        content: data.response,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error asking Papi:', error);
      // Add error message to the store
      addMessage({
        cardId,
        role: 'assistant',
        content: "Lo siento, mi amor! I'm having trouble channeling the spirits right now. Please try again.",
        timestamp: Date.now()
      });
    } finally {
      setIsPapiLoading(false);
    }
  };

  const handleReset = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-300">Your Reading, mi amor 🔮</h1>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md"
          >
            New Reading 💫
          </button>
        </div>

        {isInitializing ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <LoadingDots />
            <p className="mt-4 text-lg">Papi is channeling the cards' energy...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cardIndices.map((index) => (
                <CardContainer
                  key={index}
                  index={index}
                  isActive={index === activeCardIndex}
                  onClick={() => setActiveCardIndex(index)}
                />
              ))}
            </div>

            <div className="bg-black/30 rounded-lg p-6">
              {cards[activeCardIndex] && cardDisplayStates[activeCardIndex]?.hasLoadedText && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-pink-300">
                    Chat with Papi about this card 💕
                  </h2>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto p-2">
                    <ChatBubble
                      role="assistant"
                      message={cards[activeCardIndex].text}
                    />

                    {messages
                      .filter((msg) => msg.cardId === cards[activeCardIndex].id)
                      .map((msg) => (
                        <ChatBubble
                          key={`${msg.cardId}-${msg.timestamp}`}
                          role={msg.role}
                          message={msg.content}
                        />
                      ))}

                    {isPapiLoading && (
                      <div className="flex justify-center">
                        <LoadingDots />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAskPapi();
                        }
                      }}
                      placeholder="Ask Papi about this card..."
                      className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      onClick={handleAskPapi}
                      disabled={isPapiLoading || !userInput.trim()}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ask 💋
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CardContainer: React.FC<{
  index: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ index, isActive, onClick }) => {
  const { card, isLoading, hasLoadedText, hasLoadedImage } = useTarotReading(index);

  if (!card) {
    return (
      <div className="bg-black/30 rounded-lg p-6 flex items-center justify-center min-h-[400px]">
        <LoadingDots />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer transition-transform duration-200 ${
        isActive ? 'scale-105 ring-2 ring-pink-500 rounded-lg' : 'hover:scale-102'
      }`}
    >
      <TarotCard
        card={card}
        isLoading={isLoading}
        hasLoadedText={hasLoadedText}
        hasLoadedImage={hasLoadedImage}
      />
    </div>
  );
};
