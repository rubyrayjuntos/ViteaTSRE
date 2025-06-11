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
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    console.log(`[TarotReading] Loading data for card ${cardIndex}`);

    updateCardStatus(cardIndex, { isLoading: true });

    try {
      const textResponse = await fetchCardText(cardIndex, question);
      if (!isMounted.current) return;

      if (textResponse.cards && textResponse.cards[cardIndex]) {
        const cardData = textResponse.cards[cardIndex];
        console.log(`[TarotReading] Updating card ${cardIndex} with text`);
        updateCardData(cardIndex, {
          id: cardData.card,
          text: cardData.text
        });

        const imageUrl = await fetchCardImage(cardData.card);
        if (!isMounted.current) return;

        console.log(`[TarotReading] Updating card ${cardIndex} with image`);
        updateCardData(cardIndex, { imageUrl });
      } else {
        throw new Error('Card data not found in response');
      }
    } catch (error) {
      console.error(`[TarotReading] Error loading card ${cardIndex}:`, error);
      if (isMounted.current) {
        setCardError(cardIndex, {
          type: 'TEXT_LOAD',
          message: (error as ApiError)?.message || 'Failed to load card data',
          timestamp: Date.now()
        });
        updateCardStatus(cardIndex, { isLoading: false });
      }
    } finally {
      if (isMounted.current) {
        updateCardStatus(cardIndex, { 
          isLoading: false,
          hasLoadedText: true // Ensure we mark text as loaded even if image fails
        });
      }
      isLoadingRef.current = false;
    }
  }, [cardIndex, question, updateCardData, updateCardStatus, setCardError]);

  useEffect(() => {
    const card = cards[cardIndex];

    if (!card || isLoadingRef.current || card.status.hasLoadedText || !question) {
      console.log('[TarotReading] Skipping load - card missing or already loaded');
      return;
    }

    loadCardData();
  }, [cardIndex, question, cards, loadCardData]);

  const card = cards[cardIndex];
  return {
    card,
    isLoading: card?.status.isLoading ?? false,
    hasLoadedText: card?.status.hasLoadedText ?? false,
    hasLoadedImage: card?.status.hasLoadedImage ?? false,
    error: card?.status.error
  };
};
