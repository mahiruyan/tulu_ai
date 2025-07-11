import { useState, useCallback, useRef } from 'react';
import { generateSpeech, playAudio, VOICE_IDS } from './elevenLabsTTS';

export function useTTS() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentAudioRef = useRef(null);

  const speak = useCallback(async (text, voiceId = VOICE_IDS.turkish_female) => {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Stop current audio if playing
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      const audioUrl = await generateSpeech(text, voiceId);
      const audio = playAudio(audioUrl, () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      });
      
      currentAudioRef.current = audio;
      setIsPlaying(true);
      
      return audio;
    } catch (err) {
      setError(err.message);
      console.error('TTS Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsPlaying(false);
      currentAudioRef.current = null;
    }
  }, []);

  return {
    speak,
    stop,
    isLoading,
    error,
    isPlaying
  };
}