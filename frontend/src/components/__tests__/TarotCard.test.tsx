import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TarotCard } from '../TarotCard';
import { mockCard } from '../../test/utils';

describe('TarotCard', () => {
  it('should render loading state', () => {
    render(
      <TarotCard
        card={{
          ...mockCard,
          status: { ...mockCard.status, isLoading: true }
        }}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('should render card image when loaded', () => {
    render(
      <TarotCard
        card={mockCard}
        isActive={false}
        onClick={() => {}}
      />
    );

    const image = screen.getByAltText('the-fool Tarot Card');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockCard.imageUrl);
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(
      <TarotCard
        card={mockCard}
        isActive={false}
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('should show active state styles', () => {
    render(
      <TarotCard
        card={mockCard}
        isActive={true}
        onClick={() => {}}
      />
    );

    const card = screen.getByRole('button');
    expect(card).toHaveClass('ring-2');
    expect(card).toHaveClass('ring-primary');
  });

  it('should render error state', () => {
    render(
      <TarotCard
        card={{
          ...mockCard,
          status: {
            ...mockCard.status,
            error: {
              type: 'IMAGE_LOAD',
              message: 'Failed to load image'
            }
          }
        }}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByText(/Failed to load image/i)).toBeInTheDocument();
  });

  it('should show placeholder when image not loaded', () => {
    render(
      <TarotCard
        card={{
          ...mockCard,
          imageUrl: '',
          status: { ...mockCard.status, hasLoadedImage: false }
        }}
        isActive={false}
        onClick={() => {}}
      />
    );

    expect(screen.getByTestId('card-placeholder')).toBeInTheDocument();
  });
}); 