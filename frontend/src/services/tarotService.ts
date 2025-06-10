// /workspaces/ViteaTSRE/src/services/tarotService.ts
/// <reference types="vite/client" />
import { env, ERROR_MESSAGES } from '../env';
import { Card } from '../stores/useTarotStore';

const BACKEND_URL = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:8000';

export interface CardRequestPayload {
  question: string;
  totalCardsInSpread: number;
  cardNumberInSpread: number; // 0-indexed
}

const fetchOptions = {
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  mode: 'cors' as RequestMode,
};

// API Response Types
export interface CardTextResponse {
  id: string;
  text: string;
}

export interface CardImageResponse {
  imageUrl: string;
}

export interface ChatResponse {
  response: string;
}

// Common error handling and request configuration
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

class ApiError extends Error {
  constructor(
    message: string,
    public response?: Response,
    public type: 'TEXT_FETCH_ERROR' | 'IMAGE_FETCH_ERROR' | 'CHAT_FETCH_ERROR' = 'TEXT_FETCH_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async <T>(url: string, options: RequestInit, retries = 3): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: ERROR_MESSAGES.SERVER_ERROR }));
        throw new ApiError(errorData.message || ERROR_MESSAGES.SERVER_ERROR, response);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API call failed (attempt ${i + 1}/${retries}):`, error);
      lastError = error as Error;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i))); // Exponential backoff
      }
    }
  }
  
  throw lastError || new Error(ERROR_MESSAGES.NETWORK_ERROR);
};

// API endpoints
export const fetchCardText = async (cardIndex: number, question: string): Promise<CardTextResponse> => {
  try {
    console.log(`Fetching card text for index ${cardIndex}`);
    return await fetchWithRetry<CardTextResponse>(
      `${env.VITE_BACKEND_URL}/api/reading/text`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardIndex,
          question,
        }),
      }
    );
  } catch (error) {
    console.error('Error fetching card text:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      ERROR_MESSAGES.CARD_LOAD_ERROR,
      undefined,
      'TEXT_FETCH_ERROR'
    );
  }
};

export const fetchCardImage = async (cardId: string): Promise<string> => {
  try {
    console.log(`Fetching card image for ID ${cardId}`);
    const data = await fetchWithRetry<CardImageResponse>(
      `${env.VITE_BACKEND_URL}/api/reading/image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          card: cardId,
        }),
      }
    );
    return data.imageUrl;
  } catch (error) {
    console.error('Error fetching card image:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      ERROR_MESSAGES.CARD_LOAD_ERROR,
      undefined,
      'IMAGE_FETCH_ERROR'
    );
  }
};

export const fetchChatResponse = async (
  cardId: string,
  userMessage: string,
  previousMessages: Array<{ role: string; content: string }>
): Promise<string> => {
  try {
    const data = await fetchWithRetry<ChatResponse>(
      `${env.VITE_BACKEND_URL}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId,
          userMessage,
          previousMessages,
        }),
      }
    );
    return data.response;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch chat response',
      undefined,
      'CHAT_FETCH_ERROR'
    );
  }
};
