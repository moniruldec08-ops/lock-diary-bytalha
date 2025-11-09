// Modern sound effects for app interactions
const SOUND_EFFECTS = {
  entrySaved: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3', // Success chime
  achievement: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c87a63c7fe.mp3', // Victory fanfare
  buttonClick: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718ab41b.mp3', // Subtle click
  milestone: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443e.mp3', // Celebration
  delete: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c3c91e0fe2.mp3', // Whoosh
};

class SoundManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private getAudio(url: string): HTMLAudioElement {
    if (!this.audioCache.has(url)) {
      const audio = new Audio(url);
      audio.volume = 1.0; // Always 100% volume
      this.audioCache.set(url, audio);
    }
    return this.audioCache.get(url)!;
  }

  private play(url: string) {
    try {
      const audio = this.getAudio(url);
      audio.currentTime = 0;
      audio.play().catch(err => console.log('Sound play prevented:', err));
    } catch (error) {
      console.log('Sound error:', error);
    }
  }

  entrySaved() {
    this.play(SOUND_EFFECTS.entrySaved);
  }

  achievement() {
    this.play(SOUND_EFFECTS.achievement);
  }

  buttonClick() {
    this.play(SOUND_EFFECTS.buttonClick);
  }

  milestone() {
    this.play(SOUND_EFFECTS.milestone);
  }

  delete() {
    this.play(SOUND_EFFECTS.delete);
  }
}

export const soundManager = new SoundManager();
