import type { DrawnCard } from '@/stores/useTarotStore';
import type { ChatMessage } from '@/stores/useChatStore';

const BACKEND_URL = ((import.meta as any).env?.VITE_BACKEND_URL as string) || 'http://localhost:8000';

interface ChatRequest {
  question: string;
  currentCard: DrawnCard;
  previousCards: DrawnCard[];
  chatHistory: ChatMessage[];
}

export async function sendChatMessage(request: ChatRequest): Promise<string> {
  console.log('CHAT_SERVICE: Sending chat request with context:', {
    question: request.question,
    currentCardId: request.currentCard.id,
    previousCardCount: request.previousCards.length,
    historyMessageCount: request.chatHistory.length
  });

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        question: request.question,
        current_card_id: request.currentCard.id,
        previous_cards: request.previousCards.map(card => ({
          id: card.id,
          text: card.text
        })),
        chat_history: request.chatHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          card_id: msg.cardId
        }))
      }),
    });

    console.log('CHAT_SERVICE: Chat response status:', response.status, response.statusText);
    const responseBodyText = await response.text();
    console.log('CHAT_SERVICE: Chat raw response body:', responseBodyText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseBodyText);
      } catch (e) {
        errorData = { message: responseBodyText || response.statusText };
      }
      console.error('CHAT_SERVICE: Error in chat response:', errorData);
      throw new Error(errorData.message || `Chat request failed with status ${response.status}`);
    }

    const data = JSON.parse(responseBodyText);
    console.log('CHAT_SERVICE: Chat parsed response:', data);
    return data.text || 'No response received from Papi';
  } catch (error) {
    console.error('CHAT_SERVICE: Error in chat request:', error);
    throw error;
  }
} 