import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, X, Globe, Search, ChevronDown, 
  Scale, FileText, Vote, Users, Megaphone, 
  MapPin, ClipboardList, MessageSquare, 
  ShieldCheck, Info, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modules
import LandingPage from './modules/LandingPage';
import ConflictMediator from './modules/ConflictMediator';
import PolicyExplainer from './modules/PolicyExplainer';
import VoterAwareness from './modules/VoterAwareness';
import CommunityDiscussion from './modules/CommunityDiscussion';
import GrassrootsOrganizer from './modules/GrassrootsOrganizer';
import LeaderFinder from './modules/LeaderFinder';
import SchemeFinder from './modules/SchemeFinder';
import ComplaintGuide from './modules/ComplaintGuide';
import EthicsModal from './components/EthicsModal';
import LanguageSelectionModal from './components/LanguageSelectionModal';
import CivicBot from './components/CivicBot';

const ALL_MODULES = [
  { id: 'landing', translationKey: 'landing.title', icon: null },
  { id: 'conflict', translationKey: 'modules.conflict.title', icon: Scale },
  { id: 'policy', translationKey: 'modules.policy.title', icon: FileText },
  { id: 'voter', translationKey: 'modules.voter.title', icon: Vote },
  { id: 'community', translationKey: 'modules.community.title', icon: Users },
  { id: 'grassroots', translationKey: 'modules.grassroots.title', icon: Megaphone },
  { id: 'leaders', translationKey: 'modules.leaders.title', icon: MapPin },
  { id: 'schemes', translationKey: 'modules.schemes.title', icon: ClipboardList },
  { id: 'complaint', translationKey: 'modules.complaint.title', icon: MessageSquare },
];

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeModule, setActiveModule] = useState('landing');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHowYouKnowOpen, setIsHowYouKnowOpen] = useState(false);
  const [showEthics, setShowEthics] = useState(false);
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [apiKey] = useState(() => localStorage.getItem('civicai-api-key') || '');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // For the hackathon demo, ALWAYS show the language selection modal on refresh!
    setShowLangSelect(true);
    
    const savedLang = localStorage.getItem('civicai-language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
    const hasSeenEthics = localStorage.getItem('civicai-ethics-seen');
    if (!hasSeenEthics) setShowEthics(true);
  }, []);

  const handleLanguageSelect = (lang) => {
    i18n.changeLanguage(lang.code);
    localStorage.setItem('civicai-language', lang.code);
    setShowLangSelect(false);
  };

  const handleAcceptEthics = () => {
    localStorage.setItem('civicai-ethics-seen', 'true');
    setShowEthics(false);
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleModuleSwitch = (id) => {
    setActiveModule(id);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const renderModule = () => {
    const props = { onNavigate: handleModuleSwitch, language: i18n.language, showToast, apiKey };
    switch (activeModule) {
      case 'landing': return <LandingPage {...props} />;
      case 'conflict': return <ConflictMediator {...props} />;
      case 'policy': return <PolicyExplainer {...props} />;
      case 'voter': return <VoterAwareness {...props} />;
      case 'community': return <CommunityDiscussion {...props} />;
      case 'grassroots': return <GrassrootsOrganizer {...props} />;
      case 'leaders': return <LeaderFinder {...props} />;
      case 'schemes': return <SchemeFinder {...props} />;
      case 'complaint': return <ComplaintGuide {...props} />;
      default: return <LandingPage {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-body flex flex-col">
      {/* Language Selection — shown first on new visit */}
      <AnimatePresence>{showLangSelect && <LanguageSelectionModal onSelect={handleLanguageSelect} />}</AnimatePresence>

      <AnimatePresence>{showEthics && <EthicsModal onAccept={handleAcceptEthics} />}</AnimatePresence>

      {/* TOP BAR */}
      <div className="bg-[#1B3A4B] text-white py-3 px-6 md:px-12 flex justify-between items-center text-xs font-black uppercase tracking-widest relative z-[100]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#C8A84B]" />
            <span className="hidden sm:inline">An official AI-powered civic platform</span>
            <span className="sm:hidden">Official AI Portal</span>
          </div>
          <button onClick={() => setIsHowYouKnowOpen(!isHowYouKnowOpen)} className="flex items-center gap-1 text-white/70 hover:text-white">
            How you know <ChevronDown size={14} className={`transition-transform ${isHowYouKnowOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex border border-white/20 rounded-full overflow-hidden">
            <button 
              onClick={() => i18n.changeLanguage('en-IN')}
              className={`px-4 py-1.5 transition-all ${i18n.language === 'en-IN' ? 'bg-[#C8A84B] text-[#1B3A4B]' : 'hover:bg-white/10'}`}
            >
              EN
            </button>
            <button 
              onClick={() => i18n.changeLanguage('hi-IN')}
              className={`px-4 py-1.5 transition-all ${i18n.language === 'hi-IN' ? 'bg-[#C8A84B] text-[#1B3A4B]' : 'hover:bg-white/10'}`}
            >
              हिन्दी
            </button>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 hover:text-[#C8A84B]"><Menu size={14} /> Services</button>
          <button className="flex items-center gap-2 hover:text-[#C8A84B]"><Search size={14} /> Search</button>
        </div>

        <AnimatePresence>
          {isHowYouKnowOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-full bg-white text-[#1B3A4B] p-10 card-shadow border-b border-gray-200 z-[99]">
              <div className="container mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 normal-case tracking-normal">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-2xl">🏛️</div>
                  <div>
                    <h4 className="font-black text-base mb-2">Official domains use .gov</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Government websites end in .gov. Before sharing sensitive information, make sure you're on a secure site.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-2xl">🔒</div>
                  <div>
                    <h4 className="font-black text-base mb-2">Secure connections only</h4>
                    <p className="text-sm text-gray-500 leading-relaxed"><strong>HTTPS</strong> ensures that you are connecting to the official website and your information is encrypted.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 py-8 px-6 md:px-12 sticky top-0 z-[90] shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => setSidebarOpen(true)} className="p-3 hover:bg-gray-50 rounded-xl">
            <Menu size={28} className="text-[#1B3A4B]" />
          </button>
          <div className="flex flex-col items-center cursor-pointer group" onClick={() => handleModuleSwitch('landing')}>
            <img src="/civicai_gold_dome_logo_icon_1775930578212.png" alt="Logo" className="h-12 w-auto mb-2 group-hover:scale-110 transition-transform" />
            <h1 className="text-3xl font-heading font-black tracking-tighter text-[#1B3A4B]">CivicAI</h1>
          </div>
          <div className="hidden xl:flex items-center gap-8">
            {ALL_MODULES.slice(1).map(item => (
              <button key={item.id} onClick={() => handleModuleSwitch(item.id)} className={`text-xs font-black uppercase tracking-widest hover:text-[#C8A84B] transition-all relative py-2 ${activeModule === item.id ? 'text-[#C8A84B]' : 'text-[#1B3A4B]'}`}>
                {t(item.translationKey)}
                {activeModule === item.id && <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 w-full h-1 bg-[#C8A84B]" />}
              </button>
            ))}
          </div>
          <button className="hidden sm:block text-xs font-black uppercase tracking-widest text-[#1B3A4B] border-2 border-[#1B3A4B] px-6 py-3 hover:bg-[#1B3A4B] hover:text-white transition-all rounded-lg">Sign In</button>
        </div>
      </header>

      {/* ALERT BANNER */}
      <div className="bg-[#FFF3CD] border-b border-[#FFEEBA] py-4 px-6 text-center">
        <p className="text-xs font-black text-[#856404] uppercase tracking-widest flex items-center justify-center gap-3">
          <Info size={16} /> Non-Partisan AI: Insights do not represent government opinions.
        </p>
      </div>

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-[#1B3A4B]/50 backdrop-blur-sm z-[200]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-96 bg-white z-[210] shadow-2xl flex flex-col p-10">
              <div className="flex justify-between items-center mb-12 pb-6 border-b border-gray-100">
                <span className="text-2xl font-heading font-black text-[#1B3A4B]">CivicAI Services</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={28} className="text-gray-400" /></button>
              </div>
              <div className="space-y-4 flex-grow overflow-y-auto pr-4 custom-scrollbar">
                <p className="text-[11px] uppercase font-black text-gray-400 tracking-widest mb-6">Explore Civic Tools</p>
                {ALL_MODULES.map(item => (
                  <button key={item.id} onClick={() => handleModuleSwitch(item.id)} className={`w-full flex items-center gap-5 p-5 rounded-xl transition-all ${activeModule === item.id ? 'bg-[#1B3A4B] text-white shadow-xl' : 'hover:bg-gray-50 text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeModule === item.id ? 'bg-white/10' : 'bg-gray-100'}`}>
                      {item.icon ? <item.icon size={20} className={activeModule === item.id ? 'text-[#C8A84B]' : 'text-[#1B3A4B]'} /> : '🏠'}
                    </div>
                    <span className="font-black text-base italic">{t(item.translationKey)}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-grow fade-in">{renderModule()}</main>

      <footer className="bg-white border-t border-gray-200 py-24 px-6 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-20">
            <div className="md:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <img src="/civicai_gold_dome_logo_icon_1775930578212.png" alt="Logo" className="h-10 w-auto" />
                <h2 className="text-3xl font-heading font-black text-[#1B3A4B]">CivicAI</h2>
              </div>
              <p className="text-base text-gray-500 leading-loose max-w-md italic font-medium">Empowering every citizen with transparent, neutral, and fair AI-driven governance tools for a stronger democracy.</p>
            </div>
            <div className="space-y-8">
              <h4 className="text-xs uppercase font-black text-gray-400 tracking-widest">Resources</h4>
              <ul className="space-y-4 font-bold text-[#1B3A4B]">
                <li className="hover:underline cursor-pointer flex items-center gap-2 text-sm">Contact Us <ExternalLink size={14} className="text-gray-300" /></li>
                <li className="hover:underline cursor-pointer flex items-center gap-2 text-sm">Data Ethics <ExternalLink size={14} className="text-gray-300" /></li>
                <li className="hover:underline cursor-pointer flex items-center gap-2 text-sm">Transparency Hub <ExternalLink size={14} className="text-gray-300" /></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-xs uppercase font-black text-gray-400 tracking-widest">Connect</h4>
              <div className="flex gap-4"><div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-[#C8A84B] transition-colors cursor-pointer text-gray-400 hover:text-white">𝕏</div><div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-[#C8A84B] transition-colors cursor-pointer text-gray-400 hover:text-white">in</div></div>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className={`fixed bottom-10 right-10 z-[300] p-6 rounded-2xl shadow-2xl flex items-center gap-4 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#1B3A4B] text-[#C8A84B]'}`}>
            <span className="text-2xl">{toast.type === 'error' ? '⚠️' : 'ℹ️'}</span>
            <span className="font-black text-sm tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CivicBot — Floating AI Guide */}
      {!showLangSelect && (
        <CivicBot
          language={i18n.language}
          onNavigate={handleModuleSwitch}
          showToast={showToast}
        />
      )}
    </div>
  );
}
