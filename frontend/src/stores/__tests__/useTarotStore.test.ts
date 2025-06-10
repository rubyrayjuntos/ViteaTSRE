import { describe, it, expect, beforeEach } from 'vitest';
import { useTarotStore } from '../useTarotStore';
import { mockCard, mockStoreData } from '../../test/utils';

describe('useTarotStore', () => {
  beforeEach(() => {
    const store = useTarotStore.getState();
    store.reset();
  });

  describe('setQuestion', () => {
    it('should update the question', () => {
      const store = useTarotStore.getState();
      store.setQuestion('What does the future hold?');
      const updatedStore = useTarotStore.getState();
      expect(updatedStore.question).toBe('What does the future hold?');
    });
  });

  describe('initializeSpread', () => {
    it('should initialize the spread with correct number of cards', () => {
      const store = useTarotStore.getState();
      store.initializeSpread(3);

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.spreadSize).toBe(3);
      expect(updatedStore.cards).toHaveLength(3);
      expect(updatedStore.isInitializing).toBe(true);
    });

    it('should initialize cards with correct default state', () => {
      const store = useTarotStore.getState();
      store.initializeSpread(1);

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0]).toEqual({
        id: '',
        text: '',
        imageUrl: '',
        status: {
          isLoading: true,
          hasLoadedText: false,
          hasLoadedImage: false,
          error: undefined
        },
        messages: []
      });
    });
  });

  describe('updateCardData', () => {
    beforeEach(() => {
      const store = useTarotStore.getState();
      store.initializeSpread(1);
    });

    it('should update card text and mark as loaded', () => {
      const store = useTarotStore.getState();
      store.updateCardData(0, {
        id: 'the-fool',
        text: 'New beginnings'
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].id).toBe('the-fool');
      expect(updatedStore.cards[0].text).toBe('New beginnings');
      expect(updatedStore.cards[0].status.hasLoadedText).toBe(true);
    });

    it('should update card image and mark as loaded', () => {
      const store = useTarotStore.getState();
      store.updateCardData(0, {
        imageUrl: 'http://example.com/fool.jpg'
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].imageUrl).toBe('http://example.com/fool.jpg');
      expect(updatedStore.cards[0].status.hasLoadedImage).toBe(true);
    });

    it('should update loading state when all data is loaded', () => {
      const store = useTarotStore.getState();

      store.updateCardData(0, {
        id: 'the-fool',
        text: 'New beginnings',
        imageUrl: 'http://example.com/fool.jpg'
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].status.isLoading).toBe(false);
      expect(updatedStore.isInitializing).toBe(false);
    });

    it('should handle invalid card index', () => {
      const store = useTarotStore.getState();
      store.updateCardData(999, { text: 'Invalid' });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.globalError).toBeDefined();
      expect(updatedStore.globalError).toContain('Invalid index');
    });
  });

  describe('updateCardStatus', () => {
    beforeEach(() => {
      const store = useTarotStore.getState();
      store.initializeSpread(1);
    });

    it('should update card status', () => {
      const store = useTarotStore.getState();
      store.updateCardStatus(0, {
        isLoading: false,
        hasLoadedText: true
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].status.isLoading).toBe(false);
      expect(updatedStore.cards[0].status.hasLoadedText).toBe(true);
    });

    it('should handle invalid card index', () => {
      const store = useTarotStore.getState();
      store.updateCardStatus(999, { isLoading: false });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.globalError).toBeDefined();
      expect(updatedStore.globalError).toContain('Invalid index');
    });
  });

  describe('setCardError', () => {
    beforeEach(() => {
      const store = useTarotStore.getState();
      store.initializeSpread(1);
    });

    it('should set card error', () => {
      const store = useTarotStore.getState();
      const error = {
        type: 'TEXT_LOAD' as const,
        message: 'Failed to load',
        timestamp: Date.now()
      };

      store.setCardError(0, error);

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].status.error).toEqual(error);
    });

    it('should handle invalid card index', () => {
      const store = useTarotStore.getState();
      store.setCardError(999, {
        type: 'TEXT_LOAD',
        message: 'Error',
        timestamp: Date.now()
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.globalError).toBeDefined();
      expect(updatedStore.globalError).toContain('Invalid index');
    });
  });

  describe('addMessage', () => {
    beforeEach(() => {
      const store = useTarotStore.getState();
      store.initializeSpread(1);
    });

    it('should add message to card', () => {
      const store = useTarotStore.getState();
      const message = {
        role: 'user' as const,
        content: 'What does this mean?'
      };

      store.addMessage(0, message);

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.cards[0].messages).toHaveLength(1);
      expect(updatedStore.cards[0].messages[0]).toMatchObject(message);
      expect(updatedStore.cards[0].messages[0].timestamp).toBeDefined();
    });

    it('should handle invalid card index', () => {
      const store = useTarotStore.getState();
      store.addMessage(999, {
        role: 'user',
        content: 'Invalid'
      });

      const updatedStore = useTarotStore.getState();
      expect(updatedStore.globalError).toBeDefined();
      expect(updatedStore.globalError).toContain('Invalid index');
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const store = useTarotStore.getState();

      // Set some state
      store.initializeSpread(3);
      store.setQuestion('Test question');
      store.updateCardData(0, mockCard);

      // Reset
      store.reset();

      // Verify reset
      const updatedStore = useTarotStore.getState();
      expect(updatedStore.question).toBe('');
      expect(updatedStore.spreadSize).toBe(0);
      expect(updatedStore.cards).toHaveLength(0);
      expect(updatedStore.isInitializing).toBe(false);
      expect(updatedStore.globalError).toBeUndefined();
    });
  });
}); 