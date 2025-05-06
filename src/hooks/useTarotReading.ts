import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useTarotStore } from "@/stores/useTarotStore";
import { drawCardChat, drawCardImage } from "@/api";
import { useEffect, useRef } from "react";

export function useTarotReading() {
  const { question, spread, pushCard } = useTarotStore();
  const qc = useQueryClient();
  const hasRun = useRef(false);

  const mutate = useMutation({
    mutationFn: async () => {
      const n = spread === "Destiny" ? 3 : spread === "Cruz" ? 4 : 2;
  
      for (let idx = 0; idx < n; idx++) {
        const cardId = `CARD_${idx + 1}`;
  
        // wait for this card’s data before moving on
        const [text, imageUrl] = await Promise.all([
          drawCardChat(cardId, question),
          drawCardImage(idx + 1),
        ]);
  
        pushCard({ id: cardId, text, imageUrl });
  
        // optional dramatic pause between flips
        await new Promise((r) => setTimeout(r, 600));
      }
    },
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    mutate.mutate();
  }, []);

  return { isFetching: mutate.status === "pending" };
}
