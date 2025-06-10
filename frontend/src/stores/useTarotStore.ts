// /workspaces/ViteaTSRE/src/stores/useTarotStore.ts
import { create } from 'zustand';

export interface DrawnCard {
  id: string;
  text: string;
  imageUrl: string;
}

export interface CardDisplayStatus {
  isLoading: boolean;
  hasLoadedText: boolean;
  hasLoadedImage: boolean;
}

export interface ChatMessage {
  cardId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TarotState {
  question: string;
  spreadSize: number;
  cards: DrawnCard[];
  cardDisplayStates: CardDisplayStatus[];
  messages: ChatMessage[];
  isInitializing: boolean;
  setQuestion: (q: string) => void;
  initializeSpread: (count: number) => void;
  updateCardData: (cardIndex: number, data: Partial<DrawnCard>) => void;
  updateCardDisplayState: (cardIndex: number, data: Partial<CardDisplayStatus>) => void;
  addMessage: (message: ChatMessage) => void;
  reset: () => void;
}

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spreadSize: 0,
  cards: [],
  cardDisplayStates: [],
  messages: [],
  isInitializing: false,

  setQuestion: (q: string) => set({ question: q }),

  initializeSpread: (count: number) =>
    set({
      spreadSize: count,
      cards: Array(count).fill(null).map(() => ({
        id: '',
        text: '',
        imageUrl: ''
      })),
      cardDisplayStates: Array(count).fill(null).map(() => ({
        isLoading: true,
        hasLoadedText: false,
        hasLoadedImage: false
      })),
      isInitializing: true
    }),

  updateCardData: (cardIndex: number, data: Partial<DrawnCard>) =>
    set((state: TarotState) => {
      console.log(`STORE: Updating card data for index ${cardIndex} with:`, data);
      const newCards = [...state.cards];
      const newDisplayStates = [...state.cardDisplayStates];
      
      if (newCards[cardIndex]) {
        // If we have text data from the API response, update the card's text
        if (data.text) {
          newCards[cardIndex] = { ...newCards[cardIndex], text: data.text };
          if (newDisplayStates[cardIndex]) {
            newDisplayStates[cardIndex].hasLoadedText = true;
          }
        }
        
        // If we have image data from the API response, update the card's image URL
        if (data.imageUrl) {
          newCards[cardIndex] = { ...newCards[cardIndex], imageUrl: data.imageUrl };
          if (newDisplayStates[cardIndex]) {
            newDisplayStates[cardIndex].hasLoadedImage = true;
          }
        }

        // If we have an ID from the API response, update the card's ID
        if (data.id) {
          newCards[cardIndex] = { ...newCards[cardIndex], id: data.id };
        }
        
        // Update overall loading state
        if (newDisplayStates[cardIndex]) {
          newDisplayStates[cardIndex].isLoading = 
            !(newDisplayStates[cardIndex].hasLoadedText && 
              newDisplayStates[cardIndex].hasLoadedImage);
        }
      } else {
        console.warn(`STORE: Attempted to update non-existent card at index ${cardIndex}. Current cards count: ${state.cards.length}, Spread size: ${state.spreadSize}`);
      }
      
      // Check if all cards are loaded
      const allCardsLoaded = newDisplayStates.every(state => !state.isLoading);
      
      return { 
        cards: newCards,
        cardDisplayStates: newDisplayStates,
        isInitializing: !allCardsLoaded
      };
    }),

  updateCardDisplayState: (cardIndex: number, data: Partial<CardDisplayStatus>) =>
    set((state: TarotState) => {
      const newDisplayStates = [...state.cardDisplayStates];
      if (newDisplayStates[cardIndex]) {
        newDisplayStates[cardIndex] = { ...newDisplayStates[cardIndex], ...data };
      }
      return { cardDisplayStates: newDisplayStates };
    }),

  addMessage: (message: ChatMessage) =>
    set((state: TarotState) => ({
      messages: [...state.messages, message]
    })),

  reset: () =>
    set({
      question: '',
      spreadSize: 0,
      cards: [],
      cardDisplayStates: [],
      messages: [],
      isInitializing: false
    })
}));