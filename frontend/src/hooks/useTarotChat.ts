import { useState, useCallback } from 'react';
import { useTarotStore } from '../stores/useTarotStore';
import { fetchChatResponse } from '../services/tarotService';
import type { Message } from '../types';

interface ChatError {
  message: string;
  timestamp: number;
}

export function useTarotChat(cardIndex: number) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | undefined>();
  
  const { cards, addMessage } = useTarotStore();
  const card = cards[cardIndex];

  const sendMessage = useCallback(async (content: string) => {
    if (!card) {
      setError({ message: 'Invalid card index', timestamp: Date.now() });
      return;
    }

    setIsLoading(true);
    setError(undefined);

    // Add user message immediately
    addMessage(cardIndex, {
      role: 'user',
      content,
      timestamp: Date.now()
    });

    try {
      const response = await fetchChatResponse(
        card.id,
        content,
        card.messages
      );

      // Add assistant response
      addMessage(cardIndex, {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to get response',
        timestamp: Date.now()
      });
    } finally {
      setIsLoading(false);
    }
  }, [card, cardIndex, addMessage]);

  return {
    isLoading,
    error,
    sendMessage,
    messages: card?.messages || []
  };
} 