import { create } from 'zustand';
import type { DrawnCard } from './useTarotStore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  cardId: string;
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'timestamp'>) => void;
  getMessagesForCard: (cardId: string) => ChatMessage[];
  getAllMessages: () => ChatMessage[];
  reset: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, timestamp: Date.now() }]
  })),

  getMessagesForCard: (cardId) => {
    return get().messages.filter(msg => msg.cardId === cardId);
  },

  getAllMessages: () => {
    return get().messages;
  },

  reset: () => set({ messages: [] })
})); 