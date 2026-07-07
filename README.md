# CivicAI 🏛️

CivicAI is an official, AI-powered civic platform designed to empower citizens with transparent, neutral, and fair governance tools for a stronger democracy. It bridges the gap between citizens and the government by providing multilingual AI assistance, real-time data on leaders and schemes, anonymous community discussions, and conflict mediation.

## 🌟 Key Features

### 1. Multilingual Support & Accessibility
- **8 Indian Languages:** Fully supports English, Hindi, Marathi, Bengali, Telugu, Tamil, Kannada, and Gujarati.
- **Language Selection Modal:** Beautiful welcome screen for first-time users to select their preferred language.
- **Voice Interactions:** Integrated with **Sarvam AI** for Speech-to-Text (STT) and Text-to-Speech (TTS), allowing users to interact with the platform using their voice in their native language.

### 2. CivicBot (AI Assistant) 🤖
- A floating AI assistant powered by **OpenAI (GPT-4o-mini)**.
- Listens to user problems (via text or voice) and automatically navigates them to the correct tool.
- Supports manual language switching via chat (e.g., *"Speak in Hindi"*).
- Uses Sarvam AI for natural-sounding voice replies.

### 3. Live Web Scraping (Firecrawl API) 🕷️
- **Nearby Leaders:** Automatically detects the user's location and uses the Firecrawl API to scrape the web for real-time information about their local MLA, MP, and municipal leaders.
- **Government Schemes:** Uses Firecrawl to pull live, up-to-date information on government subsidies and welfare schemes (like PM-KISAN, PMAY) based on user demographics.

### 4. Anonymous Civic Voice (X / Twitter Integration) 🐦
- Allows citizens to anonymously voice their opinions or complaints on X.
- **Real-time AI Moderation:** Messages are scanned by OpenAI to ensure they do not contain hate speech, slurs, or violence.
- **Cost-Free Fallback:** Bypasses X API rate limits and paid tiers by using Twitter Intents to open a pre-filled, moderated compose window.

### 5. Core Civic Modules
- **⚖️ Conflict Mediator:** AI-driven fair mediation for neighborhood disputes and civil disagreements.
- **📜 Policy Explainer:** Breaks down complex legal jargon and government bills into simple, easy-to-understand summaries.
- **🗳️ Voter Awareness:** Guides citizens on their voting rights, voter ID registration, and election info.
- **👥 Discussion Hub:** A safe space for community debates and sharing opinions.
- **📣 Grassroots Organizer:** Tools to help citizens organize local campaigns and petitions.
- **📝 Complaint Guide:** Step-by-step assistance for filing RTIs, consumer complaints, and official grievances.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion
- **AI Models:** OpenAI (GPT-4o-mini) for chat, moderation, and analysis
- **Voice AI:** Sarvam AI (Saaras-v3 for STT, Bulbul-v1 for TTS)
- **Web Scraping:** Firecrawl API for live data retrieval
- **Backend/Database:** Vercel Serverless Functions, Supabase (for persistent caching and data storage)
- **Deployment:** Vercel

## 🚀 How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/pixelpioneer-01/Devengers_Hackathon.git
   cd Devengers_Hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Create a `.env` file in the root directory and add the following keys:
   ```env
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_SARVAM_API_KEY=your_sarvam_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FIRECRAWL_API_KEY=your_firecrawl_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Note: To test serverless functions like the AI moderation locally, use `vercel dev` instead of `npm run dev`)*

## 🛡️ Data Privacy & Ethics
CivicAI is built on the principles of privacy and non-partisanship.
- **No Data Mining:** User inputs are processed ephemerally.
- **AI Neutrality:** Insights do not represent government opinions and are designed to be strictly objective.
- **Anonymity:** The Discussion Hub ensures the complete privacy of citizens voicing their concerns.
