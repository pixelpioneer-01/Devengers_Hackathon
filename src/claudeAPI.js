// ==========================================
// CivicAI — Intelligent LLM Router Client
// ==========================================

export async function callAI(systemPrompt, userMessage, apiKey, language = 'en-IN') {
  // 1. Determine provider based on context/prompt content
  const isMediationOrBias = systemPrompt.toLowerCase().includes("mediat") || systemPrompt.toLowerCase().includes("bias");
  const provider = isMediationOrBias ? "anthropic" : "openai";

  // 2. Load API keys from local environment variables
  const openAIKey = import.meta.env.VITE_OPENAI_API_KEY || '';
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

  // 3. First, try calling the serverless API gateway (best for production/CORS safety)
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
        language,
        openAIKey,
        anthropicKey
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.content;
    }
    
    // If it's a 404, it means we are in local development running standard Vite dev server without serverless local handler.
    // In that case, we fall through to client-side direct API invocation.
    if (response.status !== 404) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Server Error: ${response.status}`);
    }
  } catch (err) {
    // If it's not a 404, propagate the actual API error
    if (err.message && !err.message.includes("404") && !err.message.includes("Failed to fetch")) {
      throw err;
    }
  }

  // 4. Client-side fallback (CORS might block this on some systems, but works as local development fail-safe)
  console.warn("Vercel serverless function not detected. Falling back to direct client-side API call.");

  let finalSystemPrompt = systemPrompt;
  if (language === 'hi-IN') {
    finalSystemPrompt += "\n\nCRITICAL INSTRUCTION: You MUST generate your entire response below in pure Hindi (हिन्दी). Do not use English words unless absolutely necessary for names. Format output keeping the exact same structure requested.";
  }

  if (provider === "anthropic") {
    const keyToUse = anthropicKey || apiKey;
    if (!keyToUse) {
      throw new Error("Anthropic API key is required. Please set VITE_ANTHROPIC_API_KEY in your .env file.");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": keyToUse,
        "anthropic-version": "2023-06-01",
        "dangerouslyAllowBrowser": "true"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        system: finalSystemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Anthropic API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;

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
    return data.choices[0].message.content;
  }
}
