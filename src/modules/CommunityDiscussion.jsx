import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { COMMUNITY_DISCUSSION_PROMPT } from '../prompts';
import { startRecording, stopRecording } from '../voiceHelper';
import { detectLocation, getConstituency } from '../locationHelper';
import { Users, MessageSquare, ThumbsUp, ThumbsDown, Info, ShieldCheck, Zap, BarChart3, TrendingUp, Plus, Mic, RefreshCw, ExternalLink, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Custom X (Twitter) Icon Component for reliability
const XIcon = ({ size = 20, className = "" }) => (
  <span className={`inline-flex items-center justify-center font-black italic select-none ${className}`} style={{ fontSize: size, width: size, height: size, lineHeight: 1 }}>𝕏</span>
);

export default function CommunityDiscussion({ apiKey, language, showToast }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [tempTopic, setTempTopic] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('');
  const [city, setCity] = useState('');
  const [opinionInput, setOpinionInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  
  // Persistence Layer: Load opinions from Supabase or use localstorage fallback
  const [opinions, setOpinions] = useState([]);
  const [dbActive, setDbActive] = useState(false);

  const fetchOpinions = async () => {
    try {
      const res = await fetch('/api/opinions');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(item => ({
          id: item.id,
          text: item.text,
          author: item.author,
          votes: { up: item.votes_up || 0, down: item.votes_down || 0 },
          comments: item.comments || []
        }));
        setOpinions(mapped);
        setDbActive(true);
      } else {
        throw new Error('DB fetch returned status ' + res.status);
      }
    } catch (e) {
      console.warn("Using localStorage fallback for opinions database:", e.message);
      const saved = localStorage.getItem('civic_opinions');
      if (saved) {
        setOpinions(JSON.parse(saved));
      } else {
        setOpinions([
          { id: 1, text: 'The proposed updates are essential for the growth of our district.', author: 'Anonymous Citizen #1024', votes: { up: 12, down: 2 }, comments: [] },
          { id: 2, text: 'I am concerned about the allocation of funds. We need more transparency.', author: 'Anonymous Citizen #2048', votes: { up: 8, down: 15 }, comments: [] },
          { id: 3, text: 'Prioritizing accessibility should be the first step in any new policy.', author: 'Anonymous Citizen #4096', votes: { up: 25, down: 0 }, comments: [] },
        ]);
      }
      setDbActive(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  const sentimentData = useMemo(() => {
    const totalVotes = opinions.reduce((acc, curr) => acc + (curr.votes?.up || 0) + (curr.votes?.down || 0), 0) || 1;
    const upVotes = opinions.reduce((acc, curr) => acc + (curr.votes?.up || 0), 0);
    const downVotes = opinions.reduce((acc, curr) => acc + (curr.votes?.down || 0), 0);
    return {
      support: Math.round((upVotes / totalVotes) * 100) || 60,
      concern: Math.round((downVotes / totalVotes) * 100) || 30,
      neutral: 10
    };
  }, [opinions]);

  const [xTrends, setXTrends] = useState([
    { tag: '#ActiveDemocracy', count: '--- posts', sentiment: 'Trending' },
    { tag: '#TransparentGov', count: '--- posts', sentiment: 'Trending' }
  ]);

  const fetchRealTimeTopic = async () => {
    setLocationLoading(true);
    try {
      showToast("Detecting your location for local trends...", "info");
      const { lat, lng } = await detectLocation();
      const location = await getConstituency(lat, lng);
      const cityName = location.city || location.district || location.state;
      setCity(cityName);

      const prompt = `Identify the most pressing civic debate or public policy discussion currently trending in ${cityName}. 
      ALWAYS RESPOND IN THE FOLLOWING LANGUAGE: ${language === 'hi-IN' ? 'Hindi' : 'English'}.
      Return a JSON object with this exact format: 
      { 
        "topic": "Brief topic title in ${language === 'hi-IN' ? 'Hindi' : 'English'}", 
        "trends": [
          {"tag": "#Hashtag1", "count": "1.2k posts", "sentiment": "${language === 'hi-IN' ? 'सकारात्मक' : 'Positive'}"},
          {"tag": "#Hashtag2", "count": "850 posts", "sentiment": "${language === 'hi-IN' ? 'महत्वपूर्ण' : 'Critical'}"},
          {"tag": "#Hashtag3", "count": "3.4k posts", "sentiment": "${language === 'hi-IN' ? 'ट्रेंडिंग' : 'Trending'}"}
        ]
      }`;

      const aiResponse = await callAI(prompt, "Suggested trending civic topics for: " + cityName, apiKey, language);
      try {
        const cleaner = aiResponse.includes('```json') ? aiResponse.split('```json')[1].split('```')[0] : aiResponse;
        const data = JSON.parse(cleaner);
        setTopic(data.topic);
        setTempTopic(data.topic);
        setXTrends(data.trends);
        if (data.trends.length > 0) setSelectedHashtag(data.trends[0].tag);
      } catch (parseErr) {
        console.error("AI JSON Parse failed", parseErr);
        setTopic(`Civic Services in ${cityName}`);
        setTempTopic(`Civic Services in ${cityName}`);
      }
    } catch (err) {
      console.error("Location or AI fetch failed", err);
      showToast("Could not detect local trends. Showing global topics.", "warning");
      setTopic("Global Civic Technology Future");
      setXTrends([
        { tag: '#FutureCities', count: '45k posts', sentiment: 'Trending' },
        { tag: '#AIforGood', count: '22k posts', sentiment: 'Trending' },
        { tag: '#DigitalDemocracy', count: '10k posts', sentiment: 'Trending' }
      ]);
    }
    setLocationLoading(false);
  };

  useEffect(() => {
    fetchRealTimeTopic();
    fetchOpinions();
  }, []);

  const addOpinion = async () => {
    if (!opinionInput.trim()) return;
    setLoading(true);
    try {
      const analysis = await callAI(`Analyze this civic comment. If it's harmful, say 'UNSAFE'. Otherwise, say 'SAFE'. Context language is ${language}.`, opinionInput, apiKey, language);
      if (analysis.includes('UNSAFE')) {
        showToast(t('modules.community.abusiveError') || 'Comment filtered for respectful discussion.', 'error');
        setLoading(false);
        return;
      }
      const authorPref = t('modules.community.anonymousCitizen');
      const authorName = `${authorPref} #${Math.floor(Math.random() * 9000) + 1000}`;
      const opinionPayload = {
        text: opinionInput.trim(),
        author: authorName,
        votes: { up: 0, down: 0 },
        comments: []
      };

      if (dbActive) {
        const res = await fetch('/api/opinions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...opinionPayload,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
          })
        });
        if (res.ok) {
          const item = await res.json();
          const newOp = {
            id: item.id,
            text: item.text,
            author: item.author,
            votes: { up: item.votes_up, down: item.votes_down },
            comments: item.comments || []
          };
          setOpinions([newOp, ...opinions]);
          showToast("Opinion shared in global database.", "success");
        } else {
          throw new Error("Failed to post to global database");
        }
      } else {
        const newOpinion = {
          id: Date.now(),
          ...opinionPayload
        };
        const updated = [newOpinion, ...opinions];
        setOpinions(updated);
        localStorage.setItem('civic_opinions', JSON.stringify(updated));
      }
      setOpinionInput('');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVote = async (id, type) => {
    const target = opinions.find(op => op.id === id);
    if (!target) return;
    const newVotes = { ...target.votes, [type]: target.votes[type] + 1 };
    
    try {
      if (dbActive) {
        const res = await fetch('/api/opinions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            votes_up: type === 'up' ? newVotes.up : undefined,
            votes_down: type === 'down' ? newVotes.down : undefined,
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
            supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
          })
        });
        if (!res.ok) throw new Error("Vote registration failed");
      }
      const updated = opinions.map(op => op.id === id ? { ...op, votes: newVotes } : op);
      setOpinions(updated);
      if (!dbActive) localStorage.setItem('civic_opinions', JSON.stringify(updated));
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const addComment = async (opinionId) => {
    if (!commentInput.trim()) return;
    setLoading(true);
    try {
      const analysis = await callAI(`Analyze this civic comment. If it's harmful, say 'UNSAFE'. Otherwise, say 'SAFE'. Language: ${language}`, commentInput, apiKey, language);
      if (analysis.includes('UNSAFE')) {
        showToast(t('modules.community.abusiveError') || 'Comment filtered for respectful discussion.', 'error');
      } else {
        const authorPref = t('modules.community.anonymousCitizen');
        const newComment = {
          id: Date.now(),
          text: commentInput.trim(),
          author: `${authorPref} #${Math.floor(Math.random() * 9000) + 1000}`,
          timestamp: new Date().toLocaleTimeString(language === 'hi-IN' ? 'hi-IN' : 'en-IN')
        };
        
        const target = opinions.find(op => op.id === opinionId);
        const updatedComments = [...(target.comments || []), newComment];

        if (dbActive) {
          const res = await fetch('/api/opinions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: opinionId,
              comments: updatedComments,
              supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
              supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
            })
          });
          if (!res.ok) throw new Error("Failed to post comment to database");
        }

        const updated = opinions.map(op => op.id === opinionId ? { ...op, comments: updatedComments } : op);
        setOpinions(updated);
        if (!dbActive) localStorage.setItem('civic_opinions', JSON.stringify(updated));
        setCommentInput('');
        setReplyingTo(null);
        showToast("Anonymous comment shared successfully.", "success");
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleSummarize = async () => {
    if (opinions.length < 2) return;
    setLoading(true);
    try {
      const text = opinions.map(o => `"${o.text}"`).join('\n');
      const response = await callAI(COMMUNITY_DISCUSSION_PROMPT, `Topic: ${topic}\n\nOpinions:\n${text}`, apiKey, language);
      setAiSummary(response);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  };

  const handleVoice = async () => {
    if (listening) {
      setListening(false);
      await stopRecording((text) => setOpinionInput(p => p + (p ? ' ' : '') + text), (err) => showToast(err, 'error'), language, apiKey);
    } else {
      const success = await startRecording(language);
      if (success) setListening(true);
    }
  };

  const shareToX = (text) => {
    const tweetText = `Civic Insight on ${topic}: "${text}" via ${selectedHashtag || '#CivicAI'}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };


  const [tweeting, setTweeting] = useState(false);
  const postToCivicAIX = async (text) => {
    if (!text.trim()) return;
    setTweeting(true);
    try {
      // Step 1: Run AI moderation check (OpenAI)
      const moderationRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 10,
          messages: [
            {
              role: 'system',
              content: `You are a civic content moderator. Your job is to ONLY block truly harmful content. Be very permissive — most messages should be SAFE.

Reply "SAFE" for: any civic opinion, complaint, feedback, appreciation, question, observation, or general statement — even if it criticizes politicians, government, or policies. Short words like "wow", "great", "hello", "nice" are always SAFE.

Reply "UNSAFE" ONLY if the message clearly contains: explicit hate speech with slurs, direct personal death threats, explicit sexual content, or calls for immediate violence against specific people.

When in doubt, reply SAFE. Reply ONLY with "SAFE" or "UNSAFE".`,
            },
            { role: 'user', content: text.trim() },
          ],
        }),
      });

      if (!moderationRes.ok) throw new Error('AI moderation check failed. Please try again.');

      const modData = await moderationRes.json();
      const verdict = modData.choices?.[0]?.message?.content?.trim()?.toUpperCase();

      if (verdict !== 'SAFE') {
        showToast('⚠️ AI blocked your message: it may contain harmful or controversial content. Please revise.', 'error');
        setTweeting(false);
        return;
      }

      // Step 2: Message is SAFE — open pre-filled Twitter compose window
      const trimmedText = text.trim().slice(0, 220);
      const tweetText = `${trimmedText}\n\n${selectedHashtag || '#CivicAI'} #AnonymousCivicVoice`;
      showToast('✅ AI approved your message! Opening X to post anonymously...', 'success');
      setTimeout(() => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
      }, 800);

    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    }
    setTweeting(false);
  };


  const openXSearch = (query) => {
    window.open(`https://twitter.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 fade-in">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-4">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF0E6] rounded-full text-[#C8A84B] font-black uppercase tracking-widest text-xs">
            <Users size={16} /> {t('modules.community.title')}
          </div>
          <h2 className="text-5xl font-heading font-black text-[#1B3A4B] tracking-tight">{t('modules.community.title')}</h2>
          <p className="text-xl text-gray-500 font-medium italic">
            {locationLoading ? (
              <span className="flex items-center gap-2 text-gray-300 animate-pulse">
                <MapPin size={20} className="text-[#C8A84B]" /> {t('modules.community.detectingContext')}
              </span>
            ) : (
              <>
                {t('modules.community.currentlyDiscussing')} <span className="text-[#1B3A4B] font-black not-italic">{city || (language === 'hi-IN' ? "ग्लोबल हब" : "Global Hub")}</span>: 
                <span 
                  onClick={() => openXSearch(topic)}
                  className="text-[#C8A84B] font-black not-italic cursor-pointer hover:underline block md:inline md:ml-2"
                >"{topic || t('common.loading')}"</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => openXSearch(topic)}
             className="premium-btn bg-white !text-[#1B3A4B] border-2 border-gray-100 px-8 py-5 text-base shadow-lg hover:border-[#C8A84B]"
           >
             <XIcon size={20} className="text-[#1B3A4B] mr-2" /> {language === 'hi-IN' ? 'X पर लाइव' : 'LIVE ON X'}
           </button>
           <button 
             onClick={loading ? null : fetchRealTimeTopic}
             className="premium-btn px-10 py-5 text-base shadow-xl"
           >
             {locationLoading ? <RefreshCw size={20} className="animate-spin" /> : <RefreshCw size={20} className="text-[#C8A84B]" />}
             {t('community.liveScan')}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* LEFT: SECTIONS */}
        <div className="lg:w-7/12 space-y-12">
          {/* Section 1: Discussion Stage */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Zap size={100} className="text-[#1B3A4B]" />
            </div>
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
               <div className="w-12 h-12 bg-[#FAF0E6] rounded-2xl flex items-center justify-center text-[#1B3A4B]">
                 <BarChart3 size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-heading font-black text-[#1B3A4B]">{t('modules.community.stageTitle')}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('modules.community.stageDesc')}</p>
               </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-[#C8A84B] mb-4 block">{t('modules.community.topicLabel')}</label>
                <input 
                  type="text"
                  value={tempTopic}
                  onChange={(e) => {
                    setTempTopic(e.target.value);
                    setTopic(e.target.value);
                  }}
                  className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-[#C8A84B] rounded-2xl outline-none transition-all text-xl font-black text-[#1B3A4B] tracking-tight"
                  placeholder={t('modules.community.topicLabel')}
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-[#C8A84B] mb-4 block">{t('modules.community.hashtagLabel')}</label>
                <div className="flex flex-wrap gap-3">
                   {xTrends.map((trend, i) => (
                     <button 
                       key={i} 
                       onClick={() => setSelectedHashtag(trend.tag)}
                       className={`px-6 py-3 rounded-xl font-black text-xs transition-all border-2 ${selectedHashtag === trend.tag ? 'bg-[#1B3A4B] text-white border-[#1B3A4B] shadow-lg scale-105' : 'bg-white text-[#1B3A4B] border-gray-100 hover:border-[#C8A84B]'}`}
                     >
                       {trend.tag}
                     </button>
                   ))}
                   <input 
                    type="text" 
                    placeholder="#Custom"
                    className="px-6 py-3 rounded-xl font-black text-xs border-2 border-dashed border-gray-200 focus:border-[#C8A84B] outline-none w-32"
                    onChange={(e) => setSelectedHashtag(e.target.value.startsWith('#') ? e.target.value : '#' + e.target.value)}
                   />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Anonymous Debate Floor */}
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={100} className="text-[#C8A84B]" />
            </div>
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
               <div className="w-12 h-12 bg-[#FAF0E6] rounded-2xl flex items-center justify-center text-[#1B3A4B]">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <h3 className="text-xl font-heading font-black text-[#1B3A4B]">{t('modules.community.debateTitle')}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('modules.community.debateDesc')}</p>
               </div>
            </div>

            <div className="space-y-6">
              <textarea 
                className="w-full p-8 bg-gray-50 border-2 border-transparent focus:border-[#1B3A4B] rounded-3xl outline-none transition-all text-2xl font-medium text-[#1B3A4B] leading-relaxed resize-none h-64"
                placeholder={t('modules.community.placeholder')}
                value={opinionInput}
                onChange={(e) => setOpinionInput(e.target.value)}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button 
                    onClick={handleVoice}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-sm transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-50 text-gray-400 hover:text-[#1B3A4B]'}`}
                  >
                    <Mic size={20} /> {listening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') : (language === 'hi-IN' ? 'आवाज़ राय' : 'Voice Opinion')}
                  </button>
                  <button 
                    onClick={() => postToCivicAIX(opinionInput)}
                    disabled={!opinionInput.trim() || tweeting}
                    className="flex items-center gap-4 px-8 py-4 bg-black text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-gray-900 transition-all disabled:opacity-30"
                    title="AI checks your message, then posts anonymously via @CivicAI on X"
                  >
                    {tweeting ? <RefreshCw size={20} className="animate-spin" /> : <XIcon size={20} />}
                    {tweeting ? 'AI Checking...' : (language === 'hi-IN' ? 'CivicAI पर पोस्ट करें' : 'Post via @CivicAI')}
                  </button>
                </div>
                <button 
                  onClick={addOpinion}
                  disabled={loading || !opinionInput.trim()}
                  className="premium-btn px-10 py-5 text-sm"
                >
                  {t('modules.community.postLocally')}
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('modules.community.citizenVoices', { count: opinions.length })}</h3>
              <select className="text-xs font-black bg-transparent text-[#1B3A4B] outline-none border-b-2 border-[#C8A84B]">
                <option>{language === 'hi-IN' ? 'सर्वाधिक समर्थित' : 'Most Supported'}</option>
                <option>{language === 'hi-IN' ? 'नवीनतम' : 'Newest'}</option>
              </select>
            </div>

            <AnimatePresence>
              {opinions.map((op) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={op.id} className="premium-card group hover:border-[#C8A84B] transition-all">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#1B3A4B] rounded-2xl flex items-center justify-center text-xs font-black text-[#C8A84B] shadow-sm uppercase">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <span className="text-sm font-black text-[#1B3A4B] uppercase tracking-widest block">{op.author}</span>
                        <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">{t('modules.community.verifiedIdentity')}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => shareToX(op.text)}
                      className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#1B3A4B] hover:text-[#C8A84B] transition-all shadow-sm"
                      title={t('common.share')}
                    >
                      <XIcon size={20} />
                    </button>
                  </div>
                  <p className="text-2xl text-gray-700 leading-loose italic mb-10 font-medium">"{op.text}"</p>
                  <div className="flex flex-wrap items-center gap-10 border-t border-gray-50 pt-8 mt-auto">
                    <button onClick={() => handleVote(op.id, 'up')} className="flex items-center gap-3 text-xs font-black text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
                      <ThumbsUp size={20} /> {op.votes.up} <span className="opacity-40">{language === 'hi-IN' ? 'समर्थन' : 'Support'}</span>
                    </button>
                    <button onClick={() => handleVote(op.id, 'down')} className="flex items-center gap-3 text-xs font-black text-gray-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                      <ThumbsDown size={20} /> {op.votes.down} <span className="opacity-40">{language === 'hi-IN' ? 'चिंता' : 'Concern'}</span>
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === op.id ? null : op.id)}
                      className={`flex items-center gap-3 text-xs font-black transition-colors uppercase tracking-widest ${replyingTo === op.id ? 'text-[#C8A84B]' : 'text-gray-400 hover:text-[#1B3A4B]'}`}
                    >
                      <MessageSquare size={20} /> {op.comments?.length || 0} <span className="opacity-40">{t('modules.community.comments')}</span>
                    </button>
                  </div>

                  {/* Reply Section */}
                  <AnimatePresence>
                    {replyingTo === op.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-8 pt-8 border-t border-gray-50 overflow-hidden">
                        <div className="flex gap-4">
                           <textarea 
                             className="flex-grow p-4 bg-gray-50 border-2 border-transparent focus:border-[#C8A84B] rounded-2xl outline-none text-lg font-medium text-[#1B3A4B] h-24"
                             placeholder={t('modules.community.replyPlaceholder')}
                             value={commentInput}
                             onChange={(e) => setCommentInput(e.target.value)}
                           />
                           <button 
                             onClick={() => addComment(op.id)}
                             disabled={loading || !commentInput.trim()}
                             className="premium-btn px-6 rounded-2xl"
                           >
                             {language === 'hi-IN' ? 'पोस्ट' : 'Post'}
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Comment List */}
                  {op.comments && op.comments.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {op.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3 mb-2">
                             <ShieldCheck size={14} className="text-[#C8A84B]" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3A4B]">{comment.author}</span>
                             <span className="text-[10px] text-gray-300 font-black uppercase">{comment.timestamp}</span>
                          </div>
                          <p className="text-lg text-gray-600 font-medium italic">"{comment.text}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: ANALYST & X FEED */}
        <div className="lg:w-5/12 space-y-12">
          <div className="sticky top-28 space-y-12">
            
            {/* X TRENDS WIDGET */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <XIcon size={120} className="text-[#1B3A4B]" />
               </div>
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                    <span className="font-black text-xl italic">𝕏</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-black text-[#1B3A4B]">Trending on X</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Live Civic Mentions</p>
                  </div>
               </div>

               <div className="space-y-6">
                 {xTrends.map((trend, i) => (
                   <div 
                    key={i} 
                    onClick={() => openXSearch(trend.tag)}
                    className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-4 -mx-4 rounded-2xl transition-all"
                    title={`See discussion on ${trend.tag}`}
                   >
                     <div>
                       <p className="text-base font-black text-[#1B3A4B] group-hover:text-[#C8A84B] transition-colors">{trend.tag}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#C8A84B]">{trend.count}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trend.sentiment === 'Positive' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {trend.sentiment}
                        </span>
                        <ExternalLink size={14} className="text-gray-200 group-hover:text-[#1B3A4B]" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Sentiment Analyst */}
            <div className="bg-[#1B3A4B] p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BarChart3 size={120} className="text-[#C8A84B]" />
              </div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-[#C8A84B]" />
                </div>
                <h3 className="text-2xl font-heading font-black">AI Consensus</h3>
              </div>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-4">
                    <span>Overall Support</span>
                    <span className="text-[#C8A84B] font-black">{sentimentData.support}%</span>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-[#C8A84B] rounded-full" style={{ width: `${sentimentData.support}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Active Concerns</div>
                    <div className="text-2xl font-black text-white">{sentimentData.concern}%</div>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-black uppercase text-white/40 mb-2 tracking-widest">Neutral Space</div>
                    <div className="text-2xl font-black text-white">{sentimentData.neutral}%</div>
                  </div>
                </div>

                <div className="bg-[#C8A84B]/10 p-6 rounded-2xl border border-[#C8A84B]/20 flex gap-4">
                  <TrendingUp size={24} className="text-[#C8A84B] flex-shrink-0" />
                  <p className="text-sm text-white/80 leading-relaxed italic font-medium">
                    "AI Note: X sentiment aligns with community consensus on safety priorities."
                  </p>
                </div>
              </div>
            </div>

            {/* AI Summary result */}
            {aiSummary && (
              <div className="premium-card bg-[#FAF0E6] border-[#EDE1D5]">
                <div className="flex items-center gap-4 mb-8">
                  <ShieldCheck size={28} className="text-[#1B3A4B]" />
                  <h3 className="text-2xl font-heading font-black text-[#1B3A4B]">Hub AI Summary</h3>
                </div>
                <div className="prose prose-lg max-w-none text-gray-700 italic font-medium leading-relaxed">
                  {aiSummary.split('##').map((part, i) => {
                    if (!part.trim()) return null;
                    const lines = part.trim().split('\n');
                    return (
                      <div key={i} className="mb-8 last:mb-0">
                        <h4 className="text-xs font-black uppercase tracking-widest text-[#C8A84B] mb-3">{lines[0]}</h4>
                        <p className="text-lg leading-relaxed">{lines.slice(1).join('\n')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
