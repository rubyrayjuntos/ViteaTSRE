// src/hooks/useTarotReading.ts
import { useEffect,useRef } from 'react';
import { useTarotStore } from '@/stores/useTarotStore';

/**
 * Stub hook: pushes placeholder cards into the Zustand store once.
 * Replace with real React‑Query + fetch logic when your FastAPI
 * endpoints are ready.
 */
export function useTarotReading() {
  const { spread, pushCard } = useTarotStore();
  const hasRun = useRef(false); 

  useEffect(() => {
    if (hasRun.current) return;   // skip second mount in StrictMode
    hasRun.current = true;

    // determine how many cards based on the selected spread
    const n = spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;

    Array.from({ length: n }).forEach((_, idx) => {
      pushCard({
        id: `FAKE_${idx + 1}`,
        imageUrl: `https://source.unsplash.com/400x640/?tarot,card,${idx}`,
        text: `This is stub text for card ${idx + 1}.`,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spread,pushCard]); // run once on mount

  return { isFetching: false };
}
