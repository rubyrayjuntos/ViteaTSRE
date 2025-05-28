// src/components/NeonButton.tsx
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function NeonButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { className, children, ...rest } = props;
  return (
    <motion.button
      whileHover={{ scale: 1.05, boxShadow: '0 0 24px #ff2e88' }}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'px-8 py-3 font-semibold rounded-md text-lg bg-pink-600 text-yellow-100 tracking-wide',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
