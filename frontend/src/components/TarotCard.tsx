// src/components/TarotCard.tsx
import React from 'react';
import { LoadingDots } from './LoadingDots';
import { Card } from '../types';

interface Props {
  card: Card;
  isActive: boolean;
  onClick: () => void;
}

export const TarotCard: React.FC<Props> = ({
  card,
  isActive,
  onClick
}) => {
  const { status, imageUrl, id } = card;

  return (
    <button
      onClick={onClick}
      className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${
        isActive ? 'scale-105 ring-2 ring-primary' : 'hover:scale-102'
      }`}
      data-testid="card"
      aria-label={`${id} Tarot Card`}
    >
      {status.isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-background/80"
          data-testid="loading-indicator"
        >
          <LoadingDots />
        </div>
      )}

      {status.error && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-destructive/10 text-destructive p-4 text-center"
          data-testid="error-message"
        >
          {status.error.message}
        </div>
      )}

      {!status.hasLoadedImage && !status.isLoading && (
        <div 
          className="absolute inset-0 bg-muted flex items-center justify-center"
          data-testid="card-placeholder"
        >
          <span className="text-muted-foreground">Loading card...</span>
        </div>
      )}

      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${id} Tarot Card`}
          className="w-full h-full object-cover"
          data-testid="card-image"
        />
      )}
    </button>
  );
};
