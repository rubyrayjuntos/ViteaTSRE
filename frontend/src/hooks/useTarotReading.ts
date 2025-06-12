import { useEffect, useRef, useCallback } from 'react';
import { useTarotStore } from '../stores/useTarotStore';
import { fetchCardText, fetchCardImage } from '../services/tarotService';

interface ApiError {
  message: string;
}

export const useTarotReading = (cardIndex: number) => {
  const { cards, question, updateCardData, updateCardStatus, setCardError } = useTarotStore();
  const isMounted = useRef(true);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadCardData = useCallback(async () => {
    if (isLoadingRef.current) {
      console.log(`[TarotReading] Already loading data for card ${cardIndex}`);
      return;
    }

    isLoadingRef.current = true;
    console.log(`[TarotReading] Loading data for card ${cardIndex}`);

    try {
      // Set loading state
      updateCardStatus(cardIndex, { isLoading: true });

      // Fetch card text
      const textResponse = await fetchCardText(cardIndex, question);
      if (!isMounted.current) return;

      if (textResponse.cards?.[cardIndex]) {
        const cardData = textResponse.cards[cardIndex];
        console.log(`[TarotReading] Received text for card ${cardIndex}:`, cardData);

        // Update card text
        updateCardData(cardIndex, {
          id: cardData.card,
          text: cardData.text
        });

        // Fetch image only if we successfully got text
        try {
          const imageUrl = await fetchCardImage(cardData.card);
          if (!isMounted.current) return;

          console.log(`[TarotReading] Received image for card ${cardIndex}:`, imageUrl);
          updateCardData(cardIndex, { imageUrl });
        } catch (imageError) {
          console.error(`[TarotReading] Error loading image for card ${cardIndex}:`, imageError);
          if (isMounted.current) {
            setCardError(cardIndex, {
              type: 'IMAGE_LOAD',
              message: (imageError as ApiError)?.message || 'Failed to load card image',
              timestamp: Date.now()
            });
          }
        }
      } else {
        throw new Error(`Card data not found in response for index ${cardIndex}`);
      }
    } catch (error) {
      console.error(`[TarotReading] Error loading card ${cardIndex}:`, error);
      if (isMounted.current) {
        setCardError(cardIndex, {
          type: 'TEXT_LOAD',
          message: (error as ApiError)?.message || 'Failed to load card data',
          timestamp: Date.now()
        });
      }
    } finally {
      if (isMounted.current) {
        isLoadingRef.current = false;
      }
    }
  }, [cardIndex, question, updateCardData, updateCardStatus, setCardError]);

  useEffect(() => {
    const card = cards[cardIndex];
    if (!card) {
      console.log(`[TarotReading] No card found at index ${cardIndex}`);
      return;
    }

    if (isLoadingRef.current) {
      console.log(`[TarotReading] Already loading card ${cardIndex}`);
      return;
    }

    if (card.status.hasLoadedText) {
      console.log(`[TarotReading] Card ${cardIndex} already loaded`);
      return;
    }

    if (!question) {
      console.log(`[TarotReading] No question set for card ${cardIndex}`);
      return;
    }

    console.log(`[TarotReading] Starting load for card ${cardIndex}`);
    loadCardData();
  }, [cardIndex, cards, question, loadCardData]);

  const card = cards[cardIndex];
  return {
    card,
    isLoading: card?.status.isLoading ?? false,
    hasLoadedText: card?.status.hasLoadedText ?? false,
    hasLoadedImage: card?.status.hasLoadedImage ?? false,
    error: card?.status.error
  };
};
