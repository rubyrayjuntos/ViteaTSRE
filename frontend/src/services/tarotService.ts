// /workspaces/ViteaTSRE/src/services/tarotService.ts
/// <reference types="vite/client" />
import { type DrawnCard } from "@/stores/useTarotStore";
import { env } from '../env';

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

export interface CardTextResponse {
  id: string;
  text: string;
}

export const fetchCardText = async (cardIndex: number, question: string): Promise<CardTextResponse> => {
  const response = await fetch(`${env.VITE_BACKEND_URL}/api/reading/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cardIndex,
      question,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch card text: ${response.statusText}`);
  }

  return response.json();
};

export const fetchCardImage = async (cardId: string): Promise<string> => {
  const response = await fetch(`${env.VITE_BACKEND_URL}/api/reading/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card: cardId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch card image: ${response.statusText}`);
  }

  const data = await response.json();
  return data.imageUrl;
};
