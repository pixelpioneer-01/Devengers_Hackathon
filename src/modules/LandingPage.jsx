import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Scale, FileText, Vote, Users, Megaphone, ArrowRight } from 'lucide-react';

const TOP_TOOLS = [
  { id: 'conflict', icon: Scale, translationKey: 'modules.conflict' },
  { id: 'policy', icon: FileText, translationKey: 'modules.policy' },
  { id: 'voter', icon: Vote, translationKey: 'modules.voter' },
  { id: 'community', icon: Users, translationKey: 'modules.community' },
  { id: 'grassroots', icon: Megaphone, translationKey: 'modules.grassroots' },
];

export default function LandingPage({ onNavigate, language, showToast }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col fade-in">
      {/* HERO SECTION */}
      <section className="relative h-[650px] md:h-[600px] flex items-center overflow-hidden">
        {/* Left: Phote of Parliament with Teal Overlay */}
        <div className="absolute inset-0 md:w-2/3 h-full overflow-hidden">
          <img 
            src="/civicai_hero_parliament_1775930519184.png" 
            alt="Indian Parliament" 
            className="w-full h-full object-cover scale-105"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1471'; }} 
          />
          <div className="absolute inset-0 bg-[#1B3A4B]/70 mix-blend-multiply"></div>
        </div>
        
        {/* Right Content / Card Floating */}
        <div className="container mx-auto px-4 md:px-12 relative z-10 flex flex-col md:flex-row items-center h-full">
          <div className="md:w-1/2 hidden md:block"></div>
          <div className="md:w-1/2 flex justify-center md:justify-end py-12">
            <div className="bg-white p-8 md:p-12 card-shadow max-w-lg -mt-20 md:mt-0 relative">
              <span className="text-[10px] uppercase tracking-widest font-black text-[#C8A84B] mb-4 block">{t('landing.tagline')}</span>
              <h1 className="text-5xl font-heading font-black mb-6 text-[#1B3A4B] leading-tight">{t('landing.welcome')}</h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                {t('landing.heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => onNavigate('conflict')}
                  className="btn-outline flex items-center justify-center gap-2 group"
                >
                  {t('landing.exploreTools')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => onNavigate('conflict')}
                  className="btn-primary"
                >
                  {t('landing.startMediating')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT GRID: TOP TOOLS & NEWS */}
      <section className="bg-white py-20 px-4 md:px-12">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* LEFT: TOP TOOLS */}
            <div className="lg:w-7/12">
              <h2 className="text-3xl font-heading font-black mb-2 text-[#1B3A4B]">{t('landing.topToolsTitle')}</h2>
              <div className="w-12 h-1 bg-[#C8A84B] mb-10"></div>
              
              <div className="flex flex-col gap-4">
                {TOP_TOOLS.map((tool) => (
                  <button 
                    key={tool.id}
                    onClick={() => onNavigate(tool.id)}
                    className="flex items-center gap-6 p-6 border border-gray-100 rounded-lg hover:border-[#1B3A4B] hover:shadow-lg transition-all text-left bg-gray-50/50 group"
                  >
                    <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center card-shadow flex-shrink-0 group-hover:bg-[#1B3A4B] transition-colors">
                      <tool.icon className="w-7 h-7 text-[#1B3A4B] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-[#1B3A4B] mb-1">{t(`${tool.translationKey}.title`)}</h3>
                      <p className="text-sm text-gray-500">{t(`${tool.translationKey}.subtitle`)}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#C8A84B] group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: NEWS / HIGHLIGHTS */}
            <div className="lg:w-5/12">
              <div className="bg-[#FAF0E6] p-10 rounded-lg h-full border border-[#EDE1D5] flex flex-col">
                <h2 className="text-3xl font-heading font-black mb-2 text-[#1B3A4B]">{t('landing.newsTitle')}</h2>
                <p className="text-xs uppercase tracking-widest font-bold text-[#C8A84B] mb-8">{t('landing.newsTagline')}</p>
                
                <div className="rounded-lg overflow-hidden card-shadow mb-8 aspect-video relative group">
                  <img 
                    src="/legislature_hall_interior_1775930542988.png" 
                    alt="Legislature news" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541872703-74c5e443d1f5?auto=format&fit=crop&q=80&w=1500'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                <div className="flex flex-col gap-4 flex-grow">
                  <span className="text-xs font-bold px-2 py-1 bg-[#1B3A4B] text-white w-fit rounded uppercase tracking-widest">{t('landing.newsCategory')}</span>
                  <h3 className="text-2xl font-heading font-black leading-tight text-[#1B3A4B]">
                    {t('landing.newsHighlightTitle')}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{t('landing.newsHighlightDesc')}"
                  </p>
                  <div className="h-px bg-black/10 my-4"></div>
                  <button className="text-[#1B3A4B] font-bold flex items-center gap-2 hover:translate-x-2 transition-transform text-xs uppercase tracking-widest">
                    {t('landing.readFullBreakdown')} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ADDITIONAL TOOLS MINI GRID */}
      <section className="bg-gray-50 py-16 px-4 md:px-12 border-t border-gray-200">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-sm uppercase tracking-widest font-black text-gray-400 mb-8 text-center">{t('landing.moreServices')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <button onClick={() => onNavigate('leaders')} className="bg-white p-6 rounded-lg text-center card-shadow hover:-translate-y-1 transition-all border border-transparent hover:border-[#C8A84B]">
              <span className="text-3xl mb-2 block">📍</span>
              <span className="font-bold text-[#1B3A4B]">{t('modules.leaders.title')}</span>
            </button>
            <button onClick={() => onNavigate('schemes')} className="bg-white p-6 rounded-lg text-center card-shadow hover:-translate-y-1 transition-all border border-transparent hover:border-[#C8A84B]">
              <span className="text-3xl mb-2 block">📋</span>
              <span className="font-bold text-[#1B3A4B]">{t('modules.schemes.title')}</span>
            </button>
            <button onClick={() => onNavigate('complaint')} className="bg-white p-6 rounded-lg text-center card-shadow hover:-translate-y-1 transition-all border border-transparent hover:border-[#C8A84B]">
              <span className="text-3xl mb-2 block">📢</span>
              <span className="font-bold text-[#1B3A4B]">{t('modules.complaint.title')}</span>
            </button>
            <button onClick={() => onNavigate('voter')} className="bg-white p-6 rounded-lg text-center card-shadow hover:-translate-y-1 transition-all border border-transparent hover:border-[#C8A84B]">
              <span className="text-3xl mb-2 block">🤝</span>
              <span className="font-bold text-[#1B3A4B]">{t('modules.voter.title')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
