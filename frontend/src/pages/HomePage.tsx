// src/pages/HomePage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';

import NeonButton from '@/components/NeonButton';
import { useTarotStore } from '@/stores/useTarotStore';

export default function HomePage() {
  /** ------------------------------------------------------------------
   * Zustand store
   * -----------------------------------------------------------------*/
  const {
    question,
    spread,
    setQuestion,
    setSpread,
    reset,
    cards,
  } = useTarotStore();

  /** ------------------------------------------------------------------
   * Animation controls
   * -----------------------------------------------------------------*/
  const rippleControls = useAnimationControls();

  /** ------------------------------------------------------------------
   * Reset only if we have cards (meaning we're coming from a reading)
   * -----------------------------------------------------------------*/
  useEffect(() => {
    if (cards.length > 0) {
      reset();
    }
  }, [cards.length, reset]);

  /** ------------------------------------------------------------------
   * Hooks
   * -----------------------------------------------------------------*/
  const navigate = useNavigate();

  /** ------------------------------------------------------------------
   * Handlers
   * -----------------------------------------------------------------*/
  function handleSubmit() {
    if (!question.trim()) return;
    navigate('/reading');
  }

  /** ------------------------------------------------------------------
   * Render
   * -----------------------------------------------------------------*/
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-950 to-emerald-900 text-yellow-50 px-4">
      {/* SVG Filter Definition */}
      <svg className="hidden">
        <defs>
          <filter id="ripple">
            <feTurbulence 
              type="turbulence" 
              baseFrequency="0.02 0.15" 
              numOctaves="3" 
              result="turbulence" 
            >
              <animate 
                attributeName="baseFrequency" 
                dur="30s" 
                values="0.02 0.15;0.015 0.11;0.02 0.15" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap 
              in2="turbulence" 
              in="SourceGraphic" 
              scale="15" 
              xChannelSelector="R" 
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="grid md:grid-cols-2 gap-10 max-w-6xl">
        {/* Left column: copy & form */}
        <div className="flex flex-col gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-pink-400 text-5xl font-extrabold tracking-tight"
          >
            Cartas del&nbsp;Deseo
          </motion.h1>

          <p className="max-w-md leading-relaxed">
            A Latinx spiritual experience where fate wears lipstick, temptation
            deals the cards, and every question becomes a confession.
          </p>

          <input
            type="text"
            placeholder="What is your burning question?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="w-full px-4 py-3 rounded-md bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-brandPink placeholder:text-slate-400"
          />

          <NeonButton onClick={handleSubmit}>✧ Tempt Fate ✧</NeonButton>

          <div className="pt-4">
            <label className="block pb-1">Choose your spread…</label>
            <select
              value={spread}
              onChange={(e) =>
                setSpread(e.target.value as Parameters<typeof setSpread>[0])
              }
              className="bg-slate-800/50 px-3 py-2 rounded-md"
            >
              <option value="Destiny">Destiny (3 cards)</option>
              <option value="Cruz">Cruz (4 cards)</option>
              <option value="Love">Love (2 cards)</option>
            </select>
          </div>
        </div>

        {/* Right column: hero image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl border-4 border-brandGold shadow-2xl"
        >
          <motion.img
            src="/img/entrance-hero.png"
            alt="Papi Chispa in water"
            className="w-full h-full object-cover transition-all duration-500 hover:[filter:url('#ripple')]"
          />
        </motion.div>
      </div>
    </div>
  );
}
