// src/components/MusicToggle.tsx
import { VolumeX } from "lucide-react";

export default function MusicToggle() {
  return (
    <button
      className="fixed bottom-4 right-4 bg-black/40 backdrop-blur rounded-full p-2 text-white"
    >
      <VolumeX className="w-5 h-5" />
    </button>
  );
}
