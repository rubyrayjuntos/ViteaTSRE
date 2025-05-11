import { useMemo } from "react";
import { Howl, Howler } from "howler";

export class AudioManager {
  private soundEffects: Record<string, Howl>;
  private backgroundMusic: Howl | null;
  private isMusicPlaying: boolean;

  constructor() {
    this.soundEffects = {};
    this.backgroundMusic = null;
    this.isMusicPlaying = false;
  }

  registerSfx(name: string, src: string) {
    this.soundEffects[name] = new Howl({ src: [src] });
  }

  registerBgMusic(src: string) {
    this.backgroundMusic = new Howl({
      src: [src],
      loop: true,
      volume: 0.5,
    });
  }

  playSfx(name: string) {
    try {
      this.soundEffects[name]?.play();
    } catch (error) {
      console.error(`Failed to play sound effect "${name}":`, error);
    }
  }

  toggleBgMusic() {
    try {
      if (!this.backgroundMusic) {
        console.error("No background music registered.");
        return;
      }

      if (this.isMusicPlaying) {
        this.backgroundMusic.pause();
        this.isMusicPlaying = false;
      } else {
        this.backgroundMusic.play();
        this.isMusicPlaying = true;
      }
    } catch (error) {
      console.error("Failed to toggle background music:", error);
    }
  }

  setVolume(volume: number) {
    try {
      Howler.volume(volume); // Set global volume
    } catch (error) {
      console.error("Failed to set volume:", error);
    }
  }

  cleanup() {
    try {
      if (this.backgroundMusic) {
        this.backgroundMusic.stop();
        this.backgroundMusic = null;
      }
      Howler.unload(); // Unload all audio resources
    } catch (error) {
      console.error("Failed to cleanup audio resources:", error);
    }
  }
}

export const useAudioManager = () => {
  return useMemo(() => {
    const audioManager = new AudioManager();
    // Register default sound effects and background music
    audioManager.registerSfx("click", "/sounds/click.mp3");
    audioManager.registerSfx("success", "/sounds/success.mp3");
    audioManager.registerSfx("error", "/sounds/error.mp3");
    audioManager.registerBgMusic("/music/background.mp3");
    return audioManager;
  }, []);
};
