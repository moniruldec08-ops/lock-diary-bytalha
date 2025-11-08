import { useEffect, useRef, useState } from 'react';
import { getSetting, setSetting } from '@/lib/db';

export type AmbientSoundType = 'none' | 'rain' | 'ocean' | 'forest';

const SOUND_URLS = {
  rain: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112e4ce.mp3',
  ocean: 'https://cdn.pixabay.com/download/audio/2022/06/07/audio_0a0c266d39.mp3',
  forest: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c610232530.mp3',
};

export function useAmbientSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadSettings();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const loadSettings = async () => {
    const savedSound = (await getSetting('ambientSound')) || 'none';
    const savedVolume = (await getSetting('ambientVolume')) || 0.3;
    setCurrentSound(savedSound);
    setVolume(savedVolume);
  };

  const playSound = async (soundType: AmbientSoundType) => {
    if (soundType === 'none') {
      stopSound();
      setCurrentSound('none');
      await setSetting('ambientSound', 'none');
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(SOUND_URLS[soundType]);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      setCurrentSound(soundType);
      await setSetting('ambientSound', soundType);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const changeVolume = async (newVolume: number) => {
    setVolume(newVolume);
    await setSetting('ambientVolume', newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return {
    currentSound,
    volume,
    isPlaying,
    playSound,
    stopSound,
    changeVolume,
  };
}
