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
      console.log(`[API] Attempt ${i + 1}/${retries} - Fetching ${url}`, options);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        console.error(`[API] Response not OK: ${response.status} ${response.statusText}`);
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new ApiError(errorData.message || 'Server error', response);
      }
      
      const data = await response.json();
      console.log(`[API] Success - ${url}`, data);
      return data;
    } catch (error) {
      console.error(`[API] Attempt ${i + 1} failed:`, error);
      lastError = error as Error;
      
      if (i < retries - 1) {
        const delay = 1000 * Math.pow(2, i);
        console.log(`[API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Network error');
};

// API endpoints
export const fetchCardText = async (cardIndex: number, question: string): Promise<CardTextResponse> => {
  console.log(`[API] Fetching card text for index ${cardIndex} with question: ${question}`);
  try {
    const response = await fetchWithRetry<CardTextResponse>(
      `${BACKEND_URL}/api/reading/text`,
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
    console.log(`[API] Card text response:`, response);
    return response;
  } catch (error) {
    console.error('[API] Card text fetch error:', error);
    throw error;
  }
};

export const fetchCardImage = async (cardId: string): Promise<string> => {
  console.log(`[API] Fetching card image for ID ${cardId}`);
  try {
    const data = await fetchWithRetry<CardImageResponse>(
      `${BACKEND_URL}/api/reading/image`,
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
    console.log(`[API] Card image response:`, data);
    return data.imageUrl;
  } catch (error) {
    console.error('[API] Card image fetch error:', error);
    throw error;
  }
};

export const fetchChatResponse = async (
  cardId: string,
  userMessage: string,
  previousMessages: Array<{ role: string; content: string }>
): Promise<string> => {
  try {
    const data = await fetchWithRetry<ChatResponse>(
      `${BACKEND_URL}/api/chat`,
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
