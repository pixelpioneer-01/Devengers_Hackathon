import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en-IN',  label: 'English',    native: 'English',    flag: '🇮🇳', sarvam: 'en-IN' },
  { code: 'hi-IN',  label: 'Hindi',      native: 'हिन्दी',      flag: '🇮🇳', sarvam: 'hi-IN' },
  { code: 'mr-IN',  label: 'Marathi',    native: 'मराठी',       flag: '🟠', sarvam: 'mr-IN' },
  { code: 'bn-IN',  label: 'Bengali',    native: 'বাংলা',       flag: '🟢', sarvam: 'bn-IN' },
  { code: 'te-IN',  label: 'Telugu',     native: 'తెలుగు',      flag: '🔵', sarvam: 'te-IN' },
  { code: 'ta-IN',  label: 'Tamil',      native: 'தமிழ்',       flag: '🔴', sarvam: 'ta-IN' },
  { code: 'kn-IN',  label: 'Kannada',   native: 'ಕನ್ನಡ',       flag: '🟡', sarvam: 'kn-IN' },
  { code: 'gu-IN',  label: 'Gujarati',   native: 'ગુજરાતી',     flag: '🟣', sarvam: 'gu-IN' },
];

export { LANGUAGES };

export default function LanguageSelectionModal({ onSelect }) {
  const [selected, setSelected] = useState(null);
  const [hovering, setHovering] = useState(null);

  const handleConfirm = () => {
    if (!selected) return;
    const lang = LANGUAGES.find(l => l.code === selected);
    onSelect(lang);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        }}
      >
        {/* Animated background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${150 + i * 80}px`,
                height: `${150 + i * 80}px`,
                background: 'radial-gradient(circle, #C8A84B, transparent)',
                left: `${10 + i * 15}%`,
                top: `${5 + i * 12}%`,
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center border-b border-white/10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl"
              style={{ background: 'linear-gradient(135deg, #C8A84B, #e6c670)' }}
            >
              🏛️
            </motion.div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Welcome to CivicAI</h1>
            <p className="text-white/60 text-sm font-medium">Select your preferred language to continue</p>
            <p className="text-white/40 text-xs mt-1">अपनी भाषा चुनें • ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ • உங்கள் மொழியை தேர்ந்தெடுக்கவும்</p>
          </div>

          {/* Language Grid */}
          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LANGUAGES.map((lang, idx) => (
                <motion.button
                  key={lang.code}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => setSelected(lang.code)}
                  onMouseEnter={() => setHovering(lang.code)}
                  onMouseLeave={() => setHovering(null)}
                  className="relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: selected === lang.code
                      ? 'linear-gradient(135deg, #C8A84B, #e6c670)'
                      : hovering === lang.code
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(255,255,255,0.06)',
                    border: selected === lang.code
                      ? '2px solid #C8A84B'
                      : '2px solid rgba(255,255,255,0.1)',
                    transform: selected === lang.code ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-sm font-black ${selected === lang.code ? 'text-[#1B3A4B]' : 'text-white'}`}>
                    {lang.native}
                  </span>
                  <span className={`text-xs ${selected === lang.code ? 'text-[#1B3A4B]/70' : 'text-white/40'}`}>
                    {lang.label}
                  </span>
                  {selected === lang.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1B3A4B] flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Confirm Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: selected ? 1 : 0.4 }}
              onClick={handleConfirm}
              disabled={!selected}
              className="w-full mt-6 py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all duration-200"
              style={{
                background: selected ? 'linear-gradient(135deg, #C8A84B, #e6c670)' : 'rgba(255,255,255,0.1)',
                color: selected ? '#1B3A4B' : 'rgba(255,255,255,0.4)',
                cursor: selected ? 'pointer' : 'not-allowed',
              }}
            >
              {selected
                ? `Continue in ${LANGUAGES.find(l => l.code === selected)?.native} →`
                : 'Select a language to continue'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
