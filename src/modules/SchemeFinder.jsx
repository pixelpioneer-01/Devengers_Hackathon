import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { firecrawlSearch } from '../firecrawlHelper';
import { startRecording, stopRecording } from '../voiceHelper';
import { Search, Filter, ArrowRight, ExternalLink, ShieldCheck, Zap, Info, MessageSquare, Briefcase, Home, Heart, Sprout, GraduationCap, Coins, Milestone, Flame, Mic, RefreshCw, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCHEMES = [
  { id: 'pmay', icon: Home, translationKey: 'modules.schemes.items.pmay' },
  { id: 'pmjay', icon: Heart, translationKey: 'modules.schemes.items.pmjay' },
  { id: 'pmkisan', icon: Sprout, translationKey: 'modules.schemes.items.pmkisan' },
  { id: 'mudra', icon: Briefcase, translationKey: 'modules.schemes.items.mudra' },
  { id: 'skill', icon: GraduationCap, translationKey: 'modules.schemes.items.skill' }
];

const SCHEME_PROMPT = `You are an expert Indian government scheme advisor. Provide clear, large-print friendly answers. Use ## for headers.`;

export default function SchemeFinder({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const CATEGORIES = ['All', 'Housing', 'Health', 'Agriculture', 'Business', 'Skills'];
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  const filteredSchemes = SCHEMES.filter(s => {
    // We check against the literal category name from the scheme object's translation
    const schemeCategory = t(`${s.translationKey}.category`);
    // activeCategory is one of ['All', 'Housing', 'Health', etc.]
    // We need to compare it with the untranslated key or the translated label.
    // Let's compare translated with translated for simplicity if we want to match what the user sees in the buttons.
    const activeCatLabel = t(`modules.schemes.categories.${activeCategory}`);
    
    const matchCat = activeCategory === 'All' || schemeCategory === activeCatLabel;
    
    const name = t(`${s.translationKey}.name`).toLowerCase();
    const desc = t(`${s.translationKey}.desc`).toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSrc = !searchQuery || name.includes(query) || desc.includes(query);
    
    return matchCat && matchSrc;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  const handleAsk = async (question) => {
    const q = question || input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      // Fetch live web context from Firecrawl for the query
      let webContext = '';
      try {
        const schemeQuery = `India government scheme ${q} eligibility benefits apply site:india.gov.in OR site:myscheme.gov.in OR site:pmindia.gov.in`;
        const webResults = await firecrawlSearch(schemeQuery, 4);
        if (webResults.length > 0) {
          webContext = webResults
            .map(r => `Source: ${r.title}\nURL: ${r.url}\n${r.description || r.content?.slice(0, 500) || ''}`)
            .join('\n---\n');
        }
      } catch (webErr) {
        console.warn('[Firecrawl] Scheme search error (non-fatal):', webErr.message);
      }

      const augmentedPrompt = webContext
        ? `${SCHEME_PROMPT}\n\n## LIVE WEB DATA (use this for factual accuracy):\n${webContext}`
        : SCHEME_PROMPT;

      const response = await callAI(augmentedPrompt, q, apiKey, language);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
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
    <div className="max-w-7xl mx-auto px-6 py-20 fade-in">
      {/* HEADER */}
      <div className="text-center mb-16 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs mb-6">
          <ClipboardList size={16} /> {t('modules.schemes.welfareDiscovery')}
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">{t('modules.schemes.title')}</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          {t('modules.schemes.subtitle')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* LEFT: DISCOVERY Area */}
        <div className="lg:w-7/12 space-y-12">
          {/* Search Bar */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#C8A84B]"></div>
             <div className="relative">
                <input 
                  type="text"
                  className="w-full p-8 pl-16 bg-gray-50 border-2 border-transparent focus:border-[#1B3A4B] rounded-2xl outline-none transition-all text-xl font-medium shadow-inner"
                  placeholder={t('modules.schemes.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={32} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
             </div>
             
             <div className="flex flex-wrap gap-3">
               {CATEGORIES.map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setActiveCategory(cat)}
                   className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border-2 ${activeCategory === cat ? 'bg-[#1B3A4B] text-white border-[#1B3A4B] shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-[#1B3A4B] hover:text-[#1B3A4B]'}`}
                 >
                   {t(`modules.schemes.categories.${cat}`)}
                 </button>
               ))}
             </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredSchemes.map(scheme => (
              <div 
                key={scheme.id}
                onClick={() => setSelectedScheme(selectedScheme?.id === scheme.id ? null : scheme)}
                className={`premium-card group transition-all flex flex-col cursor-pointer p-8 relative overflow-hidden ${selectedScheme?.id === scheme.id ? 'border-[#C8A84B] ring-4 ring-[#C8A84B]/5' : ''}`}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#FAF0E6] rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-[#1B3A4B] transition-all">
                    <scheme.icon size={24} className="text-[#1B3A4B] group-hover:text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#C8A84B]">{t(`${scheme.translationKey}.category`)}</span>
                </div>
                <h4 className="text-2xl font-heading font-black text-[#1B3A4B] mb-4">{t(`${scheme.translationKey}.name`)}</h4>
                <p className="text-base text-gray-500 leading-relaxed font-medium line-clamp-3">{t(`${scheme.translationKey}.desc`)}</p>
                
                <AnimatePresence>
                  {selectedScheme?.id === scheme.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-8 mt-8 border-t border-gray-50 space-y-8">
                       <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('modules.schemes.eligibilityCriteria')}</span>
                          <p className="text-base font-black text-[#1B3A4B] leading-relaxed italic">"{t(`${scheme.translationKey}.eligibility`)}"</p>
                       </div>
                       <div className="space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('modules.schemes.applicationBridge')}</span>
                          <p className="text-base font-medium text-gray-600">{t(`${scheme.translationKey}.howToApply`)}</p>
                       </div>
                       <a href={scheme.link || '#'} target="_blank" rel="noopener" className="premium-btn w-full justify-center text-xs py-4">
                          {t('modules.schemes.portalAccess')} <ExternalLink size={16} />
                       </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SCHOLAR AI */}
        <div className="lg:w-5/12">
          <div className="bg-[#1B3A4B] rounded-3xl shadow-2xl flex flex-col h-[750px] sticky top-28 border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <ShieldCheck size={140} className="text-[#C8A84B]" />
             </div>
             
             <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center px-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Zap size={20} className="text-[#C8A84B]" />
                  </div>
                  <div>
                    <h3 className="text-white text-base font-black uppercase tracking-widest italic">{t('modules.schemes.scholarAi')}</h3>
                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{t('modules.schemes.policyAdvisor')}</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] font-black tracking-widest uppercase border border-green-500/20">{t('modules.schemes.verifiedPath')}</div>
             </div>

             <div className="flex-grow overflow-y-auto p-10 space-y-8 pr-4 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-16 space-y-10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                       <MessageSquare size={32} className="text-white/10" />
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-white text-lg font-heading font-black">{t('modules.schemes.howCanAssist')}</h4>
                       <p className="text-xs text-white/40 font-medium">{t('modules.schemes.chatSubtitle')}</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      {[
                         { label: t('modules.schemes.suggested.housingLabel'), query: t('modules.schemes.suggested.housing') },
                         { label: t('modules.schemes.suggested.farmerLabel'), query: t('modules.schemes.suggested.farmer') },
                         { label: t('modules.schemes.suggested.womenLabel'), query: t('modules.schemes.suggested.women') }
                      ].map((s, idx) => (
                        <button key={idx} onClick={() => handleAsk(s.query)} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest hover:border-[#C8A84B] hover:text-[#C8A84B] transition-all">
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-6 rounded-2xl text-base font-medium shadow-sm border ${m.role === 'user' ? 'bg-[#C8A84B] text-[#1B3A4B] border-[#C8A84B]/20 rounded-tr-none' : 'bg-white/10 text-white border-white/10 rounded-tl-none'}`}>
                      {m.role === 'assistant' ? (
                        <div className="markdown-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(m.content) }} />
                      ) : m.content}
                    </div>
                  </div>
                ))}
                {loading && <div className="text-[10px] text-[#C8A84B] font-black uppercase tracking-widest animate-pulse px-4">{t('modules.schemes.verifyingPolicy')}</div>}
                <div ref={chatEndRef} />
             </div>

             <div className="p-8 border-t border-white/10 bg-white/5">
                <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-inner">
                  <textarea 
                    className="flex-grow bg-transparent outline-none p-3 text-white text-lg font-medium resize-none min-h-[60px] placeholder:text-white/20"
                    placeholder={t('modules.schemes.chatPlaceholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())}
                  />
                  <div className="flex items-center gap-3">
                    <button onClick={handleVoice} className={`p-4 rounded-xl shadow-lg transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-[#C8A84B]'}`}><Mic size={24} /></button>
                    <button onClick={() => handleAsk()} disabled={loading || !input.trim()} className="p-4 bg-[#C8A84B] text-[#1B3A4B] rounded-xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-30">
                        {loading ? <RefreshCw size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                    </button>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 justify-center text-white/20">
                   <Info size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest italic">{t('modules.schemes.dataDisclaimer')}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/## (.*)/g, '<h4 class="text-xl font-heading font-black text-white mt-10 mb-4 border-b border-white/10 pb-2">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#C8A84B]">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-6 mb-2 text-white/80 list-disc">$1</li>')
    .split('\n\n').join('</div><div class="mb-4">')
    .split('\n').join('<br/>');
}

const ClipboardList = ({ className, size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path><path d="M9 8h6"></path></svg>
);
