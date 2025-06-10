import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTarotChat } from '../useTarotChat';
import { useTarotStore } from '../../stores/useTarotStore';
import * as tarotService from '../../services/tarotService';
import { mockCard } from '../../test/utils';

vi.mock('../../services/tarotService', () => ({
  fetchChatResponse: vi.fn(),
}));

describe('useTarotChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = useTarotStore.getState();
    store.reset();
    store.initializeSpread(1);
    store.updateCardData(0, mockCard);
  });

  it('should send message and receive response', async () => {
    vi.mocked(tarotService.fetchChatResponse).mockResolvedValueOnce(
      'This card suggests new opportunities ahead.'
    );

    const { result } = renderHook(() => useTarotChat(0));

    // Send message
    result.current.sendMessage('What does this card mean?');

    // Check loading state
    expect(result.current.isLoading).toBe(true);

    // Wait for response
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify messages in store
    const store = useTarotStore.getState();
    expect(store.cards[0].messages).toHaveLength(2);
    expect(store.cards[0].messages[0]).toMatchObject({
      role: 'user',
      content: 'What does this card mean?'
    });
    expect(store.cards[0].messages[1]).toMatchObject({
      role: 'assistant',
      content: 'This card suggests new opportunities ahead.'
    });
  });

  it('should handle chat errors gracefully', async () => {
    vi.mocked(tarotService.fetchChatResponse).mockRejectedValueOnce(
      new Error('Failed to get response')
    );

    const { result } = renderHook(() => useTarotChat(0));

    // Send message
    result.current.sendMessage('What does this card mean?');

    // Wait for error state
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });

    // User message should still be added
    const store = useTarotStore.getState();
    expect(store.cards[0].messages).toHaveLength(1);
    expect(store.cards[0].messages[0].role).toBe('user');
  });

  it('should maintain chat history', async () => {
    vi.mocked(tarotService.fetchChatResponse)
      .mockResolvedValueOnce('First response')
      .mockResolvedValueOnce('Second response');

    const { result } = renderHook(() => useTarotChat(0));

    // First message
    result.current.sendMessage('First question');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Second message
    result.current.sendMessage('Second question');
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify chat history
    const store = useTarotStore.getState();
    expect(store.cards[0].messages).toHaveLength(4);
    expect(store.cards[0].messages.map(m => m.role)).toEqual([
      'user', 'assistant', 'user', 'assistant'
    ]);
  });

  it('should cleanup pending requests on unmount', () => {
    const { unmount } = renderHook(() => useTarotChat(0));

    // Start a long-running request
    vi.mocked(tarotService.fetchChatResponse).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    result.current.sendMessage('Question');
    unmount();

    // Verify cleanup
    expect(result.current.isLoading).toBe(false);
    expect(tarotService.fetchChatResponse).toHaveBeenCalled();
  });
}); 