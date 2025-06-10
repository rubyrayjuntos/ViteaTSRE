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
    question
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
    try {
      // Skip if we don't have a valid card index
      if (cardIndex >= cards.length) {
        logger.warn(`Attempted to load data for invalid card index ${cardIndex}`);
        return;
      }

      // Skip if we already have all the data
      if (cards[cardIndex].status.hasLoadedText && 
          cards[cardIndex].status.hasLoadedImage) {
        return;
      }

      logger.debug(`Loading data for card ${cardIndex}`);

      // Set loading state
      if (isMounted.current) {
        updateCardStatus(cardIndex, { isLoading: true });
      }

      // Fetch card text first
      if (!cards[cardIndex].status.hasLoadedText) {
        try {
          const textResponse = await fetchCardText(cardIndex, question);
          logger.debug(`Received text response for card ${cardIndex}:`, textResponse);
          
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
              logger.debug(`Received image URL for card ${cardIndex}:`, imageUrl);
              
              if (!imageUrl) {
                throw new Error('Invalid image URL from server');
              }

              if (isMounted.current) {
                updateCardData(cardIndex, { imageUrl });
              }
            } catch (imageError) {
              logger.error(`Failed to fetch image for card ${cardIndex}:`, imageError);
              if (isMounted.current) {
                setCardError(cardIndex, {
                  type: 'IMAGE_LOAD',
                  message: ERROR_MESSAGES.CARD_LOAD_ERROR,
                  timestamp: Date.now()
                });
              }
              // Don't rethrow - we want to keep the text even if image fails
            }
          }
        } catch (textError) {
          logger.error(`Failed to fetch text for card ${cardIndex}:`, textError);
          if (isMounted.current) {
            setCardError(cardIndex, {
              type: 'TEXT_LOAD',
              message: ERROR_MESSAGES.CARD_LOAD_ERROR,
              timestamp: Date.now()
            });
            // Update loading state to false since we failed
            updateCardStatus(cardIndex, { isLoading: false });
          }
          // Don't throw - let the component handle the error state
        }
      }
    } catch (error) {
      logger.error(`Error loading data for card ${cardIndex}:`, error);
      if (isMounted.current) {
        setCardError(cardIndex, {
          type: 'TEXT_LOAD',
          message: ERROR_MESSAGES.CARD_LOAD_ERROR,
          timestamp: Date.now()
        });
        // Update loading state to false since we failed
        updateCardStatus(cardIndex, { isLoading: false });
      }
    }
  }, [cardIndex, cards, updateCardData, updateCardStatus, setCardError, question]);

  useEffect(() => {
    loadCardData();
  }, [loadCardData]);

  const card = cards[cardIndex];
  return {
    card,
    isLoading: card?.status.isLoading ?? true,
    hasLoadedText: card?.status.hasLoadedText ?? false,
    hasLoadedImage: card?.status.hasLoadedImage ?? false,
    error: card?.status.error
  };
};
