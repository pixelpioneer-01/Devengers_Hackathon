// ==========================================
// CivicAI — Sarvam AI TTS Serverless Proxy
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

  const { text, language, sarvamKey } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Missing required fields (text, language)" });
  }

  const apiKey = process.env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY || sarvamKey;
  if (!apiKey) {
    return res.status(500).json({ error: "Sarvam AI API Key not configured." });
  }

  // Map language to Sarvam supported codes
  // Sarvam supports: hi-IN, bn-IN, ta-IN, te-IN, kn-IN, ml-IN, mr-IN, gu-IN, pa-IN, or-IN, en-IN
  let targetLang = language;
  if (language === 'hi') targetLang = 'hi-IN';
  if (language === 'en') targetLang = 'en-IN';

  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        text: text.slice(0, 500), // safe limit for response length
        target_language_code: targetLang,
        speaker: "shubh",
        pace: 1.0,
        sample_rate: 24000,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || "Sarvam TTS Error" });
    }

    const data = await response.json();
    const base64Audio = data.audios[0];
    
    return res.status(200).json({ audio: base64Audio });
  } catch (error) {
    console.error("Sarvam TTS error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
