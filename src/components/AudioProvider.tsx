// src/components/AudioProvider.tsx
import { createContext, useContext, PropsWithChildren, useEffect } from "react";
import { AudioManager, useAudioManager } from "@/utils/AudioManager"; // Import hook for audioManager

const AudioCtx = createContext<AudioManager | null>(null);

export default function AudioProvider({ children }: PropsWithChildren) {
  const audioManager = useAudioManager(); // Use the custom hook for audioManager

  useEffect(() => {
    // Cleanup audio resources when the component unmounts
    return () => {
      audioManager.cleanup();
    };
  }, [audioManager]);

  return <AudioCtx.Provider value={audioManager}>{children}</AudioCtx.Provider>;
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within an AudioProvider");
  return ctx;
};
