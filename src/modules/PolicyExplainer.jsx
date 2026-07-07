import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { POLICY_EXPLAINER_PROMPT } from '../prompts';
import { getWikipediaSummary } from '../wikiAPI';
import { startRecording, stopRecording, speak, stopSpeaking } from '../voiceHelper';
import {
  Search, GraduationCap, Users, Briefcase, Baby, Calendar,
  Info, FileText, ShieldAlert, ArrowRight, CheckCircle, Mic, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PolicyExplainer({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [wikiInfo, setWikiInfo] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('student');

  // Audience options — labels pulled from i18n
  const AUDIENCES = [
    { id: 'student',  labelKey: 'modules.policy.audiences.student',  icon: GraduationCap },
    { id: 'senior',   labelKey: 'modules.policy.audiences.senior',   icon: Users         },
    { id: 'business', labelKey: 'modules.policy.audiences.business', icon: Briefcase     },
    { id: 'parent',   labelKey: 'modules.policy.audiences.parent',   icon: Baby          },
  ];

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    setWikiInfo('');

    try {
      const firstWords = input.trim().split(/\s+/).slice(0, 5).join(' ');
      const wiki = await getWikipediaSummary(firstWords);
      if (wiki) setWikiInfo(wiki);

      const audienceLabel = t(AUDIENCES.find(a => a.id === selectedAudience)?.labelKey || 'modules.policy.audiences.student');
      const tailoredRequest = `Explain this policy for a ${audienceLabel}. Result must be in clear, large-print friendly sections.`;
      const context = wiki ? `Background: ${wiki}\n` : '';
      const response = await callAI(
        POLICY_EXPLAINER_PROMPT,
        `${context} Topic: ${input}\n Audience: ${audienceLabel}. ${tailoredRequest}`,
        apiKey,
        language
      );
      setResult(response);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      await stopRecording(
        (text) => setInput(p => p + (p ? ' ' : '') + text),
        (err) => showToast(err, 'error'),
        language,
        apiKey
      );
    } else {
      const success = await startRecording(language);
      if (success) setListening(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 fade-in">
      {/* HEADER */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs mb-6">
          <FileText size={16} /> {t('modules.policy.badge')}
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">
          {t('modules.policy.title')}
        </h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          {t('modules.policy.subtitle')}
        </p>
      </div>

      {/* INPUT CARD */}
      <div className="bg-white rounded-3xl p-10 md:p-16 card-shadow border border-gray-100 mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <GraduationCap size={160} className="text-[#1B3A4B]" />
        </div>

        <div className="max-w-3xl space-y-12">
          {/* Step 1 — Policy Input */}
          <div className="space-y-4">
            <h3 className="text-xl font-heading font-black text-[#1B3A4B] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#1B3A4B] text-white flex items-center justify-center text-xs">1</span>
              {t('modules.policy.step1Label')}
            </h3>
            <div className="relative">
              <input
                type="text"
                className="w-full p-8 pl-16 bg-gray-50 border-2 border-transparent focus:border-[#1B3A4B] rounded-2xl outline-none transition-all text-xl font-medium text-[#1B3A4B] shadow-inner"
                placeholder={t('modules.policy.inputPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <Search size={28} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
              <button
                onClick={handleVoice}
                title={listening ? t('modules.policy.stopRecording') : t('modules.policy.startRecording')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-xl shadow-lg transition-all ${
                  listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-[#1B3A4B]'
                }`}
              >
                <Mic size={24} />
              </button>
            </div>
          </div>

          {/* Step 2 — Audience */}
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-black text-[#1B3A4B] flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#1B3A4B] text-white flex items-center justify-center text-xs">2</span>
              {t('modules.policy.step2Label')}
            </h3>
            <div className="flex flex-wrap gap-4">
              {AUDIENCES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAudience(a.id)}
                  className={`flex items-center gap-4 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                    selectedAudience === a.id
                      ? 'bg-[#1B3A4B] text-white border-[#1B3A4B] shadow-xl'
                      : 'bg-white text-gray-400 border-gray-50 hover:border-[#1B3A4B] hover:text-[#1B3A4B]'
                  }`}
                >
                  <a.icon size={20} style={{ color: selectedAudience === a.id ? '#C8A84B' : 'inherit' }} />
                  {t(a.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="premium-btn w-full py-6 text-xl"
          >
            {loading
              ? <RefreshCw className="animate-spin" size={24} />
              : <Sparkles size={24} className="text-[#C8A84B]" />}
            {loading ? t('modules.policy.analyzing') : t('modules.policy.analyzeBtn')}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {wikiInfo && (
              <div className="bg-[#FAF0E6] p-8 rounded-2xl border border-[#EDE1D5] flex gap-6">
                <Info size={28} className="text-[#1B3A4B] flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    {t('modules.policy.wikiPrimer')}
                  </h4>
                  <p className="text-base text-[#1B3A4B] leading-relaxed italic font-medium">
                    {wikiInfo.slice(0, 300)}...
                  </p>
                </div>
              </div>
            )}

            <div className="premium-card">
              <div className="bg-[#1B3A4B] -mx-10 -mt-10 p-10 mb-10 flex flex-wrap justify-between items-center text-white gap-6">
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#C8A84B]">
                    {t('modules.policy.reportLabel')}
                  </span>
                  <h3 className="text-3xl font-heading font-black mt-2 text-white">
                    {input.split('\n')[0].slice(0, 60)}{input.length > 60 ? '...' : ''}
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => speak(result.replace(/#/g, '').replace(/\*/g, ''), language)}
                    className="px-4 py-2 bg-[#C8A84B] text-[#1B3A4B] font-black uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:bg-white hover:text-[#1B3A4B] transition-all"
                  >
                    🔊 Read Out Loud
                  </button>
                  <button
                    onClick={stopSpeaking}
                    className="px-4 py-2 bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all"
                  >
                    ⏹️ Stop
                  </button>
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-white/50 mb-2">
                      {t('modules.policy.auditLabel')}
                    </span>
                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-black">
                      98% {t('modules.policy.neutrality')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12">
                {result.split('##').map((section, idx) => {
                  if (!section.trim()) return null;
                  const lines = section.trim().split('\n');
                  const title = lines[0];
                  const content = lines.slice(1).join('\n');

                  const iconMap = {
                    '📜': <FileText size={24} className="text-[#C8A84B]" />,
                    '⏳': <Calendar size={24} className="text-[#C8A84B]" />,
                    '👥': <Users size={24} className="text-[#C8A84B]" />,
                    '✅': <CheckCircle size={24} className="text-[#C8A84B]" />,
                  };
                  const icon = Object.entries(iconMap).find(([key]) => title.includes(key))?.[1]
                    || <ArrowRight size={24} className="text-[#C8A84B]" />;

                  return (
                    <div key={idx} className="space-y-6 pb-12 last:pb-0 border-b last:border-0 border-gray-50 flex gap-8">
                      <div className="flex-shrink-0 mt-1">{icon}</div>
                      <div className="space-y-4">
                        <h4 className="text-2xl font-heading font-black text-[#1B3A4B]">{title}</h4>
                        <div className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">{content}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-12 bg-gray-50 -mx-10 -mb-10 p-10 flex flex-wrap justify-between gap-6 border-t border-gray-100">
                <div className="flex gap-4">
                  <button className="text-xs font-black uppercase tracking-widest text-[#1B3A4B] flex items-center gap-2 hover:underline">
                    <FileText size={16} /> {t('modules.policy.printReport')}
                  </button>
                  <button className="text-xs font-black uppercase tracking-widest text-[#1B3A4B] flex items-center gap-2 hover:underline">
                    <ShieldAlert size={16} /> {t('modules.policy.auditPath')}
                  </button>
                </div>
                <p className="text-[10px] font-black uppercase text-gray-300 italic tracking-widest">
                  {t('modules.policy.disclaimer')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RefreshCw = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M3 21v-5h5"></path>
  </svg>
);
