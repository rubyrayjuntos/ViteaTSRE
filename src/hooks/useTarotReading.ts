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
        const [text, imageUrl] = await Promise.all([
          drawCardChat(cardId, question),
          drawCardImage(cardId), // still returns placeholder for now
        ]);
        pushCard({ id: cardId, text, imageUrl });
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
