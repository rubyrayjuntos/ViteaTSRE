// src/stores/useTarotStore.ts
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
  spreadSize: 0, // Default value for spreadSize
  setQuestion: (q) => set({ question: q }),
  setSpread: (s) => set({ spread: s }),
  initializeSpread: (count) => set(() => ({
    cards: Array.from({ length: count }, (_, i) => ({
      id: `PENDING_ID_${i}`, // Temporary ID, will be overwritten
      imageUrl: '',          // Placeholder
      text: '',              // Placeholder
    })),
  })),
  updateCardData: (cardIndex, data) => set((state) => {
    const newCards = [...state.cards];
    if (newCards[cardIndex]) {
      newCards[cardIndex] = { ...newCards[cardIndex], ...data };
    }
    return { cards: newCards };
  }),
  reset: () => set({ question: '', cards: [] }),
}));
