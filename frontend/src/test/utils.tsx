import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useTarotStore } from '../stores/useTarotStore';
import type { Card } from '../stores/useTarotStore';

// Test wrapper with router
export const TestWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Custom render with wrapper
export const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

// Mock card data
export const mockCard: Card = {
  id: 'the-fool',
  text: 'The Fool represents new beginnings',
  imageUrl: 'http://example.com/fool.jpg',
  status: {
    isLoading: false,
    hasLoadedText: true,
    hasLoadedImage: true,
  },
  messages: [],
};

// Mock store data
export const mockStoreData = {
  question: 'What lies ahead?',
  spreadSize: 3,
  cards: [mockCard],
  isInitializing: false,
  globalError: undefined,
};

// Reset store to initial state
export const resetStore = () => {
  const store = useTarotStore.getState();
  store.reset();
};

// Mock API responses
export const mockApiResponses = {
  cardText: {
    id: 'the-fool',
    text: 'The Fool represents new beginnings',
  },
  cardImage: {
    imageUrl: 'http://example.com/fool.jpg',
  },
  chat: {
    response: 'This card suggests a fresh start',
  },
};

// Mock fetch responses
export const mockFetchResponse = (data: unknown) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  }) as Promise<Response>;
};

// Mock fetch error
export const mockFetchError = (status = 500, statusText = 'Internal Server Error') => {
  return Promise.resolve({
    ok: false,
    status,
    statusText,
  }) as Promise<Response>;
}; 