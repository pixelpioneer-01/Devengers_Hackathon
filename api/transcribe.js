// ==========================================
// CivicAI — Sarvam AI STT Serverless Proxy
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

  const { audio, languageCode, sarvamKey } = req.body;

  if (!audio || !languageCode) {
    return res.status(400).json({ error: "Missing required fields (audio, languageCode)" });
  }

  const apiKey = process.env.VITE_SARVAM_API_KEY || process.env.SARVAM_API_KEY || sarvamKey;
  if (!apiKey) {
    return res.status(500).json({ error: "Sarvam AI API Key not configured." });
  }

  try {
    // 1. Convert base64 audio string to a Buffer
    const buffer = Buffer.from(audio, "base64");

    // 2. Create FormData
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "audio/webm" });
    formData.append("file", blob, "recording.webm");
    formData.append("model", "saaras:v3");
    formData.append("language_code", languageCode);

    // 3. Post to Sarvam AI STT
    const response = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || "Sarvam STT Error" });
    }

    const data = await response.json();
    return res.status(200).json({ transcript: data.transcript });
  } catch (error) {
    console.error("Sarvam STT error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
