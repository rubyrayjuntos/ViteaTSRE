import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchCardText, fetchCardImage, fetchChatResponse } from '../tarotService';
import { mockApiResponses, mockFetchResponse, mockFetchError } from '../../test/utils';

describe('tarotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
global.fetch = vi.fn();
  });

  describe('fetchCardText', () => {
    it('should fetch card text successfully', async () => {
(global.fetch as vi.Mock).mockImplementationOnce(() =>
        mockFetchResponse(mockApiResponses.cardText)
      );

      const result = await fetchCardText(0, 'What lies ahead?');

      expect(result).toEqual(mockApiResponses.cardText);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reading/text'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardIndex: 0,
            question: 'What lies ahead?',
          }),
        })
      );
    });

    it('should retry on network failure', async () => {
      vi.useFakeTimers();
(global.fetch as vi.Mock)
        .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
        .mockImplementationOnce(() => mockFetchResponse(mockApiResponses.cardText));

      const promise = fetchCardText(0, 'What lies ahead?');
vi.advanceTimersByTime(1000);
      const result = await promise;

      expect(result).toEqual(mockApiResponses.cardText);
      expect(global.fetch).toHaveBeenCalledTimes(2);
vi.useRealTimers();
    });

    it('should throw ApiError on persistent failure', async () => {
      vi.useFakeTimers();
(global.fetch as vi.Mock).mockImplementation(() =>
        mockFetchError(500, 'Server error')
      );

      const promise = fetchCardText(0, 'What lies ahead?');
      vi.advanceTimersByTime(3000);
      await expect(promise).rejects.toThrow('Server error');
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
      vi.useRealTimers();
    });
  });

  describe('fetchCardImage', () => {
    it('should fetch card image successfully', async () => {
      (global.fetch as vi.Mock).mockImplementationOnce(() =>
        mockFetchResponse(mockApiResponses.cardImage)
      );

      const result = await fetchCardImage('the-fool');

      expect(result).toBe(mockApiResponses.cardImage.imageUrl);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reading/image'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card: 'the-fool',
          }),
        })
      );
    });

    it('should handle timeout', async () => {
      vi.useFakeTimers();
      (global.fetch as vi.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 31000))
      );

      const promise = fetchCardImage('the-fool');
      vi.advanceTimersByTime(31000);

      await expect(promise).rejects.toThrow('Request timeout');
      vi.useRealTimers();
    });
  });

  describe('fetchChatResponse', () => {
    it('should fetch chat response successfully', async () => {
      (global.fetch as vi.Mock).mockImplementationOnce(() =>
        mockFetchResponse(mockApiResponses.chat)
      );

      const result = await fetchChatResponse(
        'the-fool',
        'What does this mean?',
        [{ role: 'user', content: 'What does this mean?' }]
      );

      expect(result).toBe(mockApiResponses.chat.response);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardId: 'the-fool',
            userMessage: 'What does this mean?',
            previousMessages: [{ role: 'user', content: 'What does this mean?' }],
          }),
        })
      );
    });

    it('should handle invalid response', async () => {
      (global.fetch as vi.Mock).mockImplementationOnce(() =>
        mockFetchResponse({ invalid: 'response' })
      );

      await expect(
        fetchChatResponse('the-fool', 'What does this mean?', [])
      ).rejects.toThrow();
    });
  });
}); 