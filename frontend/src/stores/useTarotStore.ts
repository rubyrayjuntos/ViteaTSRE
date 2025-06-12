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
  spread: 'Destiny' | 'Cruz' | 'Love';
  cards: Card[];
  isInitializing: boolean;
  globalError?: string;
  setQuestion: (q: string) => void;
  setSpread: (s: 'Destiny' | 'Cruz' | 'Love') => void;
  initializeSpread: (count: number) => void;
  updateCardData: (cardIndex: number, data: Partial<Omit<Card, 'status' | 'messages'>>) => void;
  updateCardStatus: (cardIndex: number, status: Partial<Card['status']>) => void;
  setCardError: (cardIndex: number, error: CardError) => void;
  clearCardError: (cardIndex: number) => void;
  setGlobalError: (error?: string) => void;
  addMessage: (cardIndex: number, message: Omit<ChatMessage, 'timestamp'>) => void;
  reset: () => void;
}

const checkAllCardsLoaded = (cards: Card[]): boolean => {
  return cards.every(card => card.status.hasLoadedText && card.status.hasLoadedImage);
};

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spreadSize: 0,
  spread: 'Destiny',
  cards: [],
  isInitializing: false,
  globalError: undefined,

  setQuestion: (q: string) => {
    console.log('[Store] Setting question:', q);
    set({ question: q });
  },
  
  setSpread: (s: 'Destiny' | 'Cruz' | 'Love') => {
    console.log('[Store] Setting spread:', s);
    set({ spread: s });
  },

  initializeSpread: (count: number) => {
    console.log('[Store] Initializing spread with count:', count);
    set({
      spreadSize: count,
      cards: Array(count).fill(null).map(() => ({
        id: '',
        text: '',
        imageUrl: '',
        status: {
          isLoading: false,
          hasLoadedText: false,
          hasLoadedImage: false,
          error: undefined
        },
        messages: []
      })),
      isInitializing: true,
      globalError: undefined
    });
  },

  updateCardData: (cardIndex: number, data: Partial<Omit<Card, 'status' | 'messages'>>) =>
    set((state: TarotState) => {
      console.log(`[Store] Updating card data for index ${cardIndex}:`, data);
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
        newStatus.isLoading = false;

        // Update the card with new data and status
        newCards[cardIndex] = {
          ...card,
          ...data,
          status: newStatus
        };

        console.log(`[Store] Updated card ${cardIndex}:`, newCards[cardIndex]);
      } else {
        console.error(`[Store] Invalid card index ${cardIndex}`);
        return { globalError: `Failed to update card ${cardIndex}: Invalid index` };
      }
      
      // Check if all cards are loaded
      const allCardsLoaded = checkAllCardsLoaded(newCards);
      console.log('[Store] All cards loaded:', allCardsLoaded);
      
      return { 
        cards: newCards,
        isInitializing: !allCardsLoaded,
        globalError: undefined
      };
    }),

  updateCardStatus: (cardIndex: number, status: Partial<Card['status']>) =>
    set((state: TarotState) => {
      console.log(`[Store] Updating card status for index ${cardIndex}:`, status);
      const newCards = [...state.cards];
      if (cardIndex >= 0 && cardIndex < newCards.length) {
        newCards[cardIndex] = {
          ...newCards[cardIndex],
          status: {
            ...newCards[cardIndex].status,
            ...status
          }
        };

        // Check if all cards are loaded whenever we update status
        const allCardsLoaded = checkAllCardsLoaded(newCards);
        return { 
          cards: newCards, 
          isInitializing: !allCardsLoaded,
          globalError: undefined 
        };
      }
      console.error(`[Store] Failed to update card status ${cardIndex}: Invalid index`);
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
            error: { ...error, timestamp: Date.now() },
            isLoading: false
          }
        };
        return { 
          cards: newCards,
          isInitializing: false // Exit initializing state on error
        };
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
        return { cards: newCards };
      }
      return { globalError: `Failed to add message for card ${cardIndex}: Invalid index` };
    }),

  reset: () => set({
    question: '',
    spreadSize: 0,
    cards: [],
    isInitializing: false,
    globalError: undefined
  })
}));