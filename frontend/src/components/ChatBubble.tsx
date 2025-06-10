import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  role: 'user' | 'assistant';
  message: string;
}

export const ChatBubble: React.FC<Props> = ({ role, message }) => {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? 'bg-pink-600 text-white'
            : 'bg-white/10 border border-white/20 text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message}</p>
      </div>
    </motion.div>
  );
};
