// /workspaces/ViteaTSRE/src/stores/useTarotStore.ts
import { create } from 'zustand';

export interface DrawnCard {
  id: string;           // e.g. "II_High_Priestess"
  imageUrl: string;
  text: string;
}

type SpreadType = 'Destiny' | 'Cruz' | 'Love';


interface TarotState {
  question: string;
  spread: SpreadType;
  cards: DrawnCard[];
  spreadSize: number;
  setQuestion(q: string): void;
  setSpread(s: SpreadType): void;
  initializeSpread(count: number): void;
  updateCardData(cardIndex: number, data: Partial<DrawnCard>): void;
  reset(): void;
}

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spread: 'Destiny',
  cards: [],
  spreadSize: 0,
  setQuestion: (q) => set({ question: q }),
  setSpread: (s) => set({ spread: s }),
  initializeSpread: (count) =>
    set(() => {
      console.log(`STORE: Initializing spread with ${count} cards.`);
      return {
        spreadSize: count, // Ensure spreadSize is set
        cards: Array.from({ length: count }, (_, i) => ({
          id: `PENDING_ID_${i}`,
          imageUrl: '',
          text: '',
        })),
      };
    }),
  updateCardData: (cardIndex: number, data: Partial<DrawnCard>) =>
    set((state) => {
      console.log(`STORE: Updating card data for index ${cardIndex} with:`, data);
      const newCards = [...state.cards];
      if (newCards[cardIndex]) {
        newCards[cardIndex] = { ...newCards[cardIndex], ...data };
      } else {
        console.warn(`STORE: Attempted to update non-existent card at index ${cardIndex}. Current cards count: ${state.cards.length}, Spread size: ${state.spreadSize}`);
      }
      console.log('STORE: New cards state after update:', newCards);
      return { cards: newCards };
    }),
  reset: () => set({ question: '', cards: [], spreadSize: 0 }), // Reset spreadSize too
}));
