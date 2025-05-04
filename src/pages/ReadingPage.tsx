// src/pages/ReadingPage.tsx
import { useEffect } from 'react';
import { useTarotStore } from '../stores/useTarotStore';
import { useNavigate } from 'react-router-dom';
import TarotCard from '../components/TarotCard';
import LoadingDots from '../components/LoadingDots';
import { useTarotReading } from '../hooks/useTarotReading';
import { motion } from 'framer-motion';
import { useAudio } from '../components/AudioProvider';

export default function ReadingPage() {
  const { question, spread, cards } = useTarotStore();
  const nav = useNavigate();
  const { data, isFetching } = useTarotReading();
  const { play } = useAudio();

  // back‑guard: if no question (direct load), send home
  useEffect(() => {
    if (!question) nav('/');
  }, [question, nav]);

  // play shuffle once at mount
  useEffect(() => play('shuffle'), []);

  const spreadSize = spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-fuchsia-900 to-slate-900 text-amber-100 p-6">
      <h2 className="text-xl mb-4 italic">{question}</h2>

      {/* card table */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: spreadSize }).map((_, idx) => (
          <TarotCard
            key={idx}
            faceUrl={cards[idx]?.imageUrl ?? null}
            onFlipEnd={() => play('flip')}
          />
        ))}
      </div>

      {/* chat bubbles */}
      <div className="mt-8 w-full max-w-lg flex flex-col gap-3">
        {cards.map((c) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800/60 rounded-lg p-4 backdrop-blur"
          >
            <img
              src={c.imageUrl}
              alt={c.id}
              className="w-20 h-32 object-cover float-left mr-3 rounded-md"
            />
            <p className="text-sm whitespace-pre-line">{c.text}</p>
          </motion.div>
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
