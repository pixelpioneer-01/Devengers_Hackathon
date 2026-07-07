import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { startRecording, stopRecording } from '../voiceHelper';
import { detectLocation, getConstituency } from '../locationHelper';
import { 
  Megaphone, ShieldCheck, MapPin, Search, 
  Trash2, Lightbulb, Droplets, Zap, 
  SearchIcon, TreePine, Car, Heart, 
  GraduationCap, UserPlus, Info, Mic, 
  ArrowRight, ExternalLink, Sparkles, Phone, LifeBuoy, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COMPLAINT_CATEGORIES = [
  { id: 'police', icon: ShieldCheck, label: 'Police / Crime', desc: 'FIR, theft, harassment, cyber crime' },
  { id: 'municipal', icon: Trash2, label: 'Municipal / Civic', desc: 'Roads, garbage, water, street lights' },
  { id: 'consumer', icon: LifeBuoy, label: 'Consumer Rights', desc: 'Fraud, defective goods, service issues' },
  { id: 'electricity', icon: Zap, label: 'Electricity', desc: 'Power cuts, billing, meter issues' },
  { id: 'corruption', icon: SearchIcon, label: 'Corruption / RTI', desc: 'Bribery, government vigilance, RTI' },
  { id: 'environment', icon: TreePine, label: 'Environment', desc: 'Pollution, illegal dumping, noise' },
  { id: 'transport', icon: Car, label: 'Transport', desc: 'License, challan, road safety' },
  { id: 'health', icon: Heart, label: 'Health', desc: 'Hospital negligence, disease outbreak' },
  { id: 'education', icon: GraduationCap, label: 'Education', desc: 'Fee disputes, admission fraud' },
  { id: 'women', icon: UserPlus, label: 'Safety', desc: 'Domestic violence, child safety' },
];

const COMPLAINT_PROMPT = `You are an expert Indian civic complaint advisor. Format with headers ##. Provide clear, large-print roadmaps.`;

export default function ComplaintGuide({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [complaint, setComplaint] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [constituency, setConstituency] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result]);

  const handleDetectLocation = async () => {
    setLocLoading(true);
    try {
      const coords = await detectLocation();
      const loc = await getConstituency(coords.lat, coords.lng);
      setConstituency(loc);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLocLoading(false);
  };

  const handleSubmit = async () => {
    if (!complaint.trim() || !selectedCategory) return;
    setLoading(true);
    setResult('');
    try {
      const response = await callAI(COMPLAINT_PROMPT, `Category: ${selectedCategory}\nComplaint: ${complaint}`, apiKey, language);
      setResult(response);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      await stopRecording((text) => setComplaint(p => p + (p ? ' ' : '') + text), (err) => showToast(err, 'error'), language, apiKey);
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
          <Megaphone size={16} /> Grievance Portal
        </div>
        <h2 className="text-5xl font-heading font-black text-[#1B3A4B] mb-6 tracking-tight">Complaint Guide</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium italic">
          Know your rights and file complaints effectively. Get clear, step-by-step guidance 
          on reaching the correct authorities and official portals.
        </p>

        <div className="mt-12">
           <button 
             onClick={handleDetectLocation} 
             disabled={locLoading}
             className="premium-btn py-4 px-10 text-xs shadow-xl transition-all"
           >
             {locLoading ? <RefreshCw size={14} className="animate-spin" /> : <MapPin size={18} className="text-[#C8A84B]" />}
             {locLoading ? 'Locating...' : constituency ? `Verified Location: ${constituency.displayName}` : 'Detect Location for Local Jurisdictions'}
           </button>
        </div>
      </div>

      {/* STEP 1: CATEGORY */}
      <div className="mb-24">
         <h3 className="text-xl font-heading font-black text-[#1B3A4B] mb-12 text-center flex items-center justify-center gap-4">
           <span className="w-10 h-10 rounded-full bg-[#1B3A4B] text-white flex items-center justify-center text-sm shadow-xl">1</span>
           Select Complaint Category
         </h3>
         <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
           {COMPLAINT_CATEGORIES.map(c => (
             <button 
               key={c.id} 
               onClick={() => setSelectedCategory(c.id)}
               className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group ${selectedCategory === c.id ? 'bg-[#1B3A4B] text-white border-[#1B3A4B] shadow-2xl scale-105' : 'bg-white text-gray-400 border-gray-100 hover:border-[#1B3A4B] hover:text-[#1B3A4B]'}`}
             >
               <c.icon size={32} className={`transition-colors ${selectedCategory === c.id ? 'text-[#C8A84B]' : 'text-gray-100 group-hover:text-[#1B3A4B]/20'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest">{c.label}</span>
             </button>
           ))}
         </div>
      </div>

      {/* STEP 2: DETAILS */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
            <div className="max-w-3xl mx-auto space-y-10">
               <h3 className="text-xl font-heading font-black text-[#1B3A4B] text-center flex items-center justify-center gap-4">
                 <span className="w-10 h-10 rounded-full bg-[#1B3A4B] text-white flex items-center justify-center text-sm shadow-xl">2</span>
                 Describe the Grievance
               </h3>
               
               <div className="bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 space-y-8 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Megaphone size={140} className="text-[#1B3A4B]" />
                 </div>
                 
                 <div className="relative">
                   <textarea 
                     className="w-full p-8 bg-gray-50 border-2 border-transparent focus:border-[#1B3A4B] rounded-2xl outline-none font-medium text-[#1B3A4B] min-h-[220px] resize-none text-xl shadow-inner leading-relaxed"
                     placeholder="State your complaint clearly: What, When, Where..."
                     value={complaint}
                     onChange={(e) => setComplaint(e.target.value)}
                   />
                   <button 
                     onClick={handleVoice} 
                     className={`absolute bottom-6 right-6 p-5 rounded-2xl shadow-xl transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 hover:text-[#1B3A4B]'}`}
                   >
                     <Mic size={28} />
                   </button>
                 </div>
                 
                 <button 
                   onClick={handleSubmit}
                   disabled={loading || !complaint.trim()}
                   className="premium-btn w-full py-6 text-xl"
                 >
                   {loading ? <RefreshCw size={24} className="animate-spin" /> : <Sparkles size={24} className="text-[#C8A84B]" />}
                   {loading ? 'Analyzing Grievance...' : 'Generate Official Roadmap'}
                 </button>
               </div>
            </div>

            {/* RESULT */}
            {result && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} ref={resultRef} className="max-w-4xl mx-auto">
                 <div className="premium-card">
                   <div className="bg-[#1B3A4B] -mx-10 -mt-10 p-10 mb-10 text-white flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <ShieldCheck size={32} className="text-[#C8A84B]" />
                        <h3 className="text-3xl font-heading font-black">Official Grievance Roadmap</h3>
                      </div>
                      <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">AI Audited Path</div>
                   </div>
                   
                   <div className="prose prose-xl max-w-none text-[#1B3A4B]" dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }} />
                   
                   <div className="mt-16 pt-12 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-sm"><Phone size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase text-gray-400 italic">Emergency Services</p><p className="text-xl font-black text-[#1B3A4B]">Dial 112</p></div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#1B3A4B] shadow-sm"><Search size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase text-gray-400 italic">Central Portal</p><p className="text-xl font-black text-[#1B3A4B]">pgportal.gov.in</p></div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#C8A84B] shadow-sm"><MapPin size={24} /></div>
                        <div><p className="text-[10px] font-black uppercase text-gray-400 italic">Jurisdiction</p><p className="text-xl font-black text-[#1B3A4B]">Dist. Collector</p></div>
                      </div>
                   </div>
                 </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedCategory && (
        <div className="text-center py-32 opacity-20">
          <Info size={64} className="mx-auto mb-8 text-gray-300" />
          <p className="text-xl font-black uppercase tracking-widest text-[#1B3A4B]">Select a category to Begin Audit</p>
        </div>
      )}
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/## (.*)/g, '<h3 class="font-heading font-black text-[#1B3A4B] mt-12 mb-6 text-2xl border-b border-gray-50 pb-4">$1</h3>')
    .replace(/### (.*)/g, '<h4 class="font-heading font-black text-[#C8A84B] mt-8 mb-4 text-xl">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#1B3A4B]">$1</strong>')
    .replace(/- (.*)/g, '<li class="ml-8 mb-3 text-gray-700 list-disc font-medium">$1</li>')
    .split('\n\n').join('</div><div class="mb-6">')
    .split('\n').join('<br/>');
}
