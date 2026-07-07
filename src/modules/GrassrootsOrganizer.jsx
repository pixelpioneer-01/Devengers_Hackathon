import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { GRASSROOTS_ORGANIZER_PROMPT } from '../prompts';
import { startRecording, stopRecording } from '../voiceHelper';
import { Megaphone, MessageSquare, Zap, ShieldCheck, ArrowRight, Mic, Info, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GrassrootsOrganizer({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customMsg) => {
    const userMsg = customMsg || input.trim();
    if (!userMsg) return;
    
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await callAI(GRASSROOTS_ORGANIZER_PROMPT, userMsg, apiKey, language);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      await stopRecording((text) => setInput(p => p + (p ? ' ' : '') + text), (err) => showToast(err, 'error'), language, apiKey);
    } else {
      const success = await startRecording(language);
      if (success) setListening(true);
    }
  };

  const suggestions = [
    { label: t('modules.grassroots.suggestions.waterLabel'), text: t('modules.grassroots.suggestions.water') },
    { label: t('modules.grassroots.suggestions.lightsLabel'), text: t('modules.grassroots.suggestions.lights') },
    { label: t('modules.grassroots.suggestions.debrisLabel'), text: t('modules.grassroots.suggestions.debris') }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-6 fade-in h-[calc(100vh-100px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="text-center mb-12 flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs mb-6">
          <Megaphone size={16} /> Community Action
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">{t('modules.grassroots.title')}</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          {t('modules.grassroots.subtitle')}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 flex-grow flex flex-col overflow-hidden">
        {/* Status Bar */}
        <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center px-10">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400">AI Mobilizer Active</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-black text-[#1B3A4B] uppercase tracking-widest">
            <ShieldCheck size={16} className="text-[#C8A84B]" /> Neutral Data Verification
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-grow overflow-y-auto p-10 space-y-12 custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-12 py-10">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <Sparkles size={48} className="text-gray-200" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-heading font-black text-[#1B3A4B]">{t('modules.grassroots.chatTitle')}</h3>
                <p className="text-lg text-gray-500 max-w-sm mx-auto">{t('modules.grassroots.chatSubtitle')}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
                {suggestions.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(s.text)}
                    className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black uppercase tracking-widest text-[#1B3A4B] hover:border-[#C8A84B] hover:shadow-xl transition-all flex items-center gap-3 group"
                  >
                    <Zap size={16} className="text-[#C8A84B]" /> {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-6 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg shadow-sm ${msg.role === 'user' ? 'bg-[#C8A84B] text-[#1B3A4B]' : 'bg-[#1B3A4B] text-white'}`}>
                    {msg.role === 'user' ? '👤' : '✊'}
                  </div>
                  <div className={`p-9 rounded-3xl shadow-sm leading-[1.7] ${msg.role === 'user' ? 'bg-[#1B3A4B] text-white rounded-tr-none' : 'bg-gray-50 text-[#1B3A4B] rounded-tl-none border border-gray-100'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content text-xl font-medium" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                    ) : (
                      <p className="text-xl font-bold">{msg.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="flex gap-6 justify-start">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex-shrink-0"></div>
              <div className="p-8 bg-gray-50 rounded-3xl w-2/3 shadow-sm border border-gray-100 flex items-center justify-center">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce"></span>
                  <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Action Area */}
        <div className="p-8 border-t border-gray-100 bg-white">
          <div className="relative flex items-center gap-4 bg-gray-50 rounded-3xl p-5 border-2 border-transparent focus-within:border-[#1B3A4B] transition-all shadow-inner overflow-hidden">
            <textarea
              className="flex-grow bg-transparent outline-none p-4 text-xl text-[#1B3A4B] resize-none min-h-[60px] font-medium leading-relaxed"
              placeholder={t('modules.grassroots.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <div className="flex items-center gap-4">
              <button 
                onClick={handleVoice}
                className={`p-5 rounded-2xl transition-all shadow-md ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-[#1B3A4B]'}`}
              >
                <Mic size={28} />
              </button>
              <button 
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-5 bg-[#1B3A4B] text-white rounded-2xl hover:bg-[#122834] shadow-xl disabled:opacity-30 transition-all"
              >
                {loading ? <RefreshCw className="animate-spin" size={28} /> : <ArrowRight size={28} className="text-[#C8A84B]" />}
              </button>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 justify-center text-gray-300">
            <Info size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">AI Action Plans are suggested pathways for community mobilization</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/## (.*)/g, '<h3 class="text-3xl font-heading font-black text-[#1B3A4B] mt-10 mb-6 border-b-2 border-gray-100 pb-3">$1</h3>')
    .replace(/### (.*)/g, '<h4 class="text-2xl font-heading font-black text-[#1B3A4B] mt-8 mb-4 text-[#C8A84B]">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1B3A4B]">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-8 mb-3 text-gray-700 list-disc text-xl">$1</li>')
    .split('\n\n').join('</div><div class="mb-6">')
    .split('\n').join('<br/>');
}
