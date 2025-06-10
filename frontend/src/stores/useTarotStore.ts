// /workspaces/ViteaTSRE/src/stores/useTarotStore.ts
import { create, StateCreator } from 'zustand';

export interface DrawnCard {
  id: string;           // e.g. "II_High_Priestess"
  imageUrl: string;
  text: string;
}

type SpreadType = 'Destiny' | 'Cruz' | 'Love';

export interface CardDisplayStatus {
  isLoading: boolean;
  hasLoadedText: boolean;
  hasLoadedImage: boolean;
  flipAnimationCompleted: boolean;
  textError?: string | null;
  imageError?: string | null;
}

interface TarotState {
  question: string;
  spread: SpreadType;
  cards: DrawnCard[];
  spreadSize: number;
  cardDisplayStates: CardDisplayStatus[];
  isInitializing: boolean;
  setQuestion(q: string): void;
  setSpread(s: SpreadType): void;
  initializeSpread(count: number): void;
  updateCardDisplayState(index: number, data: Partial<CardDisplayStatus>): void;
  updateCardData(cardIndex: number, data: Partial<DrawnCard>): void;
  setInitializing(state: boolean): void;
  reset(): void;
}

type TarotStateCreator = StateCreator<TarotState>;

export const useTarotStore = create<TarotState>((set: TarotStateCreator) => ({
  question: '',
  spread: 'Destiny',
  cards: [],
  cardDisplayStates: [],
  spreadSize: 0,
  isInitializing: false,

  setQuestion: (q: string) => set({ question: q }),
  setSpread: (s: SpreadType) => set({ spread: s }),

  setInitializing: (state: boolean) => set({ isInitializing: state }),

  initializeSpread: (count: number) =>
    set(() => {
      console.log(`STORE: Initializing spread with ${count} cards.`);
      return {
        spreadSize: count,
        isInitializing: true,
        cards: Array.from({ length: count }, (_, i) => ({
          id: `PENDING_ID_${i}`,
          imageUrl: '',
          text: '',
        })),
        cardDisplayStates: Array.from({ length: count }, () => ({
          isLoading: true,
          hasLoadedText: false,
          hasLoadedImage: false,
          flipAnimationCompleted: false,
          textError: null,
          imageError: null,
        })),
      };
    }),

  updateCardDisplayState: (cardIndex: number, data: Partial<CardDisplayStatus>) =>
    set((state: TarotState) => {
      const newDisplayStates = [...state.cardDisplayStates];
      if (newDisplayStates[cardIndex]) {
        newDisplayStates[cardIndex] = { ...newDisplayStates[cardIndex], ...data };
        
        // If both text and image are loaded, mark the card as not loading
        if (data.hasLoadedText || data.hasLoadedImage) {
          const currentState = newDisplayStates[cardIndex];
          if (currentState.hasLoadedText && currentState.hasLoadedImage) {
            currentState.isLoading = false;
          }
        }
      } else {
        console.warn(`STORE: Attempted to update non-existent card display state at index ${cardIndex}. Current count: ${state.cardDisplayStates.length}, Spread size: ${state.spreadSize}`);
      }
      
      // Check if all cards are loaded to update isInitializing
      const allCardsLoaded = newDisplayStates.every(state => !state.isLoading);
      return { 
        cardDisplayStates: newDisplayStates,
        isInitializing: !allCardsLoaded
      };
    }),

  updateCardData: (cardIndex: number, data: Partial<DrawnCard>) =>
    set((state: TarotState) => {
      console.log(`STORE: Updating card data for index ${cardIndex} with:`, data);
      const newCards = [...state.cards];
      const newDisplayStates = [...state.cardDisplayStates];
      
      if (newCards[cardIndex]) {
        newCards[cardIndex] = { ...newCards[cardIndex], ...data };
        
        // Update loading states based on what data was received
        if (newDisplayStates[cardIndex]) {
          if (data.text) {
            newDisplayStates[cardIndex].hasLoadedText = true;
          }
          if (data.imageUrl) {
            newDisplayStates[cardIndex].hasLoadedImage = true;
          }
          
          // Update overall loading state
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

  reset: () => set({ 
    question: '', 
    cards: [], 
    spreadSize: 0, 
    cardDisplayStates: [],
    isInitializing: false
  }),
}));