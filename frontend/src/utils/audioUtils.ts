import { Howl, Howler } from "howler";

// Add shared constants or functions here
// Example:
// export const someSharedFunction = () => { ... };

type SfxKey = "click" | "success" | "error";

const soundEffects: Record<SfxKey, Howl> = {
  click: new Howl({ src: ["/sounds/click.mp3"] }),
  success: new Howl({ src: ["/sounds/success.mp3"] }),
  error: new Howl({ src: ["/sounds/error.mp3"] }),
};

let backgroundMusic: Howl | null = null;
let isPlaying = false;

export const playSfx = (name: SfxKey) => {
  try {
    soundEffects[name]?.play();
  } catch (error) {
    console.error(`Failed to play sound effect "${name}":`, error);
  }
};

export const toggleBgMusic = () => {
  try {
    if (!backgroundMusic) {
      backgroundMusic = new Howl({
        src: ["/music/background.mp3"],
        loop: true,
        volume: 0.5,
      });
    }

    if (isPlaying) {
      backgroundMusic.pause();
      isPlaying = false;
    } else {
      backgroundMusic.play();
      isPlaying = true;
    }
  } catch (error) {
    console.error("Failed to toggle background music:", error);
  }
};

export const setVolume = (volume: number) => {
  try {
    Howler.volume(volume); // Set global volume
  } catch (error) {
    console.error("Failed to set volume:", error);
  }
};

export const isMusicPlaying = () => isPlaying;

interface AudioApi {
  play: (name: SfxKey) => void;
  toggleMusic: () => void;
  readonly musicPlaying: boolean;
  setVolume: (volume: number) => void;
}

export const initializeAudioApi = (): AudioApi => ({
  play: (name: SfxKey) => playSfx(name),
  toggleMusic: () => toggleBgMusic(),
  get musicPlaying() {
    return isMusicPlaying();
  },
  setVolume: (volume: number) => setVolume(volume),
});

export const cleanupAudioApi = () => {
  try {
    if (backgroundMusic) {
      backgroundMusic.stop();
      backgroundMusic = null;
    }
    Howler.unload(); // Unload all audio resources
  } catch (error) {
    console.error("Failed to cleanup audio resources:", error);
  }
};
