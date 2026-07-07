import fs from 'fs';
import path from 'path';

async function testGoogleAPIs() {
  // Read .env manually since we are in a simple script
  const envPath = path.resolve('.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const googleKeyMatch = envContent.match(/VITE_GOOGLE_API_KEY=(.*)/);
  let googleKey = googleKeyMatch ? googleKeyMatch[1].trim() : null;
  
  // Test if it's a typo: Alza -> AIza
  if (googleKey && googleKey.startsWith("Alza")) {
    console.log("Found 'Alza' prefix, trying to fix to 'AIza' for this test...");
    googleKey = "AIza" + googleKey.substring(4);
  }

  if (!googleKey) {
    console.error("❌ No VITE_GOOGLE_API_KEY found in .env");
    return;
  }

  console.log(`Using Key: ${googleKey.substring(0, 4)}...${googleKey.substring(googleKey.length - 4)}`);

  // --- Test 1: Text-to-Speech ---
  console.log("\n--- Testing Google Text-to-Speech ---");
  try {
    const ttsUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`;
    const ttsPayload = {
      input: { text: "Hello from Civic AI" },
      voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const ttsResponse = await fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ttsPayload),
    });

    if (ttsResponse.ok) {
      const data = await ttsResponse.json();
      if (data.audioContent) {
        console.log("✅ TTS Success! Received audio content.");
      } else {
        console.log("⚠️ TTS odd response:", data);
      }
    } else {
      const errorData = await ttsResponse.json().catch(() => ({}));
      console.error(`❌ TTS Failed: ${ttsResponse.status} ${ttsResponse.statusText}`);
      console.error(JSON.stringify(errorData, null, 2));
    }
  } catch (err) {
    console.error("❌ TTS Fatal Error:", err);
  }

  // --- Test 2: Speech-to-Text ---
  console.log("\n--- Testing Google Speech-to-Text ---");
  try {
    const sttUrl = `https://speech.googleapis.com/v1/speech:recognize?key=${googleKey}`;
    // Sending a minimal request. Even if audio is empty or invalid, 
    // we want to see if it's an Auth error or a Validation error.
    const sttPayload = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
      },
      audio: {
        content: "YmFzZTY0LWVuY29kZWQtYXVkaW8tZGF0YQ==", // "base64-encoded-audio-data"
      },
    };

    const sttResponse = await fetch(sttUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sttPayload),
    });

    if (sttResponse.ok) {
      console.log("✅ STT Success! (Reached API, likely audio was garbage but key is valid)");
    } else {
      const errorData = await sttResponse.json().catch(() => ({}));
      console.log("STT Status Code:", sttResponse.status);
      console.log("STT Error Data:", JSON.stringify(errorData, null, 2));
      
      if (errorData.error?.message?.includes("API key not valid")) {
          console.log("❌ STT Failed: API key not valid.");
      } else if (errorData.error?.status === "INVALID_ARGUMENT") {
          console.log("✅ STT Key Valid! (Got INVALID_ARGUMENT related to audio content)");
      } else {
          console.error(`❌ STT Failed: ${sttResponse.status} ${sttResponse.statusText}`);
      }
    }
  } catch (err) {
    console.error("❌ STT Fatal Error:", err);
  }
}

testGoogleAPIs();
