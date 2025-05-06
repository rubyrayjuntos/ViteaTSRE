// src/components/MusicToggle.tsx
import { useAudio } from "@/components/AudioProvider";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicToggle() {
  const { toggleMusic, musicPlaying } = useAudio();
  return (
    <button
      className="fixed bottom-4 right-4 bg-black/40 backdrop-blur rounded-full p-2 text-white"
      onClick={toggleMusic}
    >
      {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
    </button>
  );
}
