// ============================
// CivicAI — Groq API Helper
// ============================

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function callAI(systemPrompt, userMessage, apiKey, language = 'en-IN') {
  // Allow using the key from .env if the user hasn't set it in Settings
  // Note: Vite uses import.meta.env
  const envKey = import.meta.env.VITE_API_KEY || '';
  const keyToUse = apiKey || envKey;

  if (!keyToUse) {
    throw new Error("API key is required. Please set your API key in Settings or via VITE_API_KEY in .env.");
  }

  let finalSystemPrompt = systemPrompt;
  if (language === 'hi-IN') {
    finalSystemPrompt += "\n\nCRITICAL INSTRUCTION: You MUST generate your entire response below in pure Hindi (हिन्दी). Do not use English words unless absolutely necessary for names. Format output keeping the exact same structure requested.";
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${keyToUse}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1500,
      messages: [
        { role: "system", content: finalSystemPrompt },
        { role: "user", content: userMessage }
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
