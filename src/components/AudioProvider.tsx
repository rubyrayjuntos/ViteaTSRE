// src/components/AudioProvider.tsx
import { PropsWithChildren, useEffect } from "react";
import { useAudioManager } from "@/utils/AudioManager";
import { AudioCtx } from "@/contexts/AudioContext"; // Import context from the new file

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
