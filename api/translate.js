// ==========================================
// CivicAI — Sarvam AI Translate Serverless Proxy
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

  const { text, targetLanguage, sarvamKey } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Missing required fields (text, targetLanguage)" });
  }

  const apiKey = process.env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY || sarvamKey;
  if (!apiKey) {
    return res.status(500).json({ error: "Sarvam AI API Key not configured." });
  }

  try {
    const response = await fetch("https://api.sarvam.ai/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": apiKey,
      },
      body: JSON.stringify({
        input: text,
        source_language_code: "en-IN",
        target_language_code: targetLanguage,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || "Sarvam Translate Error" });
    }

    const data = await response.json();
    return res.status(200).json({ translatedText: data.translated_text });
  } catch (error) {
    console.error("Sarvam Translate error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
