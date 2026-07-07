// ==========================================
// CivicAI — Intelligent LLM Router Client
// ==========================================

export async function callAI(systemPrompt, userMessage, apiKey, language = 'en-IN') {
  // 1. Check if we need to translate the output into an Indian language using Sarvam AI
  const supportedSarvamLangs = ['hi-IN', 'bn-IN', 'ta-IN', 'te-IN', 'kn-IN', 'ml-IN', 'mr-IN', 'gu-IN', 'pa-IN', 'or-IN'];
  const normalizedLang = language.includes('-') ? language : `${language}-IN`;
  const isIndianLang = supportedSarvamLangs.includes(normalizedLang);
  const shouldTranslate = isIndianLang && normalizedLang !== 'en-IN';

  // If we are translating using Sarvam, we request the LLM to output in English first, then translate
  const queryLanguage = shouldTranslate ? 'en-IN' : language;

  // 2. Determine provider based on context/prompt content
  const isMediationOrBias = systemPrompt.toLowerCase().includes("mediat") || systemPrompt.toLowerCase().includes("bias");
  const provider = isMediationOrBias ? "anthropic" : "openai";

  // 3. Load API keys from local environment variables
  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';
  const sarvamKey = import.meta.env.VITE_SARVAM_API_KEY || '';

  let aiContent = "";

  // 4. Try calling the serverless API gateway (best for production/CORS safety)
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt,
        userMessage,
        provider,
        language: queryLanguage,
        openAIKey,
        anthropicKey
      }),
    });

    if (response.ok) {
      const data = await response.json();
      aiContent = data.content;
    } else if (response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Server Error: ${response.status}`);
    }
  } catch (err) {
    if (err.message && !err.message.includes("404") && !err.message.includes("Failed to fetch")) {
      throw err;
    }
  }

  // 5. Client-side fallback if serverless function not detected (e.g. running vite dev server locally)
  if (!aiContent) {
    console.warn("Vercel serverless function not detected. Falling back to direct client-side API call.");

    let finalSystemPrompt = systemPrompt;
    if (queryLanguage === 'hi-IN') {
      finalSystemPrompt += "\n\nCRITICAL INSTRUCTION: You MUST generate your entire response below in pure Hindi (हिन्दी). Do not use English words unless absolutely necessary for names. Format output keeping the exact same structure requested.";
    }

    if (provider === "anthropic") {
      const keyToUse = openAIKey || apiKey;
      if (!keyToUse) {
        throw new Error("OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 1500,
          messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: userMessage }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `OpenAI API Error (GPT-4o): ${response.status}`);
      }

      const data = await response.json();
      aiContent = data.choices[0].message.content;

    } else {
      const keyToUse = openAIKey || apiKey;
      if (!keyToUse) {
        throw new Error("OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your .env file.");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 1500,
          messages: [
            { role: "system", content: finalSystemPrompt },
            { role: "user", content: userMessage }
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `OpenAI API Error: ${response.status}`);
      }

      const data = await response.json();
      aiContent = data.choices[0].message.content;
    }
  }

  // 6. Translate using Sarvam AI translation if target is a supported Indian language
  if (shouldTranslate && aiContent) {
    try {
      console.log(`[Sarvam] Translating content to ${normalizedLang}...`);
      const resTranslate = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: aiContent,
          targetLanguage: normalizedLang,
          sarvamKey
        }),
      });

      if (resTranslate.ok) {
        const data = await resTranslate.json();
        return data.translatedText;
      } else {
        console.warn("Sarvam Translate failed, returning untranslated response.");
      }
    } catch (e) {
      console.error("Sarvam translation error:", e);
    }
  }

  return aiContent;
}
