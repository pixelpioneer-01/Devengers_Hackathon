import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { callAI } from '../claudeAPI';
import { BIAS_CHECK_PROMPT } from '../prompts';
import { startRecording, stopRecording } from '../voiceHelper';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ============================
// Sama-Inspired ODR System Prompts
// ============================

const ODR_PROMPTS = {
  conciliation: `You are an AI Conciliator trained on ODR (Online Dispute Resolution) principles used by India's leading platforms like Sama (34 lakh+ disputes resolved).
Your role is to actively propose fair solutions.

Process:
1. Acknowledge both parties' core concerns in 2 sentences each.
2. Identify the single most important overlapping interest.
3. Propose a SPECIFIC, ACTIONABLE settlement (not vague advice).
4. Frame it as: "I suggest the following resolution..."
5. Ask both parties: "Do you find this acceptable?"

Rules:
- Be solution-forward, not just analytical
- Propose concrete steps (dates, amounts, actions)
- Never take sides, but do take initiative
- If the dispute involves money, suggest a specific figure
- Keep legal jargon minimal — use plain language

Format your response with clear headers using ## and ###.`,

  mediation: `You are an AI Mediator trained on the principles of facilitative mediation used in Indian Online Dispute Resolution (ODR).
Your role is to FACILITATE, not decide.

Process:
1. Restate each party's position using their own words.
2. Identify the underlying INTERESTS (not positions) of each party.
   Example: "You said you want Rs 5000 back. What's important to you underneath that — the money, or feeling respected?"
3. Find common ground between the underlying interests.
4. Ask guiding questions that help parties discover their own solution.
5. If they agree: help them articulate the exact terms.

Rules:
- Ask questions more than you make statements
- Never suggest a solution until both parties are stuck
- Validate emotions without reinforcing blame
- End with: "What would each of you need to feel this is resolved?"

Format your response with clear headers using ## and ###.`,

  arbitration: `You are an AI Arbitrator trained on principles from the Arbitration and Conciliation Act, 1996 (India) and Sama's ODR rules.
Your role is to hear both sides and issue a structured Award.

Process:
1. State the core issue as a question: "The question before me is..."
2. Summarize Party A's evidence and claims.
3. Summarize Party B's evidence and claims.
4. Apply a fairness standard: "Considering the facts presented..."
5. Issue an Award with numbered findings:
   Finding 1: [factual finding]
   Finding 2: [factual finding]
   Award: [specific resolution]
6. Add: "This AI Award is non-binding. For a legally enforceable award, parties may approach a registered arbitrator or Sama (sama.live)."

Rules:
- Be formal and structured
- Cite the "evidence" submitted by each party
- Never base decisions on unverified claims alone
- Be clear about what is fact vs what is claimed

Format your response with clear headers using ## and ###.`,

  medarb: `You are an AI Neutral conducting Med-Arb proceedings, the method used by India's leading banks and e-commerce platforms (via Sama ODR) for efficient dispute resolution.

You MUST follow both phases:

## Phase 1 — Mediation Attempt
Attempt to help parties reach their own agreement.
- Restate each party's concerns fairly
- Identify underlying interests
- Find common ground
- Propose a framework for mutual agreement
- Ask: "Can both parties accept this framework?"

## Phase 2 — Arbitration Award
If mediation appears unlikely to succeed based on the positions:
State: "Based on the positions presented, I will now proceed to issue an Arbitration Award."
- Issue a structured Award with numbered findings
- Be specific about terms, timelines, and actions
- End with: "This AI Award is non-binding. For legally enforceable resolution, contact Sama (sama.live) or your nearest DLSA."

Format:
PHASE 1 RESULT: [Agreement framework proposed / Escalated to Arbitration]
[If escalated:]
ARBITRATION AWARD:
Having considered both parties' submissions, I find:
1. [Finding]
2. [Finding]
Award: [Resolution]`,

  lokadalat: `You are an AI facilitating a Lok Adalat-style settlement.
Lok Adalat is a traditional Indian dispute resolution forum focused on quick, amicable, voluntary settlement.

Philosophy: No winner, no loser. Both parties leave with dignity.

Process:
1. Summarize the dispute in 3 lines.
2. Identify the fastest path to settlement.
3. Propose a compromise where each party gives up something small.
4. Frame it positively: "This settlement honors both parties."
5. Generate a short settlement statement.

Keep it under 200 words. Speed is the goal.
End with: "This settlement is voluntary. For a court-backed Lok Adalat, contact your District Legal Services Authority (DLSA)."`
};

const STEPS = ['intake', 'briefing', 'submissions', 'hearing', 'settlement'];

export default function ConflictMediator({ apiKey, language, showToast }) {
  const { t } = useTranslation();

  const DISPUTE_CATEGORIES = [
    { id: 'consumer',     icon: '🛒', label: t('modules.conflict.categories.consumer.label',     'Consumer Dispute'),       desc: t('modules.conflict.categories.consumer.desc',     'Refunds, service issues, product defects'),     bestMode: 'conciliation' },
    { id: 'financial',    icon: '💰', label: t('modules.conflict.categories.financial.label',    'Financial Dispute'),       desc: t('modules.conflict.categories.financial.desc',    'Loans, payments, equity splits'),               bestMode: 'arbitration'  },
    { id: 'relationship', icon: '🤝', label: t('modules.conflict.categories.relationship.label', 'Relationship / Community'), desc: t('modules.conflict.categories.relationship.desc', 'Roommates, neighbors, community conflicts'),     bestMode: 'mediation'    },
    { id: 'workplace',    icon: '💼', label: t('modules.conflict.categories.workplace.label',    'Workplace Dispute'),       desc: t('modules.conflict.categories.workplace.desc',    'Employer–employee, harassment, reviews'),        bestMode: 'medarb'       },
    { id: 'property',     icon: '🏠', label: t('modules.conflict.categories.property.label',     'Property Dispute'),        desc: t('modules.conflict.categories.property.desc',     'Rent deposits, shared spaces, boundaries'),      bestMode: 'arbitration'  },
    { id: 'other',        icon: '📋', label: t('modules.conflict.categories.other.label',        'Other'),                   desc: t('modules.conflict.categories.other.desc',        'Any other type of dispute'),                    bestMode: 'mediation'    },
  ];

  const RESOLUTION_MODES = [
    { id: 'conciliation', icon: '🤲', label: t('modules.conflict.modes.conciliation.label', 'Conciliation'), desc: t('modules.conflict.modes.conciliation.desc', 'AI proposes a concrete solution')          },
    { id: 'mediation',    icon: '⚖️', label: t('modules.conflict.modes.mediation.label',    'Mediation'),    desc: t('modules.conflict.modes.mediation.desc',    'AI facilitates — parties decide')            },
    { id: 'arbitration',  icon: '🏛️', label: t('modules.conflict.modes.arbitration.label',  'Arbitration'),  desc: t('modules.conflict.modes.arbitration.desc',  'AI hears both sides, issues an award')       },
    { id: 'medarb',       icon: '🔄', label: t('modules.conflict.modes.medarb.label',       'Med-Arb'),      desc: t('modules.conflict.modes.medarb.desc',       'Mediation first, arbitration if needed')      },
    { id: 'lokadalat',    icon: '🕊️', label: t('modules.conflict.modes.lokadalat.label',    'Lok Adalat'),   desc: t('modules.conflict.modes.lokadalat.desc',    'Quick, dignified compromise')                },
  ];

  const [step, setStep] = useState('intake');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [concernA, setConcernA] = useState('');
  const [concernB, setConcernB] = useState('');
  const [sideA, setSideA] = useState('');
  const [sideB, setSideB] = useState('');
  const [result, setResult] = useState('');
  const [settlement, setSettlement] = useState('');
  const [biasResult, setBiasResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [biasLoading, setBiasLoading] = useState(false);
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const pdfRef = useRef(null);
  const [agreedA, setAgreedA] = useState(false);
  const [agreedB, setAgreedB] = useState(false);
  const [listeningTarget, setListeningTarget] = useState(null);

  const partyA = nameA || 'Person A';
  const partyB = nameB || 'Person B';

  const handleVoice = async (setter, target) => {
    if (listeningTarget === target) {
      setListeningTarget(null);
      await stopRecording(
        (text) => setter((prev) => prev + (prev ? ' ' : '') + text),
        (error) => {
          if (error && error !== 'aborted') {
            showToast(`${t('common.voice_error', 'Voice error')}: ${error}`, 'error');
          }
        },
        language,
        apiKey
      );
    } else {
      const success = await startRecording(language);
      if (success) {
        setListeningTarget(target);
      } else {
        showToast(t('common.mic_failed', 'Failed to access microphone'), 'error');
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    setPdfGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale: 1.5,
        backgroundColor: '#0f172a',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      const safePartyA = partyA ? partyA.replace(/[^a-zA-Z0-9]/g, '') : 'PartyA';
      const safePartyB = partyB ? partyB.replace(/[^a-zA-Z0-9]/g, '') : 'PartyB';
      const fileName = `CivicAI_Settlement_${safePartyA}_${safePartyB}.pdf`;
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(t('common.error', 'Error') + ': PDF generation failed', 'error');
    }
    setPdfGenerating(false);
  };

  const handleHearing = async () => {
    if (!sideA.trim() || !sideB.trim()) return;
    setLoading(true);
    setResult('');
    setBiasResult('');
    try {
      const prompt = ODR_PROMPTS[mode];
      const context = `Dispute Category: ${DISPUTE_CATEGORIES.find(c => c.id === category)?.label || 'General'}
Resolution Mode: ${RESOLUTION_MODES.find(m => m.id === mode)?.label || mode}

**${partyA}'s Statement:**
${sideA}

**${partyB}'s Statement:**
${sideB}

${concernA ? `**${partyA}'s pre-session concern:** ${concernA}` : ''}
${concernB ? `**${partyB}'s pre-session concern:** ${concernB}` : ''}`;

      const response = await callAI(prompt, context, apiKey, language);
      setResult(response);
    } catch (err) {
      setResult(`❌ ${t('common.error', 'Error')}: ${err.message}`);
    }
    setLoading(false);
  };

  const handleBiasCheck = async () => {
    if (!result) return;
    setBiasLoading(true);
    setBiasResult('');
    try {
      const response = await callAI(BIAS_CHECK_PROMPT, `Here is the ODR response to audit:\n\n${result}`, apiKey, language);
      setBiasResult(response);
    } catch (err) {
      setBiasResult(`❌ ${t('common.error', 'Error')}: ${err.message}`);
    }
    setBiasLoading(false);
  };

  const generateSettlement = async () => {
    if (!result) return;
    setSettlementLoading(true);
    setSettlement('');
    try {
      const prompt = `Based on the following ODR proceeding, generate a formal Settlement Summary document.

Format it EXACTLY like this:

## 📄 Settlement Summary

**Dispute Reference:** CivicAI-${Date.now().toString(36).toUpperCase()}
**Date:** ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
**Mode:** ${RESOLUTION_MODES.find(m => m.id === mode)?.label}
**Category:** ${DISPUTE_CATEGORIES.find(c => c.id === category)?.label}

### Parties
- **Party A:** ${partyA}
- **Party B:** ${partyB}

### Dispute Summary
[2-3 sentence summary of the dispute]

### Agreed Terms
1. [Specific term with action, responsible party, and timeline]
2. [Specific term]
3. [Specific term if applicable]

### Disclaimer
This summary is generated by an AI mediator and is non-binding. For a legally enforceable settlement, parties may approach:
- **Sama ODR Platform:** sama.live
- **District Legal Services Authority (DLSA)**
- A registered mediator under the Mediation Act, 2023

---
*Generated by CivicAI — AI Governance Companion*`;

      const response = await callAI(prompt, `ODR Proceeding Result:\n\n${result}`, apiKey, language);
      setSettlement(response);
      setStep('settlement');
    } catch (err) {
      showToast(`${t('common.error', 'Error')}: ${err.message}`, 'error');
    }
    setSettlementLoading(false);
  };

  const loadDemo = () => {
    setCategory('relationship');
    setMode('mediation');
    setNameA('Arjun');
    setNameB('Rohan');
    setConcernA('I feel like my concerns are always dismissed.');
    setConcernB("I'm worried I'll be seen as the bad guy.");
    setSideA("My roommate never cleans the room and always has the light on when I'm trying to sleep. I've asked multiple times but nothing changes.");
    setSideB("I clean when I have time and I study late because my schedule is different from his. He never acknowledges my contributions to shared expenses.");
    setStep('submissions');
  };

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <div className="module-container">

      {/* ── SHARED HEADER & PROGRESS STEPPER (Steps 1-5) ─────────────── */}
      <div className="module-header" style={{ marginBottom: '24px' }}>
        <div className="module-icon" style={{ fontSize: '3.5rem' }}>⚖️</div>
        <h2 style={{ margin: '0.25rem 0 0.5rem' }}>{t('modules.conflict.title', 'Conflict Mediator')}</h2>
        <p className="module-subtitle">{t('modules.conflict.subtitle', 'Fair AI-driven mediation for any dispute')}</p>
      </div>

      <div className="odr-progress">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`progress-step ${step === s ? 'active' : ''} ${i < currentStepIndex ? 'completed' : ''}`}
            onClick={() => { if (i < currentStepIndex) setStep(s); }}
          >
            <div className="step-dot">{i < currentStepIndex ? '✓' : i + 1}</div>
            <span className="step-label">{t(`modules.conflict.steps.${s}`)}</span>
          </div>
        ))}
      </div>

      {/* ── STEP 1: INTAKE — Case Filing card ───────────────── */}
      {step === 'intake' && (
        <div className="cf-card fade-in">

          {/* Card header */}
          <div className="cf-header">
            <div>
              <div className="cf-header-left">
                <div className="cf-header-icon">⚖️</div>
                <span className="cf-header-title">{t('modules.conflict.steps.intake')}</span>
              </div>
              <p className="cf-header-sub">{t('modules.conflict.subtitle', 'Select a dispute category and resolution mode to continue')}</p>
            </div>
            <div className="cf-step-badge">Step 1 of 5</div>
          </div>

          <div className="cf-divider" />

          {/* Demo shortcut */}
          <div className="cf-demo-row">
            <button className="cf-demo-btn" onClick={loadDemo}>{t('common.demo', '📋 Load demo scenario')}</button>
          </div>

          {/* Section 1 — Dispute category */}
          <p className="cf-section-label">{t('modules.conflict.category', 'Dispute category')}</p>
          <div className="cf-grid" style={{ marginBottom: '22px' }}>
            {DISPUTE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`cf-sel-card ${category === cat.id ? 'active' : ''}`}
                onClick={() => { setCategory(cat.id); if (!mode) setMode(cat.bestMode); }}
              >
                <div className="cf-icon-box">{cat.icon}</div>
                <div className="cf-card-text">
                  <span className="cf-card-title">{cat.label}</span>
                  <span className="cf-card-sub">{cat.desc}</span>
                  {category === cat.id && (
                    <span className="cf-rec-tag">✓ {RESOLUTION_MODES.find(m => m.id === cat.bestMode)?.label}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Section 2 — Resolution mode */}
          <p className="cf-section-label">{t('modules.conflict.mode', 'Resolution mode')}</p>
          <div className="cf-grid" style={{ marginBottom: '22px' }}>
            {RESOLUTION_MODES.map((m, i) => (
              <button
                key={m.id}
                className={`cf-sel-card ${mode === m.id ? 'active' : ''} ${i === RESOLUTION_MODES.length - 1 && RESOLUTION_MODES.length % 2 !== 0 ? 'cf-full-w' : ''}`}
                onClick={() => setMode(m.id)}
              >
                <div className="cf-icon-box">{m.icon}</div>
                <div className="cf-card-text">
                  <span className="cf-card-title">{m.label}</span>
                  <span className="cf-card-sub">{m.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Section 3 — Party names */}
          <div className="cf-party-label-row">
            <p className="cf-section-label" style={{ marginBottom: 0 }}>{t('modules.conflict.partyNames', 'Party names')}</p>
            <span className="cf-optional">(optional)</span>
          </div>
          <div className="cf-inputs-row">
            <input
              className="cf-input"
              type="text"
              placeholder={t('modules.conflict.partyA', 'Party A name')}
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
            />
            <input
              className="cf-input"
              type="text"
              placeholder={t('modules.conflict.partyB', 'Party B name')}
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
            />
          </div>

          {/* CTA */}
          <button
            className="cf-cta-btn"
            onClick={() => setStep('briefing')}
            disabled={!category || !mode}
          >
            {t('modules.conflict.proceedPreSession', 'Proceed to pre-session →')}
          </button>

          {/* Progress dots */}
          <div className="cf-dots">
            <div className="cf-dot cf-dot-active" />
            <div className="cf-dot" />
            <div className="cf-dot" />
          </div>

        </div>
      )}

      {/* STEP 2: PRE-SESSION BRIEFING */}
      {step === 'briefing' && (
        <div className="cf-card fade-in">
          <div className="cf-header">
            <div>
              <div className="cf-header-left">
                <div className="cf-header-icon">🛡️</div>
                <span className="cf-header-title">{t('modules.conflict.steps.briefing')}</span>
              </div>
              <p className="cf-header-sub">{t('modules.conflict.briefing.safeSpace')}</p>
            </div>
            <div className="cf-step-badge">Step 2 of 5</div>
          </div>
          <div className="cf-divider" />

          <div className="cf-grid" style={{ marginBottom: '28px' }}>
            <div className="cf-panel">
              <div className="cf-party-label-row">
                <p className="cf-section-label" style={{ marginBottom: 0 }}>{partyA} - {t('modules.conflict.briefing.concernQuestion')}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea className="cf-input" placeholder={t('modules.conflict.concernPlaceholder', { name: partyA })} value={concernA} onChange={(e) => setConcernA(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                <button className={`cf-mic-btn ${listeningTarget === 'a-concern' ? 'listening' : ''}`} onClick={() => handleVoice(setConcernA, 'a-concern')} title="Toggle Voice Input">
                  {listeningTarget === 'a-concern' ? <span className="cf-pulse"></span> : '🎤'}
                </button>
              </div>
            </div>
            <div className="cf-panel">
              <div className="cf-party-label-row">
                <p className="cf-section-label" style={{ marginBottom: 0 }}>{partyB} - {t('modules.conflict.briefing.concernQuestion')}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea className="cf-input" placeholder={t('modules.conflict.concernPlaceholder', { name: partyB })} value={concernB} onChange={(e) => setConcernB(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                <button className={`cf-mic-btn ${listeningTarget === 'b-concern' ? 'listening' : ''}`} onClick={() => handleVoice(setConcernB, 'b-concern')} title="Toggle Voice Input">
                  {listeningTarget === 'b-concern' ? <span className="cf-pulse"></span> : '🎤'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cf-btn-secondary" onClick={() => setStep('intake')}>← {t('common.back')}</button>
            <button className="cf-cta-btn" onClick={() => setStep('submissions')}>{t('common.proceed')} →</button>
          </div>
        </div>
      )}

      {/* STEP 3: PARTY SUBMISSIONS */}
      {step === 'submissions' && (
        <div className="cf-card fade-in">
          <div className="cf-header">
            <div>
              <div className="cf-header-left">
                <div className="cf-header-icon">📝</div>
                <span className="cf-header-title">{t('modules.conflict.step3Title')}</span>
              </div>
              <p className="cf-header-sub">{t('modules.conflict.step3Desc')}</p>
            </div>
            <div className="cf-step-badge">Step 3 of 5</div>
          </div>
          <div className="cf-divider" />

          <div className="cf-grid" style={{ marginBottom: '28px' }}>
            <div className="cf-panel">
              <div className="cf-party-label-row">
                <p className="cf-section-label" style={{ marginBottom: 0 }}>{t('modules.conflict.submissions.partyAStatement', { name: partyA })}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea className="cf-input" placeholder={t('modules.conflict.submissions.placeholder')} value={sideA} onChange={(e) => setSideA(e.target.value)} rows={6} style={{ resize: 'vertical' }} />
                <button className={`cf-mic-btn ${listeningTarget === 'a-sub' ? 'listening' : ''}`} onClick={() => handleVoice(setSideA, 'a-sub')} title="Toggle Voice Input">
                  {listeningTarget === 'a-sub' ? <span className="cf-pulse"></span> : '🎤'}
                </button>
              </div>
            </div>

            <div className="cf-panel">
              <div className="cf-party-label-row">
                <p className="cf-section-label" style={{ marginBottom: 0 }}>{t('modules.conflict.submissions.partyBStatement', { name: partyB })}</p>
              </div>
              <div style={{ position: 'relative' }}>
                <textarea className="cf-input" placeholder={t('modules.conflict.submissions.placeholder')} value={sideB} onChange={(e) => setSideB(e.target.value)} rows={6} style={{ resize: 'vertical' }} />
                <button className={`cf-mic-btn ${listeningTarget === 'b-sub' ? 'listening' : ''}`} onClick={() => handleVoice(setSideB, 'b-sub')} title="Toggle Voice Input">
                  {listeningTarget === 'b-sub' ? <span className="cf-pulse"></span> : '🎤'}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cf-btn-secondary" onClick={() => setStep('briefing')}>← {t('common.back')}</button>
            <button className="cf-cta-btn" onClick={() => { handleHearing(); setStep('hearing'); }} disabled={!sideA.trim() || !sideB.trim()}>
              {loading ? <span className="spinner" style={{borderColor:'white', borderTopColor:'transparent'}}></span> : t('common.proceed') + ' →'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: HEARING */}
      {step === 'hearing' && (
        <div className="cf-card fade-in">
          <div className="cf-header">
            <div>
              <div className="cf-header-left">
                <div className="cf-header-icon">🏛️</div>
                <span className="cf-header-title">{t('modules.conflict.steps.hearing')}</span>
              </div>
              <p className="cf-header-sub">{t('modules.conflict.subtitle', 'AI is analyzing Both Sides')}</p>
            </div>
            <div className="cf-step-badge">Step 4 of 5</div>
          </div>
          <div className="cf-divider" />

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '2.5rem', justifyContent: 'center', background: '#f8f9fa', borderRadius: '10px', border: '1px solid var(--border-c)', marginBottom: '28px' }}>
              <span className="spinner" style={{borderColor:'var(--purple)', borderTopColor:'transparent', width:'24px', height:'24px', borderWidth:'3px'}}></span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-c)' }}>{t('modules.conflict.hearing.analyzing', 'Analyzing both perspectives...')}</span>
            </div>
          )}

          {result && (
            <>
              <div style={{ background: '#f8f9fa', border: '1px solid var(--border-c)', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-c)' }}>📝 {t('modules.conflict.steps.hearing')} {t('common.analysis')}</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="cf-btn-secondary" onClick={handleBiasCheck} disabled={biasLoading}>
                      {biasLoading ? <span className="spinner" style={{borderColor:'var(--text-c)', borderTopColor:'transparent'}}></span> : t('modules.conflict.hearing.biasCheck', '🔍 Bias Check')}
                    </button>
                    <button className="cf-btn-action" onClick={generateSettlement} disabled={settlementLoading}>
                      {settlementLoading ? <span className="spinner" style={{borderColor:'var(--purple)', borderTopColor:'transparent'}}></span> : t('modules.conflict.hearing.genSettlement', '📄 Generate Settlement')}
                    </button>
                  </div>
                </div>
                <div className="cf-markdown" dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }} />
              </div>

              {biasResult && (
                <div style={{ background: '#fff9e6', border: '1px solid #ffeeba', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#856404' }}>🔍 {t('modules.conflict.hearing.biasCheck', 'Bias Check')} {t('common.analysis')}</h3>
                  <div className="cf-markdown" dangerouslySetInnerHTML={{ __html: formatMarkdown(biasResult) }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="cf-btn-secondary" onClick={() => setStep('submissions')}>← {t('modules.conflict.reviseSubmissions', 'Revise Submissions')}</button>
                <button className="cf-cta-btn" onClick={generateSettlement} disabled={settlementLoading}>
                  {settlementLoading ? <span className="spinner" style={{borderColor:'white', borderTopColor:'transparent'}}></span> : `${t('modules.conflict.hearing.genSettlement', '📄 Generate Settlement')} →`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 5: SETTLEMENT */}
      {step === 'settlement' && settlement && (
        <div className="cf-card fade-in">
          <div className="cf-header">
            <div>
              <div className="cf-header-left">
                <div className="cf-header-icon">📄</div>
                <span className="cf-header-title">{t('modules.conflict.step5Title')}</span>
              </div>
            </div>
            <div className="cf-step-badge">Step 5 of 5</div>
          </div>
          <div className="cf-divider" />

          <div ref={pdfRef} style={{ background: '#ffffff', padding: '32px', marginBottom: '24px', border: '1px solid var(--border-c)', borderRadius: '12px' }}>
            <div className="cf-markdown" dangerouslySetInnerHTML={{ __html: formatMarkdown(settlement) }} />
            
            {/* Signature Block for PDF */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '32px', borderTop: '2px dashed var(--border-c)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid var(--border-hover)', width: '200px', height: '40px' }}></div>
                <p style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--text-c)' }}>{t('modules.conflict.signature')}: {partyA}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('modules.conflict.date')}: _______________</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid var(--border-hover)', width: '200px', height: '40px' }}></div>
                <p style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '14px', color: 'var(--text-c)' }}>{t('modules.conflict.signature')}: {partyB}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{t('modules.conflict.date')}: _______________</p>
              </div>
            </div>
          </div>

          {/* Agreement Checkboxes */}
          <div style={{ background: '#f8f9fa', padding: '24px', marginBottom: '24px', borderRadius: '12px', border: '1px solid var(--border-c)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: 'var(--text-c)' }}>{t('modules.conflict.settlement.agreement')}</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '12px', fontSize: '14px', color: 'var(--text-c)' }}>
              <input type="checkbox" checked={agreedA} onChange={(e) => setAgreedA(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--purple)' }} />
              <span>{t('modules.conflict.submissions.partyAStatement', { name: partyA })}</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-c)' }}>
              <input type="checkbox" checked={agreedB} onChange={(e) => setAgreedB(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--purple)' }} />
              <span>{t('modules.conflict.submissions.partyBStatement', { name: partyB })}</span>
            </label>
            {agreedA && agreedB && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#e6f4ea', borderRadius: '8px', border: '1px solid #ceead6', color: '#137333', fontWeight: 600, fontSize: '13px' }}>
                ✓ {t('modules.conflict.bothAgreed')}
              </div>
            )}
          </div>

          {/* Referral Card */}
          <div style={{ background: '#eef6fc', padding: '24px', marginBottom: '24px', borderRadius: '12px', border: '1px solid #cce2f4' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#095a9d' }}>{t('modules.conflict.settlement.referralTitle')}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#1a1a2e' }}>
              <li>
                <strong>{t('modules.conflict.sama')}:</strong>{' '}
                <a href="https://sama.live" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--purple)' }}>sama.live</a> — India's leading ODR platform
              </li>
              <li>
                <strong>{t('modules.conflict.dlsa')}:</strong> Contact your nearest District Legal Services Authority for free legal aid
              </li>
              <li>
                <strong>{t('modules.conflict.lokadalat')}:</strong> Check nalsa.gov.in for upcoming Lok Adalat dates
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button className="cf-btn-secondary" onClick={() => { navigator.clipboard.writeText(settlement); showToast('Copied to clipboard!', 'info'); }} style={{ flex: 1 }}>
              {t('modules.conflict.settlement.copy')}
            </button>
            <button 
              className="cf-cta-btn" 
              onClick={handleDownloadPDF} 
              disabled={pdfGenerating} 
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {pdfGenerating ? <><span className="spinner" style={{borderColor:'white', borderTopColor:'transparent', width:'18px', height:'18px', borderWidth:'2px'}}></span> {t('common.loading')}</> : t('modules.conflict.settlement.download')}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="cf-btn-secondary" onClick={() => setStep('hearing')} style={{flex:1}}>← {t('common.back')}</button>
            <button className="cf-btn-action" onClick={() => { setStep('intake'); setResult(''); setSettlement(''); setBiasResult(''); setSideA(''); setSideB(''); setConcernA(''); setConcernB(''); setAgreedA(false); setAgreedB(false); setCategory(''); setMode(''); setNameA(''); setNameB(''); }} style={{flex:1}}>
              {t('modules.conflict.settlement.newCase')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatMarkdown(text) {
  return text
    .replace(/## (.*)/g, '<h3 class="md-h3">$1</h3>')
    .replace(/### (.*)/g, '<h4 class="md-h4">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\d+\.\s(.*)/g, '<li>$1</li>')
    .replace(/- (.*)/g, '<li>$1</li>')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}
