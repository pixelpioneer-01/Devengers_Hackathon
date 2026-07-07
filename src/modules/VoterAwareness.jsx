import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { VOTER_AWARENESS_PROMPT } from '../prompts';
import { startRecording, stopRecording } from '../voiceHelper';
import { Vote, ShieldCheck, Send, Info, HelpCircle, ArrowRight, MessageSquare, Mic, Search, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoterAwareness({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (forcedText = null) => {
    const userMsg = forcedText || input.trim();
    if (!userMsg) return;
    
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await callAI(VOTER_AWARENESS_PROMPT, userMsg, apiKey, language);
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

  return (
    <div className="max-w-6xl mx-auto px-6 pt-10 pb-6 fade-in flex flex-col min-h-[600px]" style={{ minHeight: '80vh' }}>
      {/* HEADER */}
      <div className="text-center mb-12 flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs mb-6">
          <Vote size={16} /> Democratic Participation
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">{t('modules.voter.title')}</h2>
        <div className="flex items-center justify-center gap-2 px-6 py-2 bg-[#FFF3CD] text-[#856404] rounded-full text-xs font-black uppercase tracking-widest border border-[#FFEEBA] w-fit mx-auto">
          <ShieldCheck size={14} /> Non-Partisan Fact Checker
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-grow mb-10 pr-6 space-y-10 custom-scrollbar" style={{ minHeight: '350px' }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-12 py-10">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
               <MessageSquare size={48} className="text-gray-200" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-heading font-black text-[#1B3A4B]">{t('modules.voter.chatTitle')}</h3>
              <p className="text-lg text-gray-500 max-w-sm mx-auto">{t('modules.voter.chatSubtitle')}</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
              {[
                { label: t('modules.voter.suggestions.nriLabel'), query: t('modules.voter.suggestions.nri') },
                { label: t('modules.voter.suggestions.compareLabel'), query: t('modules.voter.suggestions.compare') },
                { label: t('modules.voter.suggestions.evmLabel'), query: t('modules.voter.suggestions.evm') }
              ].map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSend(s.query)}
                  className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-black uppercase tracking-widest text-[#1B3A4B] hover:border-[#C8A84B] hover:shadow-xl transition-all flex items-center gap-3 group"
                >
                  {s.label} <ArrowRight size={16} className="text-gray-200 group-hover:text-[#C8A84B]" />
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-10 rounded-3xl relative ${msg.role === 'user' ? 'bg-[#1B3A4B] text-white rounded-tr-none shadow-2xl' : 'bg-white border border-gray-100 shadow-lg rounded-tl-none'}`}>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                    <div className="w-6 h-6 bg-[#C8A84B] rounded-full flex items-center justify-center text-[10px] text-[#1B3A4B] font-black">✓</div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Verified AI Fact-Check</span>
                  </div>
                )}
                
                <div className={`text-lg leading-relaxed font-medium ${msg.role === 'assistant' ? 'text-[#1B3A4B]' : 'text-white'}`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 p-8 rounded-3xl rounded-tl-none shadow-lg flex gap-3 items-center">
              <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce"></span>
              <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-3 h-3 bg-[#C8A84B] rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="flex-shrink-0 space-y-6">
        <div className="flex justify-center">
          <div className="bg-[#FAF0E6] px-6 py-2 rounded-full border border-[#EDE1D5] flex items-center gap-3 shadow-sm">
            <Info size={14} className="text-[#1B3A4B]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3A4B]/60">Sourced from ECI & Neutral Records</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-3xl border-2 border-gray-100 focus-within:border-[#1B3A4B] transition-all shadow-2xl flex items-end gap-4 overflow-hidden">
          <textarea 
            className="flex-grow p-6 bg-transparent outline-none resize-none text-xl font-medium text-[#1B3A4B] leading-relaxed"
            placeholder={t('modules.voter.placeholder')}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <div className="flex gap-3 p-2">
            <button 
              onClick={handleVoice}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-50 text-gray-400 hover:text-[#1B3A4B]'}`}
            >
              <Mic size={28} />
            </button>
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-16 h-16 bg-[#1B3A4B] text-white rounded-2xl flex items-center justify-center hover:bg-[#122834] shadow-xl disabled:opacity-30 transition-all font-black text-xl"
            >
              {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} className="text-[#C8A84B]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/## (.*)/g, '<h3 class="text-2xl font-heading font-black text-[#1B3A4B] mt-8 mb-4 border-b border-gray-100 pb-2">$1</h3>')
    .replace(/### (.*)/g, '<h4 class="text-xl font-heading font-black text-[#1B3A4B] mt-6 mb-2 text-[#C8A84B]">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1B3A4B]">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-6 mb-2 text-gray-700 list-disc">$1</li>')
    .split('\n\n').join('</div><div class="mb-4">')
    .split('\n').join('<br/>');
}
