// src/components/TarotCard.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  faceUrl: string | null; // null = still face‑down
  onFlipEnd?: () => void;
  size?: number; // px
}

export default function TarotCard({ faceUrl, onFlipEnd, size = 180 }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    if (faceUrl) setFlipped(true);
  };

  return (
    <motion.div
      style={{ width: size, height: size * 1.6 }}
      className="cursor-pointer perspective-1000"
      onClick={handleFlip}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8 }}
        onAnimationComplete={() => flipped && onFlipEnd?.()}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* back */}
        <div className="absolute w-full h-full rounded-lg bg-[url('/img/card-back.png')] bg-cover shadow-xl" />
        {/* front */}
        {faceUrl && (
          <div
            className="absolute w-full h-full rounded-lg shadow-xl"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
            }}
          >
            <img
              src={faceUrl}
              alt="Tarot"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
