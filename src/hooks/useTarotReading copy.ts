import { useTarotStore } from '@/stores/useTarotStore';
import { useEffect } from 'react';

export function useTarotReading() {
  const { spread, pushCard } = useTarotStore();

  useEffect(() => {
    const n = spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;

    Array.from({ length: n }).forEach((_, idx) => {
      pushCard({
        id: `FAKE_${idx + 1}`,
        imageUrl: `https://source.unsplash.com/400x640/?tarot,card,${idx}`,
        text: `This is stub text for card ${idx + 1}.`,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  return { isFetching: false };
}
