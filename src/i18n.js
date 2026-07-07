import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  'en-IN': {
    translation: {
      "appTitle": "CivicAI",
      "landing": {
        "title": "Home",
        "tagline": "Official Gateway",
        "welcome": "Welcome to CivicAI",
        "heroDesc": "Your AI-powered starting place for fair decisions, policy understanding, and community voice. Built for the modern citizen.",
        "exploreTools": "Explore Tools",
        "startMediating": "Start Mediating →",
        "topToolsTitle": "Top AI Tools",
        "newsTitle": "Under the Dome",
        "newsTagline": "Latest Legislative Updates",
        "newsHighlightTitle": "New Environmental Bill Passed: What it means for you.",
        "newsHighlightDesc": "AI Summary: The 2024 Green Cities Act aims to reduce urban emissions by 40% over 5 years. Citizens will receive subsidies for electric vehicles and balcony gardens...",
        "readFullBreakdown": "READ THE FULL BREAKDOWN",
        "moreServices": "More Citizen Services",
        "launch": "Launch System",
        "voice_prompt": "Welcome to CivicAI. How can I help you today? You can ask me to open any module like 'Policy Explainer' or 'Nearby Leaders'.",
        "speak": "Speak to Assistant"
      },
      "sidebar": {
        "title": "CivicAI"
      },
      "common": {
        "save": "Save",
        "cancel": "Cancel",
        "loading": "Analyzing...",
        "analyzing": "Analyzing...",
        "error": "Error",
        "back": "Back",
        "proceed": "Proceed",
        "demo": "📋 Load Demo Scenario",
        "analysis": "📝 Analysis",
        "context": "📚 Context",
        "wikipedia": "📚 Wikipedia Context",
        "placeholder": "Type something here...",
        "verifying": "Verifying...",
        "close": "Close",
        "discuss": "What do you think?",
        "discussShort": "Discuss",
        "share": "Share",
        "shareWith": "Share with",
        "detecting": "Detecting...",
        "detectLocation": "Detect My Location",
        "detectLocationSm": "Detect location (for local contacts)",
        "refresh": "Refresh",
        "copy": "Copy to Clipboard",
        "emergency": "Emergency",
        "dial112": "Dial 112",
        "emergencyDesc": "for any emergency",
        "locationError": "Failed to detect location",
        "switching": "Switching to",
        "voice_unknown": "I didn't catch that. Try saying a module name like 'Policies' or 'Leaders'.",
        "voice_nav": "Voice Navigation"
      },
      "settings_modal": {
        "title": "System Settings",
        "desc": "Configure your API key to access live AI features.",
        "apiKeyLabel": "Groq API Key",
        "apiKeyPlaceholder": "gsk_..."
      },
      "modules": {
        "conflict": {
          "title": "Conflict Mediator",
          "subtitle": "Fair AI-driven mediation for any dispute",
          "partyA": "Party A's Perspective",
          "partyB": "Party B's Perspective",
          "placeholderA": "Describe Arjun's side of the story...",
          "placeholderB": "Describe Rohan's side of the story...",
          "mediate": "⚖️ Mediate Conflict",
          "analyzing": "Mediating dispute...",
          "steps": {
            "intake": "Case Filing",
            "briefing": "Pre-Session",
            "submissions": "Submissions",
            "hearing": "Hearing",
            "settlement": "Settlement"
          },
          "categories": {
            "consumer": { "label": "🛒 Consumer Dispute", "desc": "Refunds, service issues, product defects" },
            "financial": { "label": "💰 Financial Dispute", "desc": "Loans, payments, equity splits" },
            "relationship": { "label": "🤝 Relationship / Community", "desc": "Roommates, neighbors, community conflicts" },
            "workplace": { "label": "💼 Workplace Dispute", "desc": "Employer-employee, harassment, reviews" },
            "property": { "label": "🏠 Property Dispute", "desc": "Rent deposits, shared spaces, boundaries" },
            "other": { "label": "📋 Other", "desc": "Any other type of dispute" }
          },
          "modes": {
            "conciliation": { "label": "🤝 Conciliation", "desc": "AI proposes a concrete solution" },
            "mediation": { "label": "⚖️ Mediation", "desc": "AI facilitates — parties decide" },
            "arbitration": { "label": "🏛️ Arbitration", "desc": "AI hears both sides, issues an Award" },
            "medarb": { "label": "🔄 Med-Arb", "desc": "Mediation first, arbitration if needed" },
            "lokadalat": { "label": "🕊️ Lok Adalat", "desc": "Quick, dignified compromise" }
          },
          "briefing": {
            "safeSpace": "Before we begin: This is a safe space. The AI mediator is completely neutral and will treat both parties with equal respect. Your goal is to be heard and to find a solution — not to win.",
            "concernQuestion": "What is your biggest concern about this process?"
          },
          "category": "Dispute Category",
          "mode": "Resolution Mode",
          "proceedPreSession": "Proceed to Pre-Session →",
          "concernPlaceholder": "{{name}}, share your concern...",
          "bothAgreed": "✅ Both parties have agreed! This document can be presented to a formal mediator or legal authority.",
          "sama": "Sama ODR",
          "dlsa": "DLSA",
          "lokadalat": "Lok Adalat",
          "nalsa": "National Legal Services Authority",
          "signature": "Signature",
          "date": "Date",
          "reviseSubmissions": "Revise Submissions",
          "partyALabel": "Party A Name (optional)",
          "partyBLabel": "Party B Name (optional)",
          "partyA": "Person A",
          "partyB": "Person B",
          "step3Title": "Step 3: Party Submissions",
          "step3Desc": "Each party submits their statement separately. The AI neutral reviews both simultaneously.",
          "step5Title": "Step 5: Settlement Document",
          "submissions": {
            "partyAStatement": "{{name}}'s Statement",
            "partyBStatement": "{{name}}'s Statement",
            "desc": "Each party submits their statement separately. The AI neutral reviews both simultaneously.",
            "placeholder": "What happened? What do you want? What will you accept?"
          },
          "hearing": {
            "analyzing": "Analyzing both perspectives...",
            "biasCheck": "🔍 Bias Check",
            "genSettlement": "📄 Generate Settlement"
          },
          "settlement": {
            "agreement": "✅ Agreement",
            "copy": "📋 Copy to Clipboard",
            "download": "📄 Download PDF for Signing",
            "referralTitle": "🔗 Need a legally binding resolution?",
            "newCase": "🔄 New Case"
          }
        },
        "policy": {
          "title": "Policy Explainer",
          "subtitle": "Decode complex government policies into plain, actionable language tailored specifically for your role in the community.",
          "badge": "Accessible Legislation",
          "step1Label": "What policy should we decode?",
          "step2Label": "Who are you explaining this to?",
          "inputPlaceholder": "e.g. NEP 2020, GST, Rental Laws...",
          "startRecording": "Start voice input",
          "stopRecording": "Stop recording",
          "analyzeBtn": "Analyze This Policy",
          "analyzing": "Decoding Policy...",
          "wikiPrimer": "Wikipedia Primer",
          "reportLabel": "Tailored Impact Report",
          "auditLabel": "Accessibility Audit",
          "neutrality": "Neutrality",
          "printReport": "Print Report",
          "auditPath": "Audit Path",
          "disclaimer": "Responses are curated for educational purposes",
          "audiences": {
            "student": "Student",
            "senior": "Senior Citizen",
            "business": "Small Biz Owner",
            "parent": "Parent / Guardian"
          }
        },
        "community": {
          "title": "Discussion Hub",
          "subtitle": "Analyze trends and find common ground",
          "stageTitle": "Section 1: Discussion Stage",
          "stageDesc": "Configure your participation context",
          "debateTitle": "Section 2: Anonymous Debate Floor",
          "debateDesc": "Post your opinion with total privacy",
          "topicLabel": "Discussion Topic",
          "hashtagLabel": "Active Hashtag",
          "placeholder": "Share your perspective anonymously...",
          "postLocally": "Post Locally",
          "tweetAnonymously": "Tweet Anonymously 🗸",
          "anonymousCitizen": "Anonymous Citizen",
          "verifiedIdentity": "Verified Civic Identity",
          "liveScan": "LIVE SCAN",
          "currentlyDiscussing": "Currently discussing in",
          "detectingContext": "Detecting local context...",
          "comments": "Comments",
          "replyPlaceholder": "Write an anonymous reply...",
          "citizenVoices": "Citizen Voices ({{count}})"
        },
        "voter": {
          "title": "Voter Awareness",
          "subtitle": "Nonpartisan education on candidates, parties, and elections",
          "placeholder": "Ask about a candidate's record, party manifestos, or voting process...",
          "ask": "🗳️ Get Voter Info",
          "analyzing": "Fetching nonpartisan data...",
          "chatTitle": "Ask anything about elections, candidates, or parties",
          "chatSubtitle": "I'll provide factual, unbiased information — never recommendations.",
          "suggestions": {
            "compare": "Compare AAP and BJP on education policies",
            "compareLabel": "Compare AAP and BJP on education",
            "nri": "What are the voting rights of NRI citizens?",
            "nriLabel": "NRI voting rights",
            "evm": "How does the EVM voting machine work?",
            "evmLabel": "How does EVM work?"
          }
        },
        "grassroots": {
          "title": "Grassroots Organizer",
          "subtitle": "Practical action plans for local community problems",
          "placeholder": "Describe a local problem (e.g., 'Broken streetlights on Main St' or 'Waste management in Sector 4')...",
          "organize": "✊ Create Action Plan",
          "analyzing": "Generating action plan...",
          "chatTitle": "Describe a community problem",
          "chatSubtitle": "Get a step-by-step action plan, contacts, and a sample complaint letter.",
          "suggestions": {
            "water": "There is a water shortage in our colony for the past 2 weeks",
            "waterLabel": "Water shortage in colony",
            "lights": "Street lights broken on our road, very unsafe at night",
            "lightsLabel": "Broken street lights",
            "debris": "Construction debris dumped in our park, nobody is cleaning it",
            "debrisLabel": "Illegal dumping in park"
          }
        },
        "leaders": {
          "title": "Nearby Leaders",
          "subtitle": "Find your elected representatives automatically",
          "representatives": "Your Representatives",
          "disclaimer": "Data sourced from Wikipedia and public records. Verify before acting.",
          "comparisonTitle": "Detailed Leader Comparison",
          "analyzing": "Generating detailed comparison of your representatives...",
          "chatTitle": "Ask anything about your leaders",
          "chatSubtitle": "Get factual, nonpartisan comparisons and information.",
          "suggestions": {
            "pollution": "What has the MLA done about air pollution?",
            "pollutionLabel": "Air pollution record",
            "compare": "Compare their education and infrastructure work",
            "compareLabel": "Compare their work",
            "issues": "What are the major issues in my constituency?",
            "issuesLabel": "Constituency issues"
          },
          "placeholder": "Ask about your leaders' work, policies, or record..."
        },
        "schemes": {
          "title": "Government Schemes",
          "subtitle": "Discover, understand, and apply for government welfare schemes",
          "welfareDiscovery": "Welfare Discovery",
          "searchPlaceholder": "🔍 Search schemes — e.g. housing, health, farmer, loan...",
          "scholarAi": "Scholar AI",
          "policyAdvisor": "Policy Advisor",
          "verifiedPath": "Verified Path",
          "howCanAssist": "How can I assist?",
          "chatSubtitle": "Ask about eligibility, document requirements, or portal access.",
          "verifyingPolicy": "Verifying Policy...",
          "dataDisclaimer": "Data derived from National Portal of India (india.gov.in)",
          "categories": {
            "All": "All",
            "Housing": "Housing",
            "Health": "Health",
            "Agriculture": "Agriculture",
            "Business": "Business",
            "Skills": "Skills"
          },
          "items": {
            "pmay": {
              "name": "PM Awas Yojana (PMAY)",
              "category": "Housing",
              "desc": "Affordable housing for all — subsidized home loans and construction grants for EWS, LIG, and MIG categories.",
              "eligibility": "Annual income up to ₹18 lakh (MIG-II). No pucca house in family.",
              "howToApply": "Apply online at pmaymis.gov.in or visit your nearest CSC center."
            },
            "pmjay": {
              "name": "Ayushman Bharat (PM-JAY)",
              "category": "Health",
              "desc": "Free health insurance up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
              "eligibility": "Families listed in SECC 2011 data — deprived households and worker categories.",
              "howToApply": "Check eligibility at mera.pmjay.gov.in. Get e-card at any Ayushman Bharat HWC."
            },
            "pmkisan": {
              "name": "PM-KISAN",
              "category": "Agriculture",
              "desc": "Direct income support of ₹6,000 per year to small and marginal farmer families in three equal installments.",
              "eligibility": "All land-holding farmer families with cultivable land.",
              "howToApply": "Register at pmkisan.gov.in with Aadhaar and land records."
            },
            "mudra": {
              "name": "PM Mudra Yojana",
              "category": "Business",
              "desc": "Collateral-free loans up to ₹10 lakh for micro/small businesses.",
              "eligibility": "Any Indian citizen with a business plan for non-farm income-generating activity.",
              "howToApply": "Apply at any bank, NBFC, or MFI."
            },
            "skill": {
              "name": "PM Skill Development",
              "category": "Skills",
              "desc": "Free skill training and certification with placement assistance.",
              "eligibility": "Indian nationals aged 15-45. School dropouts and unemployed youth.",
              "howToApply": "Register at pmkvyofficial.org."
            }
          },
          "eligibilityCriteria": "Eligibility Criteria",
          "applicationBridge": "Application Bridge",
          "portalAccess": "Official Portal Access",
          "details": "Details",
          "active": "🟢 Active",
          "new": "🟡 New",
          "eligibility": "Eligibility",
          "apply": "How to Apply",
          "visitSite": "Visit Official Website",
          "askAi": "Ask AI for Details",
          "chatTitle": "Ask AI About Any Scheme",
          "chatPlaceholder": "Ask about any government scheme, eligibility, or how to apply...",
          "empty": "No schemes found for \"{{query}}\". Try a different search or ask the AI below!",
          "suggested": {
            "housing": "What schemes are available for first-time home buyers?",
            "housingLabel": "Home buyer schemes",
            "farmer": "How can a farmer get crop insurance?",
            "farmerLabel": "Farmer insurance",
            "women": "What are the latest schemes for women entrepreneurs?",
            "womenLabel": "Women entrepreneurs",
            "health": "How to get free health insurance under Ayushman Bharat?",
            "healthLabel": "Free health insurance"
          }
        },
        "complaint": {
          "title": "Complaint Guide",
          "subtitle": "Know your rights — file complaints the right way",
          "categories": {
            "police": "Police / Crime",
            "municipal": "Municipal / Civic",
            "consumer": "Consumer Rights",
            "electricity": "Electricity",
            "corruption": "Corruption / RTI",
            "environment": "Environment",
            "transport": "Transport / Traffic",
            "health": "Health / Hospital",
            "education": "Education",
            "women": "Women / Child Safety"
          },
          "keyContacts": "Key Contacts",
          "visitPortal": "Visit Portal",
          "detailLabel": "Describe your complaint in detail",
          "placeholder": "Describe your problem — what happened, when, where, and what you've already tried...",
          "generating": "Generating Guide...",
          "guide": "Get Step-by-Step Complaint Guide",
          "guideTitle": "Your Complaint Guide",
          "universalPortals": "Universal Portals",
          "cpgrams": "CPGRAMS",
          "centralGov": "Central government complaints",
          "cmHelpline": "CM Helpline",
          "cmHelplineDesc": "Check your state's CM helpline portal"
        }
      },
      "prompts": {
        "background": "**Background context from Wikipedia:**",
        "topic": "**Topic/Input:**",
        "request": "**Request:**"
      }
    }
  },
  'hi-IN': {
    translation: {
      "appTitle": "नागरिक एआई",
      "landing": {
        "title": "मुख्य पृष्ठ",
        "tagline": "आधिकारिक गेटवे",
        "welcome": "नागरिक एआई में आपका स्वागत है",
        "heroDesc": "निष्पक्ष निर्णयों, नीति समझ और सामुदायिक आवाज के लिए आपका एआई-संचालित शुरुआती स्थान। आधुनिक नागरिक के लिए निर्मित।",
        "exploreTools": "टूल एक्सप्लोर करें",
        "startMediating": "मध्यस्थता शुरू करें →",
        "topToolsTitle": "शीर्ष एआई टूल",
        "newsTitle": "अंडर द डोम",
        "newsTagline": "नवीनतम विधायी अपडेट",
        "newsHighlightTitle": "नया पर्यावरण विधेयक पारित: आपके लिए इसका क्या अर्थ है।",
        "newsHighlightDesc": "एआई सारांश: 2024 ग्रीन सिटीज एक्ट का लक्ष्य 5 वर्षों में शहरी उत्सर्जन को 40% तक कम करना है। नागरिकों को इलेक्ट्रिक वाहनों और बालकनी उद्यानों के लिए सब्सिडी मिलेगी...",
        "readFullBreakdown": "पूरा विवरण पढ़ें",
        "moreServices": "अधिक नागरिक सेवाएँ",
        "launch": "सिस्टम लॉन्च करें",
        "voice_prompt": "नागरिक एआई में आपका स्वागत है। मैं आपकी कैसे मदद कर सकता हूँ? आप मुझसे 'नीति स्पष्टीकरण' या 'आसपास के नेता' जैसे किसी भी मॉड्यूल को खोलने के लिए कह सकते हैं।",
        "speak": "सहायक से बात करें"
      },
      "sidebar": {
        "title": "नागरिक एआई"
      },
      "common": {
        "save": "सहेजें",
        "cancel": "रद्द करें",
        "loading": "विश्लेषण हो रहा है...",
        "analyzing": "विश्लेषण हो रहा है...",
        "error": "त्रुटि",
        "back": "पीछे",
        "proceed": "आगे बढ़ें",
        "demo": "📋 डेमो परिदृश्य लोड करें",
        "analysis": "📝 विश्लेषण",
        "context": "📚 संदर्भ",
        "wikipedia": "📚 विकिपीडिया संदर्भ",
        "placeholder": "यहाँ कुछ टाइप करें...",
        "verifying": "सत्यापित किया जा रहा है...",
        "close": "बंद करें",
        "discuss": "आप क्या सोचते हैं?",
        "discussShort": "चर्चा करें",
        "share": "साझा करें",
        "shareWith": "के साथ साझा करें",
        "detecting": "पता लगाया जा रहा है...",
        "detectLocation": "मेरा स्थान पहचानें",
        "detectLocationSm": "स्थान पहचानें (स्थानीय संपर्क के लिए)",
        "refresh": "रीफ्रेश करें",
        "copy": "क्लिपबोर्ड पर कॉपी करें",
        "emergency": "आपातकालीन",
        "dial112": "112 डायल करें",
        "emergencyDesc": "किसी भी आपात स्थिति के लिए",
        "locationError": "स्थान का पता लगाने में विफल",
        "switching": "पर जा रहे हैं",
        "voice_unknown": "मैं समझ नहीं पाया। 'नीति' या 'नेता' जैसे मॉड्यूल का नाम बोलने का प्रयास करें।",
        "voice_nav": "आवाज़ नेविगेशन"
      },
      "settings_modal": {
        "title": "सिस्टम सेटिंग्स",
        "desc": "लाइव एआई सुविधाओं तक पहुँचने के लिए अपनी एपीआई कुंजी कॉन्फ़िगर करें।",
        "apiKeyLabel": "ग्रोक (Groq) एपीआई कुंजी",
        "apiKeyPlaceholder": "gsk_..."
      },
      "modules": {
        "conflict": {
          "title": "संघर्ष मध्यस्थ",
          "subtitle": "किसी भी विवाद के लिए निष्पक्ष एआई-संचालित मध्यस्थता",
          "partyA": "पक्ष क का दृष्टिकोण",
          "partyB": "पक्ष ख का दृष्टिकोण",
          "placeholderA": "अर्जुन की कहानी का पक्ष बताएं...",
          "placeholderB": "रोहन की कहानी का पक्ष बताएं...",
          "mediate": "⚖️ विवाद सुलझाएं",
          "analyzing": "विवाद सुलझाया जा रहा है...",
          "steps": {
            "intake": "मामला दर्ज करना",
            "briefing": "पूर्व-सत्र",
            "submissions": "प्रस्तुतियाँ",
            "hearing": "सुनवाई",
            "settlement": "समझौता"
          },
          "categories": {
            "consumer": { "label": "🛒 उपभोक्ता विवाद", "desc": "धनवापसी, सेवा मुद्दे, उत्पाद दोष" },
            "financial": { "label": "💰 वित्तीय विवाद", "desc": "ऋण, भुगतान, इक्विटी विभाजन" },
            "relationship": { "label": "🤝 संबंध / समुदाय", "desc": "रूममेट, पड़ोसी, सामुदायिक संघर्ष" },
            "workplace": { "label": "💼 कार्यस्थल विवाद", "desc": "नियोक्ता-कर्मचारी, उत्पीड़न, समीक्षा" },
            "property": { "label": "🏠 संपत्ति विवाद", "desc": "किराया जमा, साझा स्थान, सीमाएं" },
            "other": { "label": "📋 अन्य", "desc": "किसी भी अन्य प्रकार का विवाद" }
          },
          "modes": {
            "conciliation": { "label": "🤝 सुलह", "desc": "एआई एक ठोस समाधान का प्रस्ताव देता है" },
            "mediation": { "label": "⚖️ मध्यस्थता", "desc": "एआई सुविधा प्रदान करता है — पक्ष निर्णय लेते हैं" },
            "arbitration": { "label": "🏛️ मध्यस्थता (Arbitration)", "desc": "एआई दोनों पक्षों को सुनता है, एक निर्णय जारी करता है" },
            "medarb": { "label": "🔄 मेड-अर्ब", "desc": "पहले मध्यस्थता, ज़रूरत पड़ने पर आर्बिट्रेशन" },
            "lokadalat": { "label": "🕊️ लोक अदालत", "desc": "त्वरित, गरिमापूर्ण समझौता" }
          },
          "briefing": {
            "safeSpace": "शुरू करने से पहले: यह एक सुरक्षित स्थान है। एआई मध्यस्थ पूरी तरह से तटस्थ है और दोनों पक्षों के साथ समान सम्मान के साथ व्यवहार करेगा। आपका लक्ष्य अपनी बात सुनाना और समाधान खोजना है — जीतना नहीं।",
            "concernQuestion": "इस प्रक्रिया के बारे में आपकी सबसे बड़ी चिंता क्या है?"
          },
          "category": "विवाद की श्रेणी",
          "mode": "समाधान का तरीका",
          "proceedPreSession": "पूर्व-सत्र के लिए आगे बढ़ें →",
          "concernPlaceholder": "{{name}}, अपनी चिंता साझा करें...",
          "bothAgreed": "✅ दोनों पक्ष सहमत हो गए हैं! यह दस्तावेज़ औपचारिक मध्यस्थ या कानूनी अधिकारी के सामने प्रस्तुत किया जा सकता है।",
          "sama": "सामा ओडीआर",
          "dlsa": "डीएलएसए",
          "lokadalat": "लोक अदालत",
          "nalsa": "राष्ट्रीय कानूनी सेवा प्राधिकरण",
          "signature": "हस्ताक्षर",
          "date": "तारीख",
          "reviseSubmissions": "प्रस्तुतियाँ संशोधित करें",
          "partyALabel": "पक्ष क का नाम (वैकल्पिक)",
          "partyBLabel": "पक्ष ख का नाम (वैकल्पिक)",
          "partyA": "व्यक्ति क",
          "partyB": "व्यक्ति ख",
          "step3Title": "चरण 3: पक्षों की प्रस्तुतियाँ",
          "step3Desc": "प्रत्येक पक्ष अपना बयान अलग से प्रस्तुत करता है। एआई तटस्थ दोनों की एक साथ समीक्षा करता है।",
          "step5Title": "चरण 5: समझौता दस्तावेज़",
          "submissions": {
            "partyAStatement": "{{name}} का बयान",
            "partyBStatement": "{{name}} का बयान",
            "desc": "प्रत्येक पक्ष अपना बयान अलग से प्रस्तुत करता है। एआई तटस्थ दोनों की एक साथ समीक्षा करता है।",
            "placeholder": "क्या हुआ? आप क्या चाहते हैं? आप क्या स्वीकार करेंगे?"
          },
          "hearing": {
            "analyzing": "दोनों पक्षों का विश्लेषण हो रहा है...",
            "biasCheck": "🔍 पूर्वाग्रह जांच",
            "genSettlement": "📄 समझौता तैयार करें"
          },
          "settlement": {
            "agreement": "✅ समझौता",
            "copy": "📋 क्लिपबोर्ड पर कॉपी करें",
            "download": "📄 हस्ताक्षर के लिए पीडीएफ डाउनलोड करें",
            "referralTitle": "🔗 कानूनी रूप से बाध्यकारी समाधान की आवश्यकता है?",
            "newCase": "🔄 नया केस"
          }
        },
        "policy": {
          "title": "नीति स्पष्टीकरण",
          "subtitle": "जटिल सरकारी नीतियों को सरल, स्पष्ट भाषा में समझें — अपनी भूमिका के अनुसार।",
          "badge": "सुलभ विधान",
          "step1Label": "हम कौन सी नीति समझाएं?",
          "step2Label": "आप किसे समझा रहे हैं?",
          "inputPlaceholder": "जैसे: NEP 2020, GST, किराया कानून...",
          "startRecording": "आवाज़ इनपुट शुरू करें",
          "stopRecording": "रिकॉर्डिंग रोकें",
          "analyzeBtn": "इस नीति का विश्लेषण करें",
          "analyzing": "नीति डीकोड हो रही है...",
          "wikiPrimer": "विकिपीडिया संदर्भ",
          "reportLabel": "अनुकूलित प्रभाव रिपोर्ट",
          "auditLabel": "सुलभता ऑडिट",
          "neutrality": "तटस्थता",
          "printReport": "रिपोर्ट प्रिंट करें",
          "auditPath": "ऑडिट पथ",
          "disclaimer": "उत्तर शैक्षिक उद्देश्यों के लिए तैयार किए गए हैं",
          "audiences": {
            "student": "छात्र",
            "senior": "वरिष्ठ नागरिक",
            "business": "लघु व्यवसायी",
            "parent": "अभिभावक"
          }
        },
        "community": {
          "title": "चर्चा केंद्र",
          "subtitle": "रुझानों का विश्लेषण करें और आम सहमति खोजें",
          "stageTitle": "चरण 1: चर्चा का मंच",
          "stageDesc": "अपनी भागीदारी का संदर्भ कॉन्फ़िगर करें",
          "debateTitle": "चरण 2: गुमनाम बहस का मंच",
          "debateDesc": "पूरी गोपनीयता के साथ अपनी राय साझा करें",
          "topicLabel": "चर्चा का विषय",
          "hashtagLabel": "सक्रिय हैशटैग",
          "placeholder": "अपनी राय गुमनाम रूप से साझा करें...",
          "postLocally": "स्थानीय रूप से पोस्ट करें",
          "tweetAnonymously": "गुमनाम रूप से ट्वीट करें 🗸",
          "anonymousCitizen": "गुमनाम नागरिक",
          "verifiedIdentity": "सत्यापित नागरिक पहचान",
          "liveScan": "लाइव स्कैन",
          "currentlyDiscussing": "वर्तमान में यहाँ चर्चा हो रही है:",
          "detectingContext": "स्थानीय संदर्भ की पहचान की जा रही है...",
          "comments": "टिप्पणियाँ",
          "replyPlaceholder": "गुमनाम उत्तर लिखें...",
          "citizenVoices": "नागरिक आवाजें ({{count}})"
        },
        "voter": {
          "title": "मतदाता जागरूकता",
          "subtitle": "गैर-पक्षपाती मतदाता शिक्षा — तथ्य, राय नहीं",
          "chatTitle": "चुनाव, उम्मीदवारों या दलों के बारे में कुछ भी पूछें",
          "chatSubtitle": "मैं तथ्यात्मक, निष्पक्ष जानकारी प्रदान करूँगा — कभी सिफारिश नहीं।",
          "suggestions": {
            "compare": "शिक्षा नीतियों पर आप और भाजपा की तुलना करें",
            "compareLabel": "शिक्षा पर आप और भाजपा की तुलना",
            "nri": "एनआरआई नागरिकों के मतदान अधिकार क्या हैं?",
            "nriLabel": "एनआरआई मतदान अधिकार",
            "evm": "ईवीएम वोटिंग मशीन कैसे काम करती है?",
            "evmLabel": "ईवीएम कैसे काम करता है?"
          },
          "placeholder": "उम्मीदवारों, दलों, चुनावों के बारे में पूछें..."
        },
        "grassroots": {
          "title": "जमीनी आयोजक",
          "subtitle": "सामुदायिक समस्याओं को कार्रवाई योग्य नागरिक योजनाओं में बदलें",
          "chatTitle": "एक सामुदायिक समस्या का वर्णन करें",
          "chatSubtitle": "चरण-दर-चरण कार्य योजना, संपर्क और एक नमूना शिकायत पत्र प्राप्त करें।",
          "suggestions": {
            "water": "पिछले 2 हफ्तों से हमारी कॉलोनी में पानी की किल्लत है",
            "waterLabel": "कॉलोनी में पानी की किल्लत",
            "lights": "हमारी सड़क पर स्ट्रीट लाइट खराब है, रात में बहुत असुरक्षित है",
            "lightsLabel": "टूटी स्ट्रीट लाइट",
            "debris": "हमारे पार्क में निर्माण का मलबा फेंका गया है, कोई इसे साफ नहीं कर रहा है",
            "debrisLabel": "पार्क में अवैध डंपिंग"
          },
          "placeholder": "अपनी सामुदायिक समस्या का वर्णन करें..."
        },
        "leaders": {
          "title": "आसपास के नेता",
          "subtitle": "अपने निर्वाचित प्रतिनिधियों को स्वचालित रूप से खोजें",
          "representatives": "आपके प्रतिनिधि",
          "disclaimer": "डेटा विकिपीडिया और सार्वजनिक रिकॉर्ड से लिया गया है। कार्रवाई करने से पहले सत्यापित करें।",
          "comparisonTitle": "विस्तृत नेता तुलना",
          "analyzing": "आपके प्रतिनिधियों की विस्तृत तुलना तैयार की जा रही है...",
          "chatTitle": "अपने नेताओं के बारे में कुछ भी पूछें",
          "chatSubtitle": "तथ्यात्मक, गैर-पक्षपाती तुलना और जानकारी प्राप्त करें।",
          "suggestions": {
            "pollution": "विधायक ने वायु प्रदूषण के लिए क्या किया है?",
            "pollutionLabel": "वायु प्रदूषण रिकॉर्ड",
            "compare": "उनकी शिक्षा और बुनियादी ढांचे के काम की तुलना करें",
            "compareLabel": "उनके काम की तुलना करें",
            "issues": "मेरे निर्वाचन क्षेत्र में प्रमुख मुद्दे क्या हैं?",
            "issuesLabel": "निर्वाचन क्षेत्र के मुद्दे"
          },
          "placeholder": "अपने नेताओं के काम, नीतियों या रिकॉर्ड के बारे में पूछें..."
        },
        "schemes": {
          "title": "सरकारी योजनाएं",
          "subtitle": "सरकारी कल्याणकारी योजनाओं की खोज करें, समझें और उनके लिए आवेदन करें",
          "searchPlaceholder": "🔍 योजनाएं खोजें — जैसे आवास, स्वास्थ्य, किसान, ऋण...",
          "categories": {
            "All": "सभी",
            "Housing": "आवास",
            "Health": "स्वास्थ्य",
            "Agriculture": "कृषि",
            "Business": "व्यवसाय",
            "Skills": "कौशल विकास"
          },
          "items": {
            "pmay": {
              "name": "प्रधानमंत्री आवास योजना (PMAY)",
              "category": "आवास",
              "desc": "सभी के लिए किफायती आवास — EWS, LIG और MIG श्रेणियों के लिए रियायती आवास ऋण और निर्माण अनुदान।",
              "eligibility": "₹18 लाख तक की वार्षिक आय (MIG-II)। परिवार में कोई पक्का घर नहीं होना चाहिए।",
              "howToApply": "pmaymis.gov.in पर ऑनलाइन आवेदन करें या अपने निकटतम CSC केंद्र पर जाएं।"
            },
            "pmjay": {
              "name": "आयुष्मान भारत (PM-JAY)",
              "category": "स्वास्थ्य",
              "desc": "माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति वर्ष प्रति परिवार ₹5 लाख तक का मुफ्त स्वास्थ्य बीमा।",
              "eligibility": "SECC 2011 डेटा में सूचीबद्ध परिवार — वंचित परिवार और श्रमिक श्रेणियां।",
              "howToApply": "mera.pmjay.gov.in पर पात्रता जांचें। किसी भी आयुष्मान भारत HWC पर ई-कार्ड प्राप्त करें।"
            },
            "pmkisan": {
              "name": "पीएम-किसान",
              "category": "कृषि",
              "desc": "छोटे और सीमांत किसान परिवारों को तीन समान किश्तों में ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता।",
              "eligibility": "खेती योग्य भूमि वाले सभी भूमिधारक किसान परिवार।",
              "howToApply": "Aadhaar और भूमि रिकॉर्ड के साथ pmkisan.gov.in पर पंजीकरण करें।"
            },
            "mudra": {
              "name": "पीएम मुद्रा योजना",
              "category": "व्यवसाय",
              "desc": "सूक्ष्म/लघु व्यवसायों के लिए ₹10 लाख तक का संपार्श्विक-मुक्त ऋण।",
              "eligibility": "गैर-कृषि आय-सृजन गतिविधि के लिए व्यावसायिक योजना वाला कोई भी भारतीय नागरिक।",
              "howToApply": "किसी भी बैंक, NBFC या MFI में आवेदन करें।"
            },
            "skill": {
              "name": "पीएम कौशल विकास",
              "category": "कौशल विकास",
              "desc": "प्लेसमेंट सहायता के साथ मुफ्त कौशल प्रशिक्षण और प्रमाणन।",
              "eligibility": "15-45 वर्ष की आयु के भारतीय नागरिक। स्कूल छोड़ने वाले और बेरोजगार युवा।",
              "howToApply": "pmkvyofficial.org पर पंजीकरण करें।"
            }
          },
          "active": "🟢 सक्रिय",
          "new": "🟡 नई",
          "eligibility": "पात्रता",
          "apply": "आवेदन कैसे करें",
          "visitSite": "आधिकारिक वेबसाइट पर जाएं",
          "askAi": "विवरण के लिए एआई से पूछें",
          "chatTitle": "किसी भी योजना के बारे में एआई से पूछें",
          "chatPlaceholder": "किसी भी सरकारी योजना, पात्रता या आवेदन कैसे करें, इसके बारे में पूछें...",
          "empty": "\"{{query}}\" के लिए कोई योजना नहीं मिली। कोई और खोज आज़माएं या नीचे एआई से पूछें!",
          "suggested": {
            "housing": "पहली बार घर खरीदने वालों के लिए क्या योजनाएं उपलब्ध हैं?",
            "housingLabel": "घर खरीदार योजनाएं",
            "farmer": "एक किसान फसल बीमा कैसे प्राप्त कर सकता है?",
            "farmerLabel": "किसान बीमा",
            "women": "महिला उद्यमियों के लिए नवीनतम योजनाएं क्या हैं?",
            "womenLabel": "महिला उद्यमी",
            "health": "आयुष्मान भारत के तहत मुफ्त स्वास्थ्य बीमा कैसे प्राप्त करें?",
            "healthLabel": "मुफ्त स्वास्थ्य बीमा"
          }
        },
        "complaint": {
          "title": "शिकायत मार्गदर्शिका",
          "subtitle": "अपने अधिकारों को जानें — शिकायतों को सही तरीके से दर्ज करें",
          "categories": {
            "police": "पुलिस / अपराध",
            "municipal": "नगरपालिका / नागरिक",
            "consumer": "उपभोक्ता अधिकार",
            "electricity": "बिजली",
            "corruption": "भ्रष्टाचार / आरटीआई",
            "environment": "पर्यावरण",
            "transport": "परिवहन / यातायात",
            "health": "स्वास्थ्य / अस्पताल",
            "education": "शिक्षा",
            "women": "महिला / बाल सुरक्षा"
          },
          "keyContacts": "प्रमुख संपर्क",
          "visitPortal": "पोर्टल पर जाएं",
          "detailLabel": "अपनी शिकायत का विस्तार से वर्णन करें",
          "placeholder": "अपनी समस्या का वर्णन करें — क्या हुआ, कब, कहाँ, और आपने पहले से क्या कोशिश की है...",
          "generating": "मार्गदर्शिका तैयार की जा रही है...",
          "guide": "चरण-दर-चरण शिकायत मार्गदर्शिका प्राप्त करें",
          "guideTitle": "आपकी शिकायत मार्गदर्शिका",
          "universalPortals": "सार्वभौमिक पोर्टल",
          "cpgrams": "CPGRAMS",
          "centralGov": "केंद्र सरकार की शिकायतें",
          "cmHelpline": "मुख्यमंत्री हेल्पलाइन",
          "cmHelplineDesc": "अपने राज्य के मुख्यमंत्री हेल्पलाइन पोर्टल की जाँच करें"
        }
      },
      "prompts": {
        "background": "**विकिपीडिया से पृष्ठभूमि संदर्भ:**",
        "topic": "**विषय/इनपुट:**",
        "request": "**अनुरोध:**"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en-IN",         // always start in English
    fallbackLng: "en-IN",
    // Do NOT detect language from browser/localStorage — language is
    // controlled exclusively by the EN / हिन्दी toggle in the top bar.
    detection: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
