import { useMutation } from "@tanstack/react-query";
import { useTarotStore } from "@/stores/useTarotStore";
// Removed unused imports
import { useEffect, useRef, useMemo } from "react";
import { fetchReading } from "@/services/tarotService"; // Adjusted the path to use an alias

export function useTarotReading() {
  const { question, pushCard, spread } = useTarotStore();
  const computedSpreadSize = useMemo(() => {
    return spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;
  }, [spread]);
  const hasRun = useRef(false);

  const mutate = useMutation({
    mutationFn: async () => {
      try {
        const cards = await fetchReading(question, computedSpreadSize);
        cards.forEach(pushCard);
      } catch (error) {
        console.error('Error fetching tarot reading:', error);
      }
    },
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    mutate.mutate();
  }, [mutate]);

  return { isFetching: mutate.status === "pending" };
}
