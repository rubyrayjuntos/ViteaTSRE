import { useEffect } from 'react';
import { fetchCardText, fetchCardImage } from '../services/tarotService';
import { useTarotStore } from '../stores/useTarotStore';

export const useTarotReading = (cardIndex: number) => {
  const { 
    cards,
    cardDisplayStates,
    updateCardData,
    question
  } = useTarotStore();

  useEffect(() => {
    const loadCardData = async () => {
      try {
        // Skip if we don't have a valid card index
        if (cardIndex >= cards.length) {
          console.warn(`Attempted to load data for invalid card index ${cardIndex}`);
          return;
        }

        // Skip if we already have all the data
        if (cardDisplayStates[cardIndex]?.hasLoadedText && 
            cardDisplayStates[cardIndex]?.hasLoadedImage) {
          return;
        }

        console.log(`Loading data for card ${cardIndex}`);

        // Fetch card text first
        if (!cardDisplayStates[cardIndex]?.hasLoadedText) {
          try {
            const textResponse = await fetchCardText(cardIndex, question);
            console.log(`Received text response for card ${cardIndex}:`, textResponse);
            
            // Update the card with text and ID
            updateCardData(cardIndex, {
              text: textResponse.text,
              id: textResponse.id
            });

            // Now fetch the image using the card ID
            try {
              const imageUrl = await fetchCardImage(textResponse.id);
              console.log(`Received image URL for card ${cardIndex}:`, imageUrl);
              updateCardData(cardIndex, { imageUrl });
            } catch (imageError) {
              console.error(`Failed to fetch image for card ${cardIndex}:`, imageError);
              // Don't rethrow - we want to keep the text even if image fails
            }
          } catch (textError) {
            console.error(`Failed to fetch text for card ${cardIndex}:`, textError);
            throw textError; // Rethrow as this is a critical error
          }
        }
      } catch (error) {
        console.error(`Error loading data for card ${cardIndex}:`, error);
        // Could update store with error state here if needed
      }
    };

    loadCardData();
  }, [cardIndex, cards.length, cardDisplayStates, updateCardData, question]);

  return {
    card: cards[cardIndex],
    isLoading: cardDisplayStates[cardIndex]?.isLoading ?? true,
    hasLoadedText: cardDisplayStates[cardIndex]?.hasLoadedText ?? false,
    hasLoadedImage: cardDisplayStates[cardIndex]?.hasLoadedImage ?? false
  };
};
