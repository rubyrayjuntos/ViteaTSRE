import { useMutation } from "@tanstack/react-query";
import { useTarotStore } from "@/stores/useTarotStore";
// Removed unused imports
import { useEffect, useRef, useMemo } from "react";
import { fetchCardText, fetchCardImage, type CardRequestPayload } from "@/services/tarotService";

export function useTarotReading() {
  const { question, spread, initializeSpread, updateCardData } = useTarotStore();
  const computedSpreadSize = useMemo(() => {
    return spread === 'Destiny' ? 3 : spread === 'Cruz' ? 4 : 2;
  }, [spread]);
  const hasRun = useRef(false);

  const mutation = useMutation({
    mutationFn: async () => {
      initializeSpread(computedSpreadSize); // Create placeholder cards in the store

      const errors: Error[] = [];

      // --- Process Text Sequentially ---
      const processAllText = async () => {
        for (let i = 0; i < computedSpreadSize; i++) {
          try {
            const payload: CardRequestPayload = { question, totalCardsInSpread: computedSpreadSize, cardNumberInSpread: i };
            const { id: cardId, text } = await fetchCardText(payload);
            updateCardData(i, { id: cardId, text });
          } catch (error) {
            console.error(`Error fetching text for card index ${i}:`, error);
            updateCardData(i, { text: "Papi Chispa is having trouble hearing the spirits for this one, mi amor..." });
            if (error instanceof Error) errors.push(error);
          }
        }
      };

      // --- Process Images Sequentially ---
      const processAllImages = async () => {
        for (let i = 0; i < computedSpreadSize; i++) {
          try {
            const payload: CardRequestPayload = { question, totalCardsInSpread: computedSpreadSize, cardNumberInSpread: i };
            const { id: cardId, imageUrl } = await fetchCardImage(payload);
            // If cardId from image differs from text, text's ID might be preferred or needs reconciliation.
            // For now, we assume it's consistent or text sets it definitively.
            updateCardData(i, { id: cardId, imageUrl });
          } catch (error) {
            console.error(`Error fetching image for card index ${i}:`, error);
            updateCardData(i, { imageUrl: "" }); // Show placeholder/broken image
            if (error instanceof Error) errors.push(error);
          }
        }
      };

      try {
        // Run text and image processing sequences in parallel to each other.
        // Each sequence (text, image) processes its items (card 0, 1, 2...) sequentially internally.
        await Promise.all([processAllText(), processAllImages()]);

        if (errors.length > 0) {
          // If any individual fetch failed but was handled, we might still want to
          // mark the overall mutation as partially failed or log a summary.
          // For React Query to consider this an 'error' state, we need to throw.
          throw new Error(`One or more card data fetches failed. Collected ${errors.length} errors.`);
        }
      } catch (error) {
        console.error('Overall error during card data fetching:', error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    mutation.mutate();
  }, [mutation]); // Ensure mutation object is in dependency array

  return {
    isFetching: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
