// src/components/LoadingDots.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15,
          }}
          className="w-3 h-3 bg-pink-500 rounded-full"
        />
      ))}
    </div>
  );
};

