# 🏛️ CivicAI: AI-Powered Civic Governance Platform

**Empowering every citizen with transparent, neutral, and fair AI-driven governance tools for a stronger democracy.**

CivicAI is a premium, multilingual platform designed to bridge the gap between citizens and administration. Built for the modern web, it leverages cutting-edge AI to simplify complex civic processes, from finding government schemes to mediating community conflicts.

![CivicAI Logo](public/civicai_gold_dome_logo_icon_1775930578212.png)

---

## 🌟 Key Features

### ⚖️ AI Conflict Mediator
A structured 5-step digital mediation workflow (Intake, Briefing, Submissions, Hearing, Settlement) that helps resolve community and interpersonal disputes. It generates formal settlement documents with PDF download capabilities.

### 📋 Scheme Finder
A personalized search engine for government schemes. It helps citizens discover entitlements and subsidies they are eligible for, filtered by category and demographics.

### 🗳️ Voter Awareness
An interactive educational module focused on electoral literacy. It provides information on voting procedures, candidate backgrounds, and the importance of civic participation.

### 🗺️ Leader Finder
Locate and learn about your local representatives, from municipal councilors to members of parliament.

### 🗣️ Policy Explainer
Simplifies dense legislative and policy documents into plain, understandable language, making governance accessible to everyone.

### 🤝 Grassroots Organizer & Community Discussion
Tools for citizens to organize local action, discuss community issues, and collaborate on grass-roots solutions.

---

## 🌍 Multilingual by Design
CivicAI is built to be inclusive, supporting both **English** and **Hindi**. All modules are fully localized, ensuring that language is never a barrier to civic engagement.

---

## 🛠️ Technology Stack

- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **AI Intelligence**: [Groq API](https://groq.com/) (using `llama-3.3-70b-versatile`)
- **Speech-to-Text**: Groq Whisper API for seamless voice interactions.
- **Styling**: Vanilla CSS + [TailwindCSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **3D Elements**: [Three.js](https://threejs.org/) (via `@react-three/fiber`)
- **Document Generation**: [html2canvas](https://html2canvas.hertzen.com/) & [jsPDF](https://rawgit.com/MrRio/jsPDF/master/docs/index.html)
- **Localization**: [i18next](https://www.i18next.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Groq API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd civic-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   VITE_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Ethics & Neutrality
CivicAI is built on the principle of non-partisan AI. The platform provides insights based on available data and does not represent official government opinions. It includes an Ethics Modal to ensure users understand the role and limitations of AI in governance.

---

## 🏆 Project Context
Developed as part of the **Anthropic Hackathon**, CivicAI demonstrates how Large Language Models can be harnessed to create more transparent and accessible civic infrastructures.

---

*Made with ❤️ for a better democracy.*
