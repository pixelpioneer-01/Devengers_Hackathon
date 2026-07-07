import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { LEADER_COMPARISON_PROMPT } from '../prompts';
import { detectLocation, getConstituency, searchLeaderOnWikipedia } from '../locationHelper';
import { startRecording, stopRecording } from '../voiceHelper';
import { MapPin, Search, Users, ShieldCheck, Zap, Info, Mic, ArrowRight, ExternalLink, Sparkles, Globe, RefreshCw, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMPARISON_PROMPT = `Compare these leaders in large-print format. Use ## for headers. Focus on facts.`;

export default function LeaderFinder({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [location, setLocation] = useState(null);
  const [constituency, setConstituency] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [comparison, setComparison] = useState('');
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDetect = async () => {
    setDetecting(true);
    setLeaders([]);
    setMessages([]);
    setComparison('');
    try {
      const coords = await detectLocation();
      setLocation(coords);
      const loc = await getConstituency(coords.lat, coords.lng);
      setConstituency(loc);
      const districtName = loc.district || loc.city || '';
      
      const searchQueries = [
        { query: `"${districtName}" MLA assembly constituency ${loc.state}`, role: 'MLA (State Legislator)', limit: 2 },
        { query: `"${districtName}" MP Lok Sabha constituency ${loc.state}`, role: 'MP (Lok Sabha)', limit: 2 }
      ];

      const searchResults = await Promise.all(searchQueries.map(s => searchLeaderOnWikipedia(s.query, s.limit)));
      const allFound = [];
      searchResults.forEach((group, i) => {
        group.forEach(leader => allFound.push({ ...leader, role: searchQueries[i].role }));
      });
      
      setLeaders(allFound);
      if (allFound.length >= 2 && apiKey) {
        setComparisonLoading(true);
        const context = allFound.map((l, i) => `Leader ${i+1}: ${l.name}, Role: ${l.role}, Summary: ${l.summary}`).join('\n\n');
        const result = await callAI(COMPARISON_PROMPT, context, apiKey, language);
        setComparison(result);
        setComparisonLoading(false);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
    setDetecting(false);
  };

  const handleSend = async (customMsg) => {
    const userMsg = customMsg || input.trim();
    if (!userMsg || leaders.length === 0) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const ctx = leaders.map(l => `${l.name} (${l.role}): ${l.summary}`).join('\n');
      const response = await callAI(LEADER_COMPARISON_PROMPT, `Constituency: ${constituency?.displayName}\n\n${ctx}\n\nUser: ${userMsg}`, apiKey, language);
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
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs mb-6">
          <MapPin size={16} /> {t('modules.leaders.representatives')}
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">{t('modules.leaders.title')}</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          {t('modules.leaders.subtitle')}
        </p>

        <div className="mt-12 flex flex-col items-center gap-8">
          <button 
            onClick={handleDetect} 
            disabled={detecting}
            className="premium-btn px-16 py-6 text-xl shadow-2xl"
          >
            {detecting ? <RefreshCw size={28} className="animate-spin" /> : <Globe size={28} className="text-[#C8A84B]" />}
            {detecting ? t('common.detecting') : t('modules.leaders.representatives')}
          </button>
          
          <AnimatePresence>
            {constituency && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-6 p-6 bg-white rounded-3xl shadow-xl border border-gray-100">
                <div className="w-16 h-16 bg-[#FAF0E6] rounded-2xl flex items-center justify-center text-3xl shadow-inner">📍</div>
                <div className="text-left">
                  <h4 className="font-black text-[#1B3A4B] text-2xl leading-tight">{constituency.district || constituency.city}</h4>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{constituency.state}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* LEFT: RESULTS */}
        <div className="lg:col-span-2 space-y-12">
          {leaders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {leaders.map((leader, i) => (
                <div key={i} className="premium-card group hover:border-[#C8A84B] transition-all bg-white p-10 flex flex-col">
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-50 flex items-center justify-center shadow-inner group-hover:border-[#C8A84B]/20 transition-all">
                      {leader.thumbnail ? <img src={leader.thumbnail} className="w-full h-full object-cover" /> : <Users size={40} className="text-gray-200" />}
                    </div>
                    <span className="px-4 py-2 bg-[#1B3A4B] text-[#C8A84B] text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">{leader.role}</span>
                  </div>
                  <h3 className="text-2xl font-heading font-black text-[#1B3A4B] mb-4 group-hover:text-[#C8A84B] transition-colors">{leader.name}</h3>
                  <p className="text-lg text-gray-500 leading-relaxed mb-10 line-clamp-4 font-medium">{leader.summary}</p>
                  <div className="mt-auto">
                    <a href={leader.wikiUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#C8A84B] hover:underline">
                      Public Record Audit <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI ANALYSIS */}
          {(comparisonLoading || comparison) && (
            <div className="premium-card relative overflow-hidden p-12 bg-white">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <ShieldCheck size={160} className="text-[#1B3A4B]" />
               </div>
               <div className="flex justify-between items-center mb-12 border-b border-gray-50 pb-8">
                 <h3 className="text-3xl font-heading font-black text-[#1B3A4B]">{t('modules.leaders.comparisonTitle')}</h3>
                 <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 shadow-sm">
                    <ShieldCheck size={16} className="text-green-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">Audited Neutrality</span>
                 </div>
               </div>
               {comparisonLoading ? (
                 <div className="space-y-8 animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-48 bg-gray-50 rounded-3xl w-full"></div>
                 </div>
               ) : (
                 <div className="prose prose-xl max-w-none text-[#1B3A4B] font-medium" dangerouslySetInnerHTML={{ __html: formatMarkdown(comparison) }} />
               )}
            </div>
          )}
        </div>

        {/* RIGHT: CHAT */}
        <div className="lg:col-span-1">
          <div className="bg-[#1B3A4B] rounded-3xl p-10 shadow-2xl flex flex-col h-[800px] sticky top-28 border border-white/10 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 p-20 opacity-5 pointer-events-none">
                <Zap size={200} className="text-[#C8A84B]" />
            </div>
            
            <div className="mb-10 p-6 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
               <div className="flex items-center gap-4 mb-4">
                 <Zap size={20} className="text-[#C8A84B]" />
                 <h4 className="text-white text-sm font-black uppercase tracking-widest italic">{t('modules.leaders.chatTitle')}</h4>
               </div>
               <p className="text-xs text-white/50 font-medium leading-relaxed">{t('modules.leaders.chatSubtitle')}</p>
            </div>

            <div className="flex-grow overflow-y-auto mb-8 space-y-8 pr-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-12 space-y-8">
                   <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <MessageSquare size={32} className="text-white/10" />
                   </div>
                   <div className="flex flex-col gap-3 px-4">
                     {[
                        { label: t('modules.leaders.suggestions.pollutionLabel'), query: t('modules.leaders.suggestions.pollution') },
                        { label: t('modules.leaders.suggestions.compareLabel'), query: t('modules.leaders.suggestions.compare') },
                        { label: t('modules.leaders.suggestions.issuesLabel'), query: t('modules.leaders.suggestions.issues') }
                     ].map((s, idx) => (
                       <button key={idx} onClick={() => handleSend(s.query)} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-xs text-white/70 font-black uppercase tracking-widest hover:bg-white/10 transition-all text-left flex justify-between items-center group">
                         {s.label} <ArrowRight size={14} className="text-white/20 group-hover:text-[#C8A84B]" />
                       </button>
                     ))}
                   </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-6 rounded-2xl text-base leading-relaxed font-medium shadow-sm border ${m.role === 'user' ? 'bg-[#C8A84B] text-[#1B3A4B] border-[#C8A84B]/20 rounded-tr-none' : 'bg-white/10 text-white border-white/10 rounded-tl-none'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-[10px] text-[#C8A84B] uppercase font-black tracking-widest animate-pulse p-4">Auditing Records...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-auto pt-6 border-t border-white/10">
               <div className="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-inner">
                  <textarea 
                    className="flex-grow bg-transparent outline-none p-3 text-white text-lg font-medium resize-none min-h-[60px] placeholder:text-white/20"
                    placeholder={t('modules.leaders.placeholder')}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  />
                  <div className="flex flex-col gap-3">
                    <button onClick={handleVoice} className={`p-4 rounded-xl shadow-lg transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-white/40 hover:text-[#C8A84B]'}`}><Mic size={24} /></button>
                    <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="p-4 bg-[#C8A84B] text-[#1B3A4B] rounded-xl disabled:opacity-30 shadow-xl hover:scale-105 transition-all"><ArrowRight size={24} /></button>
                  </div>
               </div>
               <div className="mt-6 flex items-center gap-3 justify-center opacity-40">
                  <Info size={14} className="text-white" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest italic">{t('modules.leaders.disclaimer')}</span>
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
    .replace(/## (.*)/g, '<h3 class="font-heading font-black text-[#1B3A4B] mt-10 mb-6 text-2xl border-b border-gray-50 pb-4">$1</h3>')
    .replace(/### (.*)/g, '<h4 class="font-heading font-black text-[#C8A84B] mt-8 mb-4 text-xl">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1B3A4B]">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-8 mb-3 text-gray-700 list-disc">$1</li>')
    .split('\n\n').join('</div><div class="mb-6">')
    .split('\n').join('<br/>');
}
