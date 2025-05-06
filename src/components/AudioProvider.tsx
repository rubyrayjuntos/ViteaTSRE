// src/components/AudioProvider.tsx
import { createContext, useContext, PropsWithChildren, useRef } from "react";
import { Howl } from "howler";

interface AudioApi {
  play(name: SfxKey): void;
  toggleMusic(): void;
  musicPlaying: boolean;
}
type SfxKey = "click" | "flip" | "shuffle";

const AudioCtx = createContext<AudioApi | null>(null);

export default function AudioProvider({ children }: PropsWithChildren) {
  const bgMusic = useRef(
    new Howl({
      src: ["/audio/ambient-loop.mp3"],
      loop: true,
      volume: 0.3, // nice and low
    })
  ).current;

  const sfx: Record<SfxKey, Howl> = {
    click: new Howl({ src: ["/audio/click.mp3"] }),
    flip: new Howl({ src: ["/audio/flip.mp3"] }),
    shuffle: new Howl({ src: ["/audio/shuffle.mp3"] }),
  };

  const api = {
    play: (n: SfxKey) => void sfx[n].play(),
    toggleMusic: () =>
      bgMusic.playing() ? bgMusic.fade(0.3, 0, 400).once("fade", () => bgMusic.pause())
                        : (bgMusic.volume(0), bgMusic.play(), bgMusic.fade(0, 0.3, 400)),
    get musicPlaying() {
      return bgMusic.playing();
    },
  };

  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>;
}
export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio outside provider");
  return ctx;
};
