// src/pages/ReadingPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '@/stores/useTarotStore';

import TarotCard from '../components/TarotCard';
import LoadingDots from '@/components/LoadingDots';
import { useTarotReading } from '../hooks/useTarotReading';
import ChatBubble from '@/components/ChatBubble';

export default function ReadingPage() {
  const { question, spread, cards } = useTarotStore();
  const { isFetching } = useTarotReading();
  const navigate = useNavigate();

  // Back-guard: if no question (e.g., direct load or refresh), send to home page
  useEffect(() => {
    if (!question) {
      navigate('/');
    }
  }, [question, navigate]);

  const spreadSize = spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;

  return (
    // If there's no question, we'll be navigating away, so render minimally or nothing.
    // Or, you could show a loading state until navigation completes.
    // For simplicity, this example relies on the quick navigation.
    // If question is briefly null then populated, this might cause a flicker.
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
      <h2 className="text-xl mb-4 italic">{question}</h2>

      {/* card table */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: spreadSize }).map((_, idx) => (
          <TarotCard
            key={idx}
            faceUrl={cards[idx]?.imageUrl ?? null} // Flip when imageUrl is ready
          />
        ))}
      </div>

      {/* chat bubbles */}
      <div className="mt-8 w-full max-w-lg flex flex-col gap-3">
        {cards.map((c) => (
          <ChatBubble
            key={c.id}
            id={c.id}
            imageUrl={c.imageUrl}
            text={c.text}
          />
        ))}

        {isFetching && (
          <div className="self-center py-4">
            <LoadingDots />
          </div>
        )}
      </div>
    </div>
  );
}
