export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CardError {
  type: 'TEXT_LOAD' | 'IMAGE_LOAD' | 'CHAT';
  message: string;
  timestamp: number;
}

export interface CardStatus {
  isLoading: boolean;
  hasLoadedText: boolean;
  hasLoadedImage: boolean;
  error?: CardError;
}

export interface Card {
  id: string;
  text: string;
  imageUrl: string;
  status: CardStatus;
  messages: Message[];
} 