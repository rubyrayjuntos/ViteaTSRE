// src/components/AudioProvider.tsx
import { createContext, useContext, PropsWithChildren } from 'react';
import { Howl } from 'howler';

interface AudioApi {
  play(name: 'click' | 'flip' | 'shuffle'): void;
}

const AudioCtx = createContext<AudioApi | null>(null);

export default function AudioProvider({ children }: PropsWithChildren) {
  const sounds = {
    click: new Howl({ src: ['/sfx/click.mp3'] }),
    flip: new Howl({ src: ['/sfx/flip.mp3'] }),
    shuffle: new Howl({ src: ['/sfx/shuffle.mp3'] }),
  };

  const api: AudioApi = { play: (n) => sounds[n].play() };

  return <AudioCtx.Provider value={api}>{children}</AudioCtx.Provider>;
}

export const useAudio = () => {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio outside provider');
  return ctx;
};
