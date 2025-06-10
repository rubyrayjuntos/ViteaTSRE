// /workspaces/ViteaTSRE/src/services/tarotService.ts
/// <reference types="vite/client" />
import { env } from '../env';
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
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new ApiError(
        response.statusText,
        response.status,
        'REQUEST_FAILED'
      );
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', undefined, 'TIMEOUT');
    }

    if (retries > 0 && !(error instanceof ApiError && error.status === 404)) {
      await wait(RETRY_DELAY);
      return fetchWithRetry<T>(url, options, retries - 1);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// API endpoints
export const fetchCardText = async (cardIndex: number, question: string): Promise<CardTextResponse> => {
  try {
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
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch card text',
      undefined,
      'TEXT_FETCH_ERROR'
    );
  }
};

export const fetchCardImage = async (cardId: string): Promise<string> => {
  try {
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
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      'Failed to fetch card image',
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
