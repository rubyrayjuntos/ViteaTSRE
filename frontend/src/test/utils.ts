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

export const mockFetchResponse = <T>(data: T) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(data),
  } as Response);

export const mockFetchError = (
  status = 500,
  statusText = 'Internal Server Error'
): Promise<Response> =>
  Promise.resolve({
    ok: false,
    status,
    statusText,
    json: () => Promise.resolve({ message: statusText }),
  } as Response);

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
