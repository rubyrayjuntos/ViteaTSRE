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
  setQuestion(q: string): void;
  setSpread(s: SpreadType): void;
  pushCard(c: DrawnCard): void;
  reset(): void;
}

export const useTarotStore = create<TarotState>((set) => ({
  question: '',
  spread: 'Destiny',
  cards: [],
  setQuestion: (q) => set({ question: q }),
  setSpread: (s) => set({ spread: s }),
  pushCard: (c) => set((st) => ({ cards: [...st.cards, c] })),
  reset: () => set({ question: '', cards: [] }),
}));
