// src/components/TarotCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LoadingDots } from './LoadingDots';
import type { DrawnCard } from '../stores/useTarotStore';

interface Props {
  card: DrawnCard;
  isLoading: boolean;
  hasLoadedText: boolean;
  hasLoadedImage: boolean;
}

export const TarotCard: React.FC<Props> = ({
  card,
  isLoading,
  hasLoadedText,
  hasLoadedImage,
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative bg-black/30 rounded-lg overflow-hidden aspect-[2/3] min-h-[400px]"
    >
      {hasLoadedImage ? (
        <img
          src={card.imageUrl}
          alt={card.id}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingDots />
        </div>
      )}

      {hasLoadedText && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
          <p className="text-white text-sm">{card.text}</p>
        </div>
      )}
    </motion.div>
  );
};
