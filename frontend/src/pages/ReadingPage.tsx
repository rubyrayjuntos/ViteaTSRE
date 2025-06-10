// src/pages/ReadingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '../stores/useTarotStore';
import { useTarotReading } from '../hooks/useTarotReading';
import { useChatStore } from '../stores/useChatStore';
import { sendChatMessage } from '../services/chatService';
import { TarotCard } from '../components/TarotCard';
import ChatBubble from '../components/ChatBubble';
import LoadingDots from '../components/LoadingDots';

const BACKEND_URL = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:8000';

export default function ReadingPage() {
  const navigate = useNavigate();
  const {
    cards,
    cardDisplayStates,
    spreadSize,
    updateCardDisplayState,
    question,
    reset: resetTarot,
    isInitializing,
  } = useTarotStore();

  const { isFetching } = useTarotReading();

  const {
    messages,
    addMessage,
    reset: resetChat,
  } = useChatStore();

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [papiResponse, setPapiResponse] = useState('');
  const [isPapiLoading, setIsPapiLoading] = useState(false);
  const [hoverCardIndex, setHoverCardIndex] = useState<number | null>(null);

  useEffect(() => {
    if (cardDisplayStates?.[0] && !cardDisplayStates[0].flipAnimationCompleted) {
      updateCardDisplayState(0, { flipAnimationCompleted: true });
    }
  }, [cardDisplayStates, updateCardDisplayState]);

  const handleCardFlipCompleted = (index: number) => {
    updateCardDisplayState(index, { flipAnimationCompleted: true });
  };

  const handleAskPapi = async () => {
    const currentCard = cards[activeCardIndex];
    if (!currentCard || !currentCard.id || !userInput.trim()) {
      setPapiResponse('Papi needs your words to cast his spell, mi cielo 💫');
      return;
    }

    setIsPapiLoading(true);
    setPapiResponse('');

    try {
      // Get previous cards (all cards before the current one)
      const previousCards = cards.slice(0, activeCardIndex);

      // Add user's message to chat history
      addMessage({
        role: 'user',
        content: userInput,
        cardId: currentCard.id,
      });

      // Send chat request with full context
      const response = await sendChatMessage({
        question: userInput,
        currentCard,
        previousCards,
        chatHistory: messages,
      });

      // Add Papi's response to chat history
      addMessage({
        role: 'assistant',
        content: response,
        cardId: currentCard.id,
      });

      setPapiResponse(response);
    } catch (err) {
      console.error('Error in chat request:', err);
      setPapiResponse("Papi's lips were sealed by static, try again 💔");
    } finally {
      setIsPapiLoading(false);
    }
  };

  const handleRevealNext = () => {
    const next = activeCardIndex + 1;
    if (next < spreadSize) {
      setActiveCardIndex(next);
      updateCardDisplayState(next, { flipAnimationCompleted: true });
      setUserInput('');
      setPapiResponse('');
    }
  };

  // Reset both stores when starting a new reading
  const handleReset = () => {
    resetTarot();
    resetChat();
    navigate('/');
  };

  // Show loading message while initializing the spread
  if (isFetching && !cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-950 via-purple-900 to-black">
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <p className="text-xl mb-4">Papi is shuffling and lighting candles... 🕯️✨</p>
          <LoadingDots />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center min-h-screen gap-6 bg-gradient-to-b from-rose-950 via-purple-900 to-black text-white">
      <div className="flex justify-between w-full max-w-5xl items-center">
        <h2 className="text-2xl font-bold text-pink-300">Your Spread, mi amor 🔮</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md text-white"
        >
          Start New Reading 💫
        </button>
      </div>

      {/* Show loading message while fetching card data */}
      {isInitializing && (
        <div className="text-center text-lg text-white/80">
          <p>Papi is consulting the spirits for your reading... ✨</p>
          <LoadingDots />
        </div>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        {cards.map((card, index) => (
          <div
            key={card.id || index}
            onMouseEnter={() => setHoverCardIndex(index)}
            onMouseLeave={() => setHoverCardIndex(null)}
            className="relative"
          >
            <div className="relative">
              <TarotCard
                faceUrl={cardDisplayStates?.[index]?.flipAnimationCompleted ? card.imageUrl : null}
                onFlipEnd={() => handleCardFlipCompleted(index)}
                size={180}
              />
              {/* Show loading dots for cards that are still loading */}
              {cardDisplayStates?.[index]?.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingDots />
                </div>
              )}
            </div>

            {/* Tooltip for past cards */}
            {hoverCardIndex === index &&
              index < activeCardIndex &&
              card.text && (
                <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 bg-black bg-opacity-80 p-4 text-sm rounded-md mt-2 w-64 border border-pink-500 shadow-lg">
                  <ChatBubble id={`hover-${index}`} imageUrl={card.imageUrl || ''} text={card.text} />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* Show chat history for current card */}
      {cards[activeCardIndex]?.text &&
        cardDisplayStates?.[activeCardIndex]?.flipAnimationCompleted && (
          <div className="w-full max-w-xl space-y-4">
            <ChatBubble
              id={cards[activeCardIndex].id}
              imageUrl={cards[activeCardIndex].imageUrl || ''}
              text={cards[activeCardIndex].text}
            />

            {/* Show chat history for this card */}
            {messages
              .filter(msg => msg.cardId === cards[activeCardIndex].id)
              .map((msg, idx) => (
                <ChatBubble
                  key={`${msg.cardId}-${msg.timestamp}`}
                  id={msg.role === 'user' ? 'user' : 'papi'}
                  imageUrl=""
                  text={msg.content}
                />
              ))}

            {isPapiLoading && <p className="text-center text-sm">Papi is conjuring magic… ⏳</p>}

            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-md bg-white text-black placeholder:text-gray-500"
                placeholder="Ask Papi about this card..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button
                onClick={handleAskPapi}
                disabled={isPapiLoading}
                className="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded-md text-white disabled:opacity-50"
              >
                {isPapiLoading ? 'Asking...' : 'Ask Papi 💋'}
              </button>
            </div>
          </div>
        )}

      {/* Next button */}
      {activeCardIndex < spreadSize - 1 &&
        cardDisplayStates?.[activeCardIndex]?.flipAnimationCompleted && (
          <button
            onClick={handleRevealNext}
            className="mt-8 px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold shadow-lg"
          >
            Reveal Next Card 💌
          </button>
        )}
    </div>
  );
}
