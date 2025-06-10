import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const loadCardData = async () => {
      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
        console.log('[TarotReading] Already loading card data, skipping');
        return;
      }

      const card = cards[cardIndex];
      if (!card || card.status.hasLoadedText || !question) {
        console.log('[TarotReading] Skipping load - card already loaded or invalid state');
        return;
      }

      try {
        isLoadingRef.current = true;
        console.log(`[TarotReading] Loading data for card ${cardIndex}`);
        
        updateCardStatus(cardIndex, { isLoading: true });
        
        const textResponse = await fetchCardText(cardIndex, question);
        if (!isMounted.current) return;

        if (textResponse.id && textResponse.text) {
          console.log(`[TarotReading] Updating card ${cardIndex} with text`);
          updateCardData(cardIndex, {
            id: textResponse.id,
            text: textResponse.text
          });

          const imageUrl = await fetchCardImage(textResponse.id);
          if (!isMounted.current) return;

          console.log(`[TarotReading] Updating card ${cardIndex} with image`);
          updateCardData(cardIndex, { imageUrl });
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
        isLoadingRef.current = false;
        if (isMounted.current) {
          updateCardStatus(cardIndex, { isLoading: false });
        }
      }
    };

    loadCardData();
  }, [cardIndex, question]); // Only depend on cardIndex and question

  const card = cards[cardIndex];
  return {
    card,
    isLoading: card?.status.isLoading ?? false,
    hasLoadedText: card?.status.hasLoadedText ?? false,
    hasLoadedImage: card?.status.hasLoadedImage ?? false,
    error: card?.status.error
  };
};
