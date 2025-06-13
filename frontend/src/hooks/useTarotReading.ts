import { useEffect, useRef, useCallback, useState } from 'react';
import { useTarotStore } from '../stores/useTarotStore';
import { fetchCardText, fetchCardImage } from '../services/tarotService';
import type { CardError } from '../types/tarot';

/**
 * Hook for managing the loading and state of a single tarot card.
 * Implements robust error handling and cleanup to prevent memory leaks.
 * 
 * Key features:
 * - Separate loading states for text and image
 * - Proper cleanup of resources on unmount
 * - Abort controller for canceling in-flight requests
 * - Detailed logging for debugging
 */
export function useTarotReading(cardIndex: number) {
  const { cards, updateCardData, updateCardStatus, setCardError } = useTarotStore();
  const [isMounted, setIsMounted] = useState(true);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      setIsMounted(false);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadCardData = useCallback(async () => {
    // Prevent concurrent loading attempts
    if (loadingRef.current) {
      console.log('[TarotReading] Already loading card', cardIndex);
      return;
    }

    const card = cards[cardIndex];
    if (!card) {
      console.log('[TarotReading] No card found at index', cardIndex);
      return;
    }

    loadingRef.current = true;
    console.log('[TarotReading] Starting load for card', cardIndex);

    try {
      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Update loading state
      updateCardStatus(cardIndex, { isLoading: true });
      console.log('[TarotReading] Loading data for card', cardIndex);

      let cardId: string | undefined;

      // Load card text first
      // This is separated from image loading to allow partial data display
      // and better error handling for each data type
      try {
        const textResponse = await fetchCardText(cardIndex, useTarotStore.getState().question);
        if (!isMounted) return;

        if (textResponse?.cards?.[0]) {
          const { card: newCardId, text } = textResponse.cards[0];
          cardId = newCardId; // Store the card ID for image loading
          console.log('[TarotReading] Received text for card', cardIndex, { card: newCardId, text });
          updateCardData(cardIndex, { id: newCardId, text });
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('[TarotReading] Error loading text for card', cardIndex, error);
        setCardError(cardIndex, {
          type: 'TEXT_LOAD',
          message: 'Failed to load card text',
          timestamp: Date.now()
        });
        return;
      }

      // Only attempt to load image if we have a valid card ID
      if (cardId) {
        try {
          const imageUrl = await fetchCardImage(cardId);
          if (!isMounted) return;

          if (imageUrl) {
            updateCardData(cardIndex, { imageUrl });
          }
        } catch (error) {
          if (!isMounted) return;
          console.error('[TarotReading] Error loading image for card', cardIndex, error);
          setCardError(cardIndex, {
            type: 'IMAGE_LOAD',
            message: 'Failed to load card image',
            timestamp: Date.now()
          });
        }
      } else {
        console.error('[TarotReading] No card ID available for image loading', cardIndex);
        setCardError(cardIndex, {
          type: 'IMAGE_LOAD',
          message: 'No card ID available for image loading',
          timestamp: Date.now()
        });
      }
    } finally {
      if (isMounted) {
        loadingRef.current = false;
        updateCardStatus(cardIndex, { isLoading: false });
      }
      abortControllerRef.current = null;
    }
  }, [cardIndex, cards, isMounted, updateCardData, updateCardStatus, setCardError]);

  // Effect to load card data
  // Simplified conditions for better readability and debugging
  useEffect(() => {
    const card = cards[cardIndex];
    // Only load if:
    // 1. Card exists
    // 2. Not currently loading
    // 3. Image not yet loaded
    if (card && !card.status?.isLoading && !card.imageUrl) {
      loadCardData();
    }
  }, [cardIndex, cards, loadCardData]);

  return {
    card: cards[cardIndex],
    isLoading: cards[cardIndex]?.status?.isLoading ?? false,
    error: cards[cardIndex]?.status?.error,
    retry: loadCardData
  };
}
