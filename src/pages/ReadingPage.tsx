// src/pages/ReadingPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTarotStore } from '@/stores/useTarotStore';

import TarotCard from '../components/TarotCard';
import LoadingDots from '@/components/LoadingDots';
import { useTarotReading } from '../hooks/useTarotReading';
//import useAudio from '@/components/AudioProvider';
import ChatBubble from '@/components/ChatBubble';

export default function ReadingPage() {
  const { question, spread, cards } = useTarotStore();
  const { isFetching } = useTarotReading();
//const { play } = useAudio('audioContext'); // Pass the required argument to useAudio
  const navigate = useNavigate();

  // Back-guard: if no question (e.g., direct load or refresh), send to home page
  useEffect(() => {
    if (!question) {
      navigate('/');
    }
  }, [question, navigate]);

  // Play shuffle sound once when the component mounts and question is present
  //useEffect(() => {
    //if (!question) return; // Don't play sound if we're about to redirect

    //try {
      //void play('shuffle', 0.5); // call & ignore the return value
    //} catch (err: unknown) {
     // const errorMessage = err instanceof Error ? err.message : String(err);
      //console.error('Error playing shuffle sound:', errorMessage);
    //}
 // }, [play, question]); // Added question to dependencies

  // play shuffle once at mount
  //useEffect(() => play('shuffle'), []);

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
            faceUrl={cards[idx]?.imageUrl ?? null}
            //onFlipEnd={() => void play('flip')}
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
