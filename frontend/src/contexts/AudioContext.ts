// src/contexts/AudioContext.ts
import { createContext, useContext } from "react";
import { AudioManager } from "@/utils/AudioManager"; // Assuming AudioManager type is needed for context

// Define the context. AudioManager might be null if not yet initialized or if sound is disabled.
export const AudioCtx = createContext<AudioManager | null>(null);

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) {
    throw new Error("useAudio must be used within an AudioProvider. Ensure the component is wrapped in <AudioProvider>.");
  }
  return ctx;
};