// /workspaces/ViteaTSRE/src/stores/useTarotStore.ts
import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CardError {
  type: 'TEXT_LOAD' | 'IMAGE_LOAD' | 'CHAT';
  message: string;
  timestamp: number;
}

export interface Card {
  id: string;
  text: string;
  imageUrl: string;
  status: {
    isLoading: boolean;
    hasLoadedText: boolean;
    hasLoadedImage: boolean;
    error?: CardError;
  };
  messages: ChatMessage[];
}

interface TarotState {
  question: string;
  spreadSize: number;
  cards: Card[];
  isInitializing: boolean;
  globalError?: string;
  setQuestion: (q: string) => void;
  initializeSpread: (count: number) => void;
  updateCardData: (cardIndex: number, data: Partial<Omit<Card, 'status' | 'messages'>>) => void;
  updateCardStatus: (cardIndex: number, status: Partial<Card['status']>) => void;
  setCardError: (cardIndex: number, error: CardError) => void;
  clearCardError: (cardIndex: number) => void;
  setGlobalError: (error?: string) => void;
  addMessage: (cardIndex: number, message: Omit<ChatMessage, 'timestamp'>) => void;
  reset: () => void;
}

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spreadSize: 0,
  cards: [],
  isInitializing: false,
  globalError: undefined,

  setQuestion: (q: string) => set({ question: q }),

  initializeSpread: (count: number) =>
    set({
      spreadSize: count,
      cards: Array(count).fill(null).map(() => ({
        id: '',
        text: '',
        imageUrl: '',
        status: {
          isLoading: true,
          hasLoadedText: false,
          hasLoadedImage: false,
          error: undefined
        },
        messages: []
      })),
      isInitializing: true,
      globalError: undefined
    }),

  updateCardData: (cardIndex: number, data: Partial<Omit<Card, 'status' | 'messages'>>) =>
    set((state: TarotState) => {
      console.log(`STORE: Updating card data for index ${cardIndex} with:`, data);
      const newCards = [...state.cards];
      
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        const card = newCards[cardIndex];
        const newStatus = { ...card.status };

        // Update card data
        if (data.text) {
          newStatus.hasLoadedText = true;
          // Clear any text-related errors when we successfully load text
          if (newStatus.error?.type === 'TEXT_LOAD') {
            newStatus.error = undefined;
          }
        }
        if (data.imageUrl) {
          newStatus.hasLoadedImage = true;
          // Clear any image-related errors when we successfully load image
          if (newStatus.error?.type === 'IMAGE_LOAD') {
            newStatus.error = undefined;
          }
        }
        
        // Update loading state
        newStatus.isLoading = !(newStatus.hasLoadedText && newStatus.hasLoadedImage);

        // Update the card with new data and status
        newCards[cardIndex] = {
          ...card,
          ...data,
          status: newStatus
        };
      } else {
        console.error(`STORE: Invalid card index ${cardIndex}`);
        return { globalError: `Failed to update card ${cardIndex}: Invalid index` };
      }
      
      // Check if all cards are loaded
      const allCardsLoaded = newCards.every(card => !card.status.isLoading);
      
      return { 
        cards: newCards,
        isInitializing: !allCardsLoaded,
        // Clear global error if we successfully updated
        globalError: undefined
      };
    }),

  updateCardStatus: (cardIndex: number, status: Partial<Card['status']>) =>
    set((state: TarotState) => {
      const newCards = [...state.cards];
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          status: {
            ...newCards[cardIndex].status,
            ...status
          }
        };
        return { cards: newCards, globalError: undefined };
      }
      return { globalError: `Failed to update card status ${cardIndex}: Invalid index` };
    }),

  setCardError: (cardIndex: number, error: CardError) =>
    set((state: TarotState) => {
      const newCards = [...state.cards];
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          status: {
            ...newCards[cardIndex].status,
            error: { ...error, timestamp: Date.now() }
          }
        };
        return { cards: newCards };
      }
      return { globalError: `Failed to set error for card ${cardIndex}: Invalid index` };
    }),

  clearCardError: (cardIndex: number) =>
    set((state: TarotState) => {
      const newCards = [...state.cards];
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          status: {
            ...newCards[cardIndex].status,
            error: undefined
          }
        };
        return { cards: newCards };
      }
      return { globalError: `Failed to clear error for card ${cardIndex}: Invalid index` };
    }),

  setGlobalError: (error?: string) => set({ globalError: error }),

  addMessage: (cardIndex: number, message: Omit<ChatMessage, 'timestamp'>) =>
    set((state: TarotState) => {
      const newCards = [...state.cards];
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          messages: [
            ...newCards[cardIndex].messages,
            { ...message, timestamp: Date.now() }
          ]
        };
        return { cards: newCards, globalError: undefined };
      }
      return { globalError: `Failed to add message to card ${cardIndex}: Invalid index` };
    }),

  reset: () =>
    set({
      question: '',
      spreadSize: 0,
      cards: [],
      isInitializing: false,
      globalError: undefined
    })
}));