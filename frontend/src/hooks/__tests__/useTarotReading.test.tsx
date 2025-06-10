import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTarotReading } from '../useTarotReading';
import { useTarotStore } from '../../stores/useTarotStore';
import { mockApiResponses, mockFetchResponse, mockFetchError } from '../../test/utils';
import * as tarotService from '../../services/tarotService';

// Mock the tarot service
vi.mock('../../services/tarotService', () => ({
  fetchCardText: vi.fn(),
  fetchCardImage: vi.fn(),
}));

describe('useTarotReading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = useTarotStore.getState();
    store.reset();
    store.initializeSpread(3);
    store.setQuestion('What lies ahead?');
  });

  it('should load card data successfully', async () => {
    // Mock successful API responses
    vi.mocked(tarotService.fetchCardText).mockResolvedValueOnce(mockApiResponses.cardText);
    vi.mocked(tarotService.fetchCardImage).mockResolvedValueOnce(mockApiResponses.cardImage.imageUrl);

    const { result } = renderHook(() => useTarotReading(0));

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.hasLoadedText).toBe(false);
    expect(result.current.hasLoadedImage).toBe(false);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.hasLoadedText).toBe(true);
      expect(result.current.hasLoadedImage).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    // Verify card data
    expect(result.current.card.id).toBe(mockApiResponses.cardText.id);
    expect(result.current.card.text).toBe(mockApiResponses.cardText.text);
    expect(result.current.card.imageUrl).toBe(mockApiResponses.cardImage.imageUrl);
  });

  it('should handle text loading failure', async () => {
    // Mock text loading failure
    vi.mocked(tarotService.fetchCardText).mockRejectedValueOnce(new Error('Failed to load text'));

    const { result } = renderHook(() => useTarotReading(0));

    await waitFor(() => {
      expect(result.current.error?.type).toBe('TEXT_LOAD');
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasLoadedText).toBe(false);
    expect(result.current.hasLoadedImage).toBe(false);
  });

  it('should handle image loading failure gracefully', async () => {
    // Mock text success but image failure
    vi.mocked(tarotService.fetchCardText).mockResolvedValueOnce(mockApiResponses.cardText);
    vi.mocked(tarotService.fetchCardImage).mockRejectedValueOnce(new Error('Failed to load image'));

    const { result } = renderHook(() => useTarotReading(0));

    await waitFor(() => {
      expect(result.current.hasLoadedText).toBe(true);
      expect(result.current.error?.type).toBe('IMAGE_LOAD');
    });

    // Text should still be loaded
    expect(result.current.card.text).toBe(mockApiResponses.cardText.text);
    expect(result.current.hasLoadedImage).toBe(false);
  });

  it('should not load data for invalid card index', async () => {
    const { result } = renderHook(() => useTarotReading(999));

    // Should not attempt to load data
    expect(tarotService.fetchCardText).not.toHaveBeenCalled();
    expect(tarotService.fetchCardImage).not.toHaveBeenCalled();

    // Should return undefined card
    expect(result.current.card).toBeUndefined();
  });

  it('should not reload data if already loaded', async () => {
    // First load
    vi.mocked(tarotService.fetchCardText).mockResolvedValueOnce(mockApiResponses.cardText);
    vi.mocked(tarotService.fetchCardImage).mockResolvedValueOnce(mockApiResponses.cardImage.imageUrl);

    const { result, rerender } = renderHook(() => useTarotReading(0));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.hasLoadedText).toBe(true);
      expect(result.current.hasLoadedImage).toBe(true);
    });

    // Clear mocks and rerender
    vi.clearAllMocks();
    rerender();

    // Should not call APIs again
    expect(tarotService.fetchCardText).not.toHaveBeenCalled();
    expect(tarotService.fetchCardImage).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', async () => {
    const { unmount } = renderHook(() => useTarotReading(0));

    // Start loading
    vi.mocked(tarotService.fetchCardText).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    // Unmount before loading completes
    unmount();

    // Wait for potential updates
    await waitFor(() => {
      const store = useTarotStore.getState();
      expect(store.cards[0].status.isLoading).toBe(true);
      expect(store.cards[0].status.hasLoadedText).toBe(false);
    });
  });
}); 