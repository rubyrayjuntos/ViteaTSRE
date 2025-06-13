export type CardErrorType = 'TEXT_LOAD' | 'IMAGE_LOAD';

export interface CardError {
  type: CardErrorType;
  message: string;
  timestamp: number;
}

export interface CardStatus {
  isLoading: boolean;
  error?: CardError;
}

export interface Card {
  id: string;
  text: string;
  imageUrl: string;
  status: CardStatus;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

export type SpreadType = 'Destiny' | 'Cruz' | 'Love';

export interface TarotState {
  question: string;
  spread: SpreadType;
  spreadSize: number;
  cards: Card[];
  isInitializing: boolean;
  globalError?: string;
} 