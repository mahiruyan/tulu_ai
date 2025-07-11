// ElevenLabs Text-to-Speech Integration
const ELEVENLABS_API_KEY = 'sk_b44d4397ce07949e667b93fc588bfd55d3837c4345e4694e';
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';

// Voice IDs for Turkish-compatible voices
export const VOICE_IDS = {
  turkish_female: 'mohCpqeo3bXb0EzBQ9C3', // Asya Aydın Özkan (Native Turkish Female)
  turkish_male: 'IuRRIAcbQK5AQk1XevPj', // Doga (Native Turkish Male)
  aria: '9BWtsMINqrJLrRacOk9x', // Aria (Multilingual with Turkish support)
  liam: 'TX3LPaxmHKxFdv7VOQHJ' // Liam (Multilingual with Turkish support)
};

export async function generateSpeech(text, voiceId = VOICE_IDS.turkish_female) {
  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData}`);
    }

    // Convert response to blob
    const audioBlob = await response.blob();
    
    // Create blob URL for audio playback
    const audioUrl = URL.createObjectURL(audioBlob);
    
    return audioUrl;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

export function playAudio(audioUrl, onEnded = null) {
  const audio = new Audio(audioUrl);
  
  // Set up event listeners
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl); // Clean up blob URL
    if (onEnded) onEnded();
  });

  audio.addEventListener('error', (e) => {
    console.error('Audio playback error:', e);
    URL.revokeObjectURL(audioUrl);
  });

  // Play the audio
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
    URL.revokeObjectURL(audioUrl);
  });
  
  return audio;
}

// Generate pronunciation practice sentence
export function generatePronunciationSentence(originalResponse) {
  // Extract Turkish words from the response to create a practice sentence
  const turkishWords = originalResponse.match(/[''""]([^''""]*)[''""]|(\b\w+\b)/g);
  
  if (turkishWords && turkishWords.length > 0) {
    // Pick a Turkish word or phrase for pronunciation practice
    const word = turkishWords[0].replace(/['"]/g, '');
    return `Tekrar edin: ${word}. Şimdi deneyin.`; // "Repeat: [word]. Now try it."
  }
  
  // Fallback to a simple Turkish phrase
  return "Merhaba! Türkçe öğrenmeye devam edelim."; // "Hello! Let's continue learning Turkish."
}