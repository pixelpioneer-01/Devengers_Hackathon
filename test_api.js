

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

async function testGroq() {
  const apiKey = process.env.VITE_API_KEY;
  if (!apiKey) {
    console.log("NO VITE_API_KEY FOUND IN .env");
    return;
  }
  
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 100,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello, reply with just 'HI'." }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log("FETCH ERROR:", response.status, response.statusText, JSON.stringify(errorData));
      return;
    }

    const data = await response.json();
    console.log("SUCCESS:", data.choices[0].message.content);
  } catch (err) {
    console.error("FATAL ERROR:", err);
  }
}

testGroq();
