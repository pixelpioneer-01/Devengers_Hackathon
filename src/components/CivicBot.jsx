import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Mic, MicOff, Send, Bot, Volume2, VolumeX, RefreshCw } from 'lucide-react';

// ── Module routing map ──────────────────────────────────────────────────────
const MODULES = {
  conflict:   { label: 'Conflict Mediator',     emoji: '⚖️',  desc: 'Resolve disputes fairly' },
  policy:     { label: 'Policy Explainer',      emoji: '📜',  desc: 'Understand laws & policies' },
  voter:      { label: 'Voter Awareness',       emoji: '🗳️',  desc: 'Know your voting rights' },
  community:  { label: 'Discussion Hub',        emoji: '👥',  desc: 'Community opinions & debate' },
  grassroots: { label: 'Grassroots Organizer',  emoji: '📣',  desc: 'Organize local movements' },
  leaders:    { label: 'Nearby Leaders',        emoji: '🏛️',  desc: 'Find your local MLA/MP' },
  schemes:    { label: 'Government Schemes',    emoji: '📋',  desc: 'Benefits & schemes for you' },
  complaint:  { label: 'Complaint Guide',       emoji: '📝',  desc: 'File RTI & complaints' },
};

const LANG_NAMES = {
  'en-IN': 'English', 'hi-IN': 'Hindi', 'mr-IN': 'Marathi',
  'bn-IN': 'Bengali', 'te-IN': 'Telugu', 'ta-IN': 'Tamil',
  'kn-IN': 'Kannada', 'gu-IN': 'Gujarati',
};

const GREETINGS = {
  'en-IN': "Hello! I'm CivicBot 🤖 How can I help you today? Tell me your problem and I'll guide you to the right tool.",
  'hi-IN': "नमस्ते! मैं CivicBot हूँ 🤖 आज मैं आपकी कैसे मदद कर सकता हूँ? अपनी समस्या बताएं, मैं सही टूल तक पहुँचाऊँगा।",
  'mr-IN': "नमस्कार! मी CivicBot आहे 🤖 आज मी तुमची कशी मदत करू शकतो? तुमची समस्या सांगा.",
  'bn-IN': "নমস্কার! আমি CivicBot 🤖 আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনার সমস্যা বলুন।",
  'te-IN': "నమస్కారం! నేను CivicBot 🤖 ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను? మీ సమస్య చెప్పండి.",
  'ta-IN': "வணக்கம்! நான் CivicBot 🤖 இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? உங்கள் பிரச்சனை சொல்லுங்கள்.",
  'kn-IN': "ನಮಸ್ಕಾರ! ನಾನು CivicBot 🤖 ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನಿಮ್ಮ ಸಮಸ್ಯೆ ಹೇಳಿ.",
  'gu-IN': "નમસ્તે! હું CivicBot છું 🤖 આજે હું તમારી કેવી રીતે મદદ કરી શકું? તમારી સમસ્યા જણાવો.",
};

// ── Sarvam TTS helper ───────────────────────────────────────────────────────
async function speakWithSarvam(text, language) {
  const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY;
  if (!sarvamKey) return;
  try {
    const langCode = language?.split('-')[0] || 'en';
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-subscription-key': sarvamKey },
      body: JSON.stringify({
        inputs: [text.slice(0, 500)],
        target_language_code: language || 'en-IN',
        speaker: 'meera',
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 8000,
        enable_preprocessing: true,
        model: 'bulbul:v1',
      }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const b64 = data.audios?.[0];
    if (!b64) return;
    const audio = new Audio(`data:audio/wav;base64,${b64}`);
    audio.play();
  } catch (e) {
    console.warn('[CivicBot TTS] Sarvam TTS error:', e.message);
  }
}

// ── Sarvam STT helper ───────────────────────────────────────────────────────
let mediaRecorder = null;
let audioChunks = [];

async function startSTT() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
  mediaRecorder.start();
}

async function stopSTT(language) {
  return new Promise((resolve, reject) => {
    if (!mediaRecorder) return reject('No recorder');
    mediaRecorder.onstop = async () => {
      try {
        const blob = new Blob(audioChunks, { type: 'audio/webm' });
        const base64 = await new Promise((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });

        const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY;
        if (!sarvamKey) { resolve(''); return; }

        const sttRes = await fetch('https://api.sarvam.ai/speech-to-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-subscription-key': sarvamKey },
          body: JSON.stringify({
            model: 'saaras:v3',
            audio: base64,
            language_code: language || 'hi-IN',
          }),
        });

        if (!sttRes.ok) { resolve(''); return; }
        const sttData = await sttRes.json();
        resolve(sttData.transcript || '');
      } catch (err) {
        reject(err.message);
      }
    };
    mediaRecorder.stop();
    mediaRecorder.stream?.getTracks().forEach(t => t.stop());
  });
}

// ── Main CivicBot Component ─────────────────────────────────────────────────
export default function CivicBot({ language, onNavigate, showToast }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const chatEndRef = useRef(null);
  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY;
  const langName = LANG_NAMES[language] || 'English';

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with greeting when first opened
  useEffect(() => {
    if (open && !initialized) {
      const greeting = GREETINGS[language] || GREETINGS['en-IN'];
      setMessages([{ role: 'assistant', content: greeting }]);
      setInitialized(true);
      if (ttsEnabled) speakWithSarvam(greeting, language);
    }
  }, [open, initialized, language, ttsEnabled]);

  // Reset when language changes
  useEffect(() => {
    setInitialized(false);
    setMessages([]);
  }, [language]);

  const SYSTEM_PROMPT = `You are CivicBot, a friendly AI assistant for CivicAI — an Indian civic engagement platform. You speak ONLY in ${langName}.

Your job is to understand the user's civic problem and recommend the right tool from this list:
- conflict: For disputes, arguments, land conflicts, neighborhood issues
- policy: For understanding laws, government policies, bills, regulations
- voter: For voting rights, election info, voter ID, how to vote
- community: For sharing opinions, public debates, civic discussions
- grassroots: For organizing local campaigns, petitions, community action
- leaders: For finding local MLA/MP, knowing your elected representatives
- schemes: For government benefits, subsidies, welfare schemes (PMAY, PM-KISAN, etc.)
- complaint: For filing RTI, complaints against officials, consumer complaints

IMPORTANT RULES:
1. Always respond in ${langName} language only.
2. First understand the user's problem, then recommend the best module.
3. When recommending a module, end your message with exactly: [NAVIGATE:module_id] — for example [NAVIGATE:schemes] or [NAVIGATE:complaint]
4. Be warm, empathetic, and use simple language suitable for all citizens.
5. If the user says thank you or their problem is solved, wish them well without navigating.
6. Keep responses concise (under 100 words).`;

  const sendMessage = async (userMsg) => {
    const msg = userMsg || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (!openAIKey) throw new Error('OpenAI API key not configured');

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openAIKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 200,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
      const data = await res.json();
      let reply = data.choices?.[0]?.message?.content || 'I could not understand. Please try again.';

      // Check for navigation command
      const navMatch = reply.match(/\[NAVIGATE:(\w+)\]/);
      if (navMatch) {
        const moduleId = navMatch[1];
        reply = reply.replace(/\[NAVIGATE:\w+\]/, '').trim();
        if (MODULES[moduleId]) {
          reply += `\n\n${MODULES[moduleId].emoji} **Opening ${MODULES[moduleId].label}...**`;
          setTimeout(() => {
            onNavigate(moduleId);
            setOpen(false);
          }, 1500);
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (ttsEnabled) speakWithSarvam(reply.replace(/\*\*/g, '').replace(/\[.*?\]/g, ''), language);
    } catch (err) {
      const errMsg = `Sorry, something went wrong: ${err.message}`;
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    }
    setLoading(false);
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      try {
        const transcript = await stopSTT(language);
        if (transcript) {
          setInput(transcript);
          await sendMessage(transcript);
        } else {
          showToast?.('Could not hear clearly. Please try again.', 'error');
        }
      } catch (err) {
        showToast?.(err, 'error');
      }
    } else {
      try {
        await startSTT();
        setListening(true);
      } catch {
        showToast?.('Microphone access denied.', 'error');
      }
    }
  };

  const quickOptions = [
    { text: language === 'hi-IN' ? 'सरकारी योजनाएं' : language === 'mr-IN' ? 'सरकारी योजना' : 'Government Schemes', module: 'schemes' },
    { text: language === 'hi-IN' ? 'शिकायत दर्ज करें' : language === 'mr-IN' ? 'तक्रार करा' : 'File a Complaint', module: 'complaint' },
    { text: language === 'hi-IN' ? 'अपना नेता खोजें' : language === 'mr-IN' ? 'नेता शोधा' : 'Find My Leader', module: 'leaders' },
    { text: language === 'hi-IN' ? 'नीति समझाएं' : language === 'mr-IN' ? 'धोरण समजा' : 'Explain a Policy', module: 'policy' },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[1000] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center text-white"
        style={{ background: 'linear-gradient(135deg, #1B3A4B, #2d6a8f)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? {} : { boxShadow: ['0 4px 24px rgba(27,58,75,0.5)', '0 4px 40px rgba(200,168,75,0.6)', '0 4px 24px rgba(27,58,75,0.5)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={24} /></motion.div>
            : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="flex flex-col items-center gap-0.5">
                <Bot size={22} />
                <span className="text-[8px] font-black uppercase tracking-wider">AI</span>
              </motion.div>
          }
        </AnimatePresence>
        {!open && (
          <motion.span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white"
            style={{ background: '#C8A84B' }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            AI
          </motion.span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-[999] w-96 max-w-[calc(100vw-1.5rem)] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(27,58,75,0.1)',
              maxHeight: '75vh',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1B3A4B, #2d5a6e)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.15)' }}>🤖</div>
                <div>
                  <p className="text-white font-black text-sm">CivicBot</p>
                  <p className="text-white/60 text-xs">Speaking in {langName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTtsEnabled(t => !t)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: ttsEnabled ? 'rgba(200,168,75,0.3)' : 'rgba(255,255,255,0.1)' }}
                  title={ttsEnabled ? 'Mute voice' : 'Enable voice'}
                >
                  {ttsEnabled ? <Volume2 size={14} className="text-[#C8A84B]" /> : <VolumeX size={14} className="text-white/40" />}
                </button>
                <button
                  onClick={() => { setMessages([]); setInitialized(false); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                  title="Restart conversation"
                >
                  <RefreshCw size={14} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px', maxHeight: '40vh' }}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mr-2 mt-0.5" style={{ background: '#1B3A4B' }}>🤖</div>
                    )}
                    <div
                      className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #1B3A4B, #2d5a6e)' : '#F8F9FA',
                        color: msg.role === 'user' ? 'white' : '#1A1A1A',
                        borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                        borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                      }}
                    >
                      {msg.content.split('\n').map((line, li) => (
                        <span key={li}>
                          {line.replace(/\*\*(.*?)\*\*/g, '$1')}
                          {li < msg.content.split('\n').length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm mr-2" style={{ background: '#1B3A4B' }}>🤖</div>
                  <div className="px-4 py-3 rounded-2xl bg-gray-100 flex gap-1 items-center" style={{ borderTopLeftRadius: '4px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 rounded-full bg-gray-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Options (shown when first opened) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Quick Options</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(opt.text)}
                      className="text-xs py-2 px-3 rounded-xl font-medium text-left transition-all hover:scale-105"
                      style={{ background: '#F0F4F8', color: '#1B3A4B', border: '1px solid #E2E8F0' }}
                    >
                      {MODULES[opt.module].emoji} {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleVoice}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${listening ? 'animate-pulse' : ''}`}
                  style={{ background: listening ? '#ef4444' : '#F0F4F8' }}
                >
                  {listening
                    ? <MicOff size={16} className="text-white" />
                    : <Mic size={16} className="text-gray-500" />
                  }
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={listening ? '🎙️ Listening...' : `Type in ${langName}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: '#F8F9FA', border: '1.5px solid #E2E8F0', color: '#1A1A1A' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg, #1B3A4B, #2d5a6e)' }}
                >
                  <Send size={15} className="text-white" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-300 mt-2">Powered by OpenAI + Sarvam AI</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
