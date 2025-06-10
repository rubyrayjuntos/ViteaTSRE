import { CardTextResponse } from '../services/tarotService';

export const mockApiResponses = {
  cardText: {
    id: 'the-fool',
    text: 'The Fool represents new beginnings, innocence, and spontaneity.',
    cards: ['the-fool']
  } as CardTextResponse,
  cardImage: {
    imageUrl: 'https://example.com/tarot/the-fool.jpg'
  }
};

export const mockFetchResponse = <T>(data: T): Promise<T> => {
  return Promise.resolve(data);
};

export const mockFetchError = (message: string): Promise<never> => {
  return Promise.reject(new Error(message));
};

export const mockCard = {
  id: 'the-fool',
  text: 'The Fool represents new beginnings, innocence, and spontaneity.',
  imageUrl: 'https://example.com/tarot/the-fool.jpg',
  status: {
    isLoading: false,
    hasLoadedText: true,
    hasLoadedImage: true,
    error: null
  },
  messages: []
};

export const mockErrorResponse = {
  type: 'TEXT_LOAD',
  message: 'Failed to load card text',
  details: 'API request failed'
}; 