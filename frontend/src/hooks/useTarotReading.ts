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

      // Process each card's data (text and image) independently
      const processCard = async (index: number) => {
        console.log(`READING_HOOK: Starting to process card ${index}`);
        
        try {
          const payload: CardRequestPayload = {
            question,
            totalCardsInSpread: computedSpreadSize,
            cardNumberInSpread: index
          };

          // Fetch text and image in parallel for this specific card
          const [textResponse, imageResponse] = await Promise.all([
            fetchCardText(payload).catch(error => {
              console.error(`Error fetching text for card ${index}:`, error);
              errors.push(error);
              return { id: `ERROR_${index}`, text: "Papi couldn't channel the message for this card, mi amor..." };
            }),
            fetchCardImage(payload).catch(error => {
              console.error(`Error fetching image for card ${index}:`, error);
              errors.push(error);
              return { id: `ERROR_${index}`, imageUrl: "" };
            })
          ]);

          // Update the store with this card's data as soon as we have it
          updateCardData(index, {
            id: textResponse.id,
            text: textResponse.text,
            imageUrl: imageResponse.imageUrl
          });

          console.log(`READING_HOOK: Successfully processed card ${index}`);
        } catch (error) {
          console.error(`READING_HOOK: Error processing card ${index}:`, error);
          if (error instanceof Error) errors.push(error);
          updateCardData(index, {
            text: "Ay caramba! Something went wrong with this card...",
            imageUrl: ""
          });
        }
      };

      // Process cards sequentially, but handle each card's text and image in parallel
      for (let i = 0; i < computedSpreadSize; i++) {
        await processCard(i);
      }

      if (errors.length > 0) {
        console.warn(`READING_HOOK: Completed with ${errors.length} errors`);
        // We don't throw here to allow partial success
      }
    }
  });

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    mutation.mutate();
  }, [mutation]);

  return {
    isFetching: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
