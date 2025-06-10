import { useEffect, useCallback, useRef } from 'react';
import { fetchCardText, fetchCardImage } from '../services/tarotService';
import { useTarotStore } from '../stores/useTarotStore';
import { logger } from '../services/logService';
import { ERROR_MESSAGES } from '../config/environment';

export const useTarotReading = (cardIndex: number) => {
  const { 
    cards,
    updateCardData,
    updateCardStatus,
    setCardError,
    question,
    isInitializing
  } = useTarotStore();

  // Keep track of mounted state to prevent updates after unmount
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadCardData = useCallback(async () => {
    // Skip if we're not initializing or don't have a valid card index
    if (!isInitializing || cardIndex >= cards.length) {
      return;
    }

    // Skip if we already have all the data for this card
    if (cards[cardIndex].status.hasLoadedText && 
        cards[cardIndex].status.hasLoadedImage) {
      return;
    }

    // Set loading state
    if (isMounted.current) {
      updateCardStatus(cardIndex, { isLoading: true });
    }

    try {
      // Fetch card text first
      if (!cards[cardIndex].status.hasLoadedText) {
        const textResponse = await fetchCardText(cardIndex, question);
        
        if (!textResponse || !textResponse.id || !textResponse.text) {
          throw new Error('Invalid text response from server');
        }

        // Update the card with text and ID if component is still mounted
        if (isMounted.current) {
          updateCardData(cardIndex, {
            text: textResponse.text,
            id: textResponse.id
          });

          // Now fetch the image using the card ID
          try {
            const imageUrl = await fetchCardImage(textResponse.id);
            
            if (!imageUrl) {
              throw new Error('Invalid image URL from server');
            }

            if (isMounted.current) {
              updateCardData(cardIndex, { imageUrl });
            }
          } catch (imageError) {
            console.error(`Failed to fetch image for card ${cardIndex}:`, imageError);
            if (isMounted.current) {
              setCardError(cardIndex, {
                type: 'IMAGE_LOAD',
                message: 'Failed to load card image',
                timestamp: Date.now()
              });
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error loading data for card ${cardIndex}:`, error);
      if (isMounted.current) {
        setCardError(cardIndex, {
          type: 'TEXT_LOAD',
          message: 'Failed to load card text',
          timestamp: Date.now()
        });
        updateCardStatus(cardIndex, { isLoading: false });
      }
    }
  }, [cardIndex, cards, updateCardData, updateCardStatus, setCardError, question, isInitializing]);

  useEffect(() => {
    loadCardData();
  }, [loadCardData]);

  const card = cards[cardIndex];
  return {
    card,
    isLoading: card?.status.isLoading ?? false,
    hasLoadedText: card?.status.hasLoadedText ?? false,
    hasLoadedImage: card?.status.hasLoadedImage ?? false,
    error: card?.status.error
  };
};
