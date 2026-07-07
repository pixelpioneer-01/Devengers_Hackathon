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
 * Stop recording and transcribe audio using Sarvam AI STT.
 *
 * @param {function} onResult   - called with the transcribed text string
 * @param {function} onEnd      - called on completion or error
 * @param {string}   lang       - BCP-47 language code
 * @param {string}   apiKey     - Sarvam AI API key fallback
 */
export async function stopRecording(onResult, onEnd, lang = 'en-IN', apiKey) {
  if (!mediaRecorder) return;

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    console.log('[STT] Audio captured:', audioBlob.size, 'bytes');

    let transcript = null;

    try {
      console.log('[STT] Trying Sarvam AI STT...');
      transcript = await callSarvamSTT(audioBlob, lang, apiKey);
      console.log(`[STT] Sarvam Transcribed: "${transcript}"`);
    } catch (err) {
      console.error('[STT] Sarvam STT failed:', err.message);
      if (onEnd) onEnd(err.message || 'transcription-failed');
      // Clean up and exit
      mediaRecorder?.stream.getTracks().forEach(track => track.stop());
      mediaRecorder = null;
      audioChunks = [];
      return;
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
// Sarvam AI STT
// ============================
async function callSarvamSTT(blob, lang, apiKey) {
  const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY || '';
  const keyToUse = apiKey || sarvamKey;

  // Convert blob to base64 to send in JSON body
  const base64Audio = await blobToBase64(blob);

  // Normalize language code to BCP-47
  let langCode = lang;
  if (lang === 'hi') langCode = 'hi-IN';
  if (lang === 'en') langCode = 'en-IN';

  // 1. First, try calling the serverless API gateway (best for production/CORS safety)
  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio: base64Audio,
        languageCode: langCode,
        sarvamKey: keyToUse
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.transcript;
    }
    
    if (response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Server Error: ${response.status}`);
    }
  } catch (err) {
    if (err.message && !err.message.includes("404") && !err.message.includes("Failed to fetch")) {
      throw err;
    }
  }

  // 2. Client-side fallback if serverless function not detected (e.g. running locally under npm run dev)
  console.warn("Vercel STT serverless function not detected. Falling back to direct client-side call.");
  if (!keyToUse) throw new Error('Sarvam API key missing');

  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');
  formData.append('model', 'saaras:v3');
  formData.append('language_code', langCode);

  const response = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: { 'api-subscription-key': keyToUse },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.message || `Sarvam STT Error: ${response.status}`);
  }

  const data = await response.json();
  return data.transcript;
}

// ============================
// Utility Helpers
// ============================
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
// Text-to-Speech (TTS) using Sarvam AI
// ============================
let currentAudio = null;

export async function speak(text, lang = 'en-IN') {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Call our serverless API
    const response = await fetch('/api/speak', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        language: lang,
        sarvamKey: import.meta.env.VITE_SARVAM_API_KEY
      }),
    });

    if (!response.ok) {
      throw new Error('TTS Gateway request failed');
    }

    const data = await response.json();
    const base64Audio = data.audio;
    
    currentAudio = new Audio('data:audio/wav;base64,' + base64Audio);
    currentAudio.play();
  } catch (err) {
    console.error('[TTS] speak failed:', err);
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export function unlockAudio() {
  // Web Audio Context unlock helper if needed
}
