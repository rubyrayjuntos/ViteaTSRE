// /workspaces/ViteaTSRE/src/stores/useTarotStore.ts
import { create } from 'zustand';

export interface DrawnCard {
  id: string;           // e.g. "II_High_Priestess"
  imageUrl: string;
  text: string;
}

type SpreadType = 'Destiny' | 'Cruz' | 'Love';

export interface CardDisplayStatus {
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
  setQuestion(q: string): void;
  setSpread(s: SpreadType): void;
  initializeSpread(count: number): void;
  updateCardDisplayState(index: number, data: Partial<CardDisplayStatus>): void;
  updateCardData(cardIndex: number, data: Partial<DrawnCard>): void;
  reset(): void;
}

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spread: 'Destiny',
  cards: [],
  cardDisplayStates: [],
  spreadSize: 0,
  setQuestion: (q) => set({ question: q }),
  setSpread: (s) => set({ spread: s }),
  initializeSpread: (count) =>
    set(() => {
      console.log(`STORE: Initializing spread with ${count} cards.`);
      return {
        spreadSize: count,
        cards: Array.from({ length: count }, (_, i) => ({
          id: `PENDING_ID_${i}`,
          imageUrl: '',
          text: '',
        })),
        cardDisplayStates: Array.from({ length: count }, () => ({
          hasLoadedText: false,
          hasLoadedImage: false,
          flipAnimationCompleted: false,
          textError: null,
          imageError: null,
        })),
      };
    }), // Added comma here

  updateCardDisplayState: (cardIndex: number, data: Partial<CardDisplayStatus>) =>
    set((state) => {
      const newDisplayStates = [...state.cardDisplayStates];
      if (newDisplayStates[cardIndex]) {
        newDisplayStates[cardIndex] = { ...newDisplayStates[cardIndex], ...data };
      } else {
        // Corrected string interpolation with backticks at both ends
        console.warn(`STORE: Attempted to update non-existent card display state at index ${cardIndex}. Current count: ${state.cardDisplayStates.length}, Spread size: ${state.spreadSize}`);
      }
      return { cardDisplayStates: newDisplayStates };
    }), // Added comma here

  updateCardData: (cardIndex: number, data: Partial<DrawnCard>) =>
    set((state) => {
      console.log(`STORE: Updating card data for index ${cardIndex} with:`, data);
      const newCards = [...state.cards];
      if (newCards[cardIndex]) {
        newCards[cardIndex] = { ...newCards[cardIndex], ...data };
      } else {
        // Corrected string interpolation with backticks at both ends
        console.warn(`STORE: Attempted to update non-existent card at index ${cardIndex}. Current cards count: ${state.cards.length}, Spread size: ${state.spreadSize}`);
      }
      console.log('STORE: New cards state after update:', newCards);
      return { cards: newCards };
    }), // Comma here is correct as 'reset' follows

  reset: () => set({ 
    question: '', 
    cards: [], 
    spreadSize: 0, 
    cardDisplayStates: [] // Ensured cardDisplayStates is also reset
  }),
}));