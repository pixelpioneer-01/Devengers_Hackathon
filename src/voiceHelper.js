// ============================
// CivicAI — Voice Helper
// Primary:  Google Cloud Speech-to-Text
// Fallback: Groq Whisper STT
// ============================

let mediaRecorder = null;
let audioChunks = [];

/**
 * Start recording audio from the microphone.
 * @param {string} lang - BCP-47 language tag (e.g. 'en-IN', 'hi-IN')
 * @returns {Promise<boolean>} true if recording started successfully
 */
export async function startRecording(lang = 'en-IN') {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    console.log(`[STT] Recording started (${lang})...`);
    return true;
  } catch (err) {
    console.error('[STT] Failed to start recording:', err);
    return false;
  }
}

/**
 * Stop recording and transcribe audio.
 * Tries Google STT first; falls back to Groq Whisper if Google fails.
 *
 * @param {function} onResult   - called with the transcribed text string
 * @param {function} onEnd      - called on completion or error
 * @param {string}   lang       - BCP-47 language code
 * @param {string}   apiKey     - Groq API key (used for Whisper fallback)
 */
export async function stopRecording(onResult, onEnd, lang = 'en-IN', apiKey) {
  if (!mediaRecorder) return;

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    console.log('[STT] Audio captured:', audioBlob.size, 'bytes');

    let transcript = null;

    // --- Attempt 1: Google Cloud Speech-to-Text ---
    const googleKey = import.meta.env.VITE_GOOGLE_API_KEY || '';
    if (googleKey) {
      try {
        console.log('[STT] Trying Google Cloud Speech-to-Text...');
        transcript = await callGoogleSTT(audioBlob, lang, googleKey);
        console.log(`[STT] Google Transcribed: "${transcript}"`);
      } catch (err) {
        console.warn('[STT] Google STT failed, falling back to Groq Whisper:', err.message);
      }
    }

    // --- Attempt 2: Groq Whisper Fallback ---
    if (!transcript) {
      try {
        console.log('[STT] Trying Groq Whisper STT...');
        transcript = await callWhisper(audioBlob, lang, apiKey);
        console.log(`[STT] Whisper Transcribed: "${transcript}"`);
      } catch (err) {
        console.error('[STT] Groq Whisper also failed:', err.message);
        if (onEnd) onEnd(err.message || 'transcription-failed');
        // Clean up and exit
        mediaRecorder?.stream.getTracks().forEach(track => track.stop());
        mediaRecorder = null;
        audioChunks = [];
        return;
      }
    }

    if (onResult) onResult(transcript);
    if (onEnd) onEnd();

    // Clean up tracks
    mediaRecorder?.stream.getTracks().forEach(track => track.stop());
    mediaRecorder = null;
    audioChunks = [];
  };

  mediaRecorder.stop();
  console.log('[STT] Recording stopped. Processing...');
}

// ============================
// Google Cloud Speech-to-Text
// REST API (no SDK needed)
// ============================
async function callGoogleSTT(blob, lang, googleKey) {
  // Convert audio blob → base64
  const base64Audio = await blobToBase64(blob);

  // Map BCP-47 codes to Google's supported codes
  const languageCode = mapToGoogleLang(lang);

  const requestBody = {
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: languageCode,
      alternativeLanguageCodes: ['hi-IN', 'en-IN'], // allow mixed-language speech
      enableAutomaticPunctuation: true,
      model: 'latest_long',
    },
    audio: {
      content: base64Audio,
    },
  };

  const response = await fetch(
    `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google STT Error: ${response.status}`);
  }

  const data = await response.json();

  // Extract the best transcript
  const transcript = data.results
    ?.map(r => r.alternatives?.[0]?.transcript || '')
    .join(' ')
    .trim();

  if (!transcript) throw new Error('Google STT returned empty transcript');
  return transcript;
}

// ============================
// Groq Whisper STT (Fallback)
// ============================
async function callWhisper(blob, lang, apiKey) {
  const envKey = import.meta.env.VITE_API_KEY || '';
  const keyToUse = apiKey || envKey;
  if (!keyToUse) throw new Error('Groq API key missing');

  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');
  formData.append('model', 'whisper-large-v3');
  formData.append('language', lang.split('-')[0]); // e.g. 'hi', 'en'
  formData.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${keyToUse}` },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Groq Whisper Error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

// ============================
// Utility Helpers
// ============================

/** Convert a Blob to a base64 string (without the data URL prefix) */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Remove "data:audio/webm;base64," prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Map BCP-47 app language codes to Google's supported codes */
function mapToGoogleLang(lang) {
  const mapping = {
    'en-IN': 'en-IN',
    'hi-IN': 'hi-IN',
    'en':    'en-IN',
    'hi':    'hi-IN',
  };
  return mapping[lang] || 'en-IN';
}

// ============================
// Navigation Command Parser
// ============================
export function getNavigationCommand(text) {
  const t = text.toLowerCase();

  const commands = {
    'conflict':   ['conflict', 'mediate', 'dispute', 'विवाद', 'झगड़ा'],
    'policy':     ['policy', 'explain', 'decode', 'नीति'],
    'community':  ['community', 'discuss', 'debate', 'चर्चा'],
    'voter':      ['voter', 'awareness', 'election', 'मतदाता', 'चुनाव'],
    'grassroots': ['grassroots', 'organize', 'plan', 'योजना'],
    'leaders':    ['leader', 'politician', 'near', 'नेता'],
    'schemes':    ['scheme', 'government', 'benefit', 'योजना'],
    'complaint':  ['complaint', 'guide', 'report', 'शिकायत'],
  };

  for (const [id, keywords] of Object.entries(commands)) {
    if (keywords.some(kw => t.includes(kw))) return id;
  }

  return null;
}

// ============================
// TTS Stubs (removed by design)
// ============================
export function speak() {}
export function stopSpeaking() {}
export function unlockAudio() {}
