// ==========================================
// CivicAI — Vercel Serverless API Gateway
// ==========================================

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { systemPrompt, userMessage, provider, language, openAIKey, anthropicKey } = req.body;

  if (!systemPrompt || !userMessage || !provider) {
    return res.status(400).json({ error: "Missing required fields (systemPrompt, userMessage, provider)" });
  }

  let finalSystemPrompt = systemPrompt;
  if (language === 'hi-IN') {
    finalSystemPrompt += "\n\nCRITICAL INSTRUCTION: You MUST generate your entire response below in pure Hindi (हिन्दी). Do not use English words unless absolutely necessary for names. Format output keeping the exact same structure requested.";
  }

  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY || openAIKey;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API Key not configured." });
    }

    // Route anthropic requests to gpt-4o (tough tasks) and openai requests to gpt-4o-mini (standard tasks)
    const model = provider === "anthropic" ? "gpt-4o" : "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.error?.message || "OpenAI API Error" });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.choices[0].message.content });

  } catch (error) {
    console.error("API Gateway error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
