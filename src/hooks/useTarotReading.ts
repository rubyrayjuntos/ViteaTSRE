// src/hooks/useTarotReading.ts
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTarotStore } from '../stores/useTarotStore';
import { drawCardChat, drawCardImage, speakReading } from '../api';
import { useEffect } from 'react';

export function useTarotReading() {
  const { question, spread, pushCard } = useTarotStore();
  const qc = useQueryClient();

  const mutate = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/spread', {
        method: 'POST',
        body: JSON.stringify({ question, spread }),
      });
      const ids: string[] = await res.json(); // ['II_High_Priestess', ...]
      for (const id of ids) {
        const [text, imageUrl] = await Promise.all([
          drawCardChat(id, question),
          drawCardImage(id),
        ]);
        pushCard({ id, text, imageUrl });
        await speakReading(text); // async voice
      }
    },
  });

  // fire once at mount
  useEffect(() => {
    mutate.mutate();
  }, []);

  return { isFetching: mutate.isLoading, data: null };
}
