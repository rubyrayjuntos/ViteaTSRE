// src/pages/ReadingPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '../stores/useTarotStore';
import { useTarotReading } from '../hooks/useTarotReading';
import { TarotCard } from '../components/TarotCard';
import ChatBubble from '../components/ChatBubble';

export default function ReadingPage() {
  const navigate = useNavigate();
  const {
    cards,
    cardDisplayStates,
    spreadSize,
    updateCardDisplayState,
    question,
    reset,
  } = useTarotStore();

  const { isFetching, isError, error } = useTarotReading();

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
    const card = cards[activeCardIndex];
    if (!card || !card.id || !userInput.trim()) {
      setPapiResponse('Papi needs your words to cast his spell, mi cielo 💫');
      return;
    }

    setIsPapiLoading(true);
    setPapiResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userInput, card_id: card.id }),
      });

      const data = await res.json();
      setPapiResponse(data.text || 'Papi whispered, but no one heard...');
    } catch (err) {
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

  if (isFetching) {
    return <div className="text-center mt-20 text-lg">Papi is shuffling and lighting candles... 🕯️✨</div>;
  }

  if (isError) {
    return <div className="text-red-500 text-center mt-20">Ay, spirits are confused... {error?.message}</div>;
  }

  return (
    <div className="p-6 flex flex-col items-center min-h-screen gap-6 bg-gradient-to-b from-rose-950 via-purple-900 to-black text-white">
      <div className="flex justify-between w-full max-w-5xl items-center">
        <h2 className="text-2xl font-bold text-pink-300">Your Spread, mi amor 🔮</h2>
        <button
          onClick={() => {
            reset();
            navigate('/');
          }}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg shadow-md text-white"
        >
          Start New Reading 💫
        </button>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        {cards.map((card, index) => (
          <div
            key={card.id || index}
            onMouseEnter={() => setHoverCardIndex(index)}
            onMouseLeave={() => setHoverCardIndex(null)}
            className="relative"
          >
            <TarotCard
              faceUrl={cardDisplayStates?.[index]?.flipAnimationCompleted ? card.imageUrl : null}
              onFlipEnd={() => handleCardFlipCompleted(index)}
              size={180}
            />

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

      {/* Current card's text and chat */}
      {cards[activeCardIndex]?.text &&
        cardDisplayStates?.[activeCardIndex]?.flipAnimationCompleted && (
          <div className="w-full max-w-xl space-y-4">
            <ChatBubble
              id={cards[activeCardIndex].id}
              imageUrl={cards[activeCardIndex].imageUrl || ''}
              text={cards[activeCardIndex].text}
            />

            {isPapiLoading && <p className="text-center text-sm">Papi is conjuring magic… ⏳</p>}
            {papiResponse && !isPapiLoading && (
              <ChatBubble id="papi" imageUrl="" text={papiResponse} />
            )}

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
                className="bg-pink-700 hover:bg-pink-800 px-4 py-2 rounded-md text-white"
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
