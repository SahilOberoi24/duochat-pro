# 🌸 DuoChat Pro — AI Conversation Partner for Duolingo

A working prototype demonstrating an AI-powered conversation practice tool designed to reduce churn among serious language learners on Duolingo.

Built as part of a Duolingo Product Case Study.

## Features

- **💬 Chat** — Free-form AI conversation with inline grammar corrections and explanations
- **🎭 Roleplay** — Scenario-based practice (job interviews, apartment hunting, doctor visits) with AI in character
- **📖 Grammar Capsules** — Bite-sized grammar lessons with rules, examples, quizzes, and "Practice with Hana" integration
- **📊 Progress** — Session tracking for mistakes, new words, grammar practiced, and roleplays completed
- **📝 Exam Prep** — Language-specific test preparation (JLPT for Japanese, DELE for Spanish, DELF for French, Goethe for German)

## Tech Stack

- React 18 + Vite
- Anthropic Claude API (claude-sonnet-4-20250514)
- No external UI libraries — custom-built components

## Setup & Run Locally

```bash
# 1. Clone or download this project
cd duochat-pro

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev

# 4. Open http://localhost:5173
```

## Deploy to Vercel

### Option 1: Via Vercel CLI
```bash
npm i -g vercel
vercel
```

### Option 2: Via GitHub
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy

No environment variables needed — the Anthropic API key is handled automatically when used within Claude artifacts. For standalone deployment, you'll need to add your own API key handling.

## API Key Note

This prototype was built inside Claude's artifact system where API calls are authenticated automatically. For your Vercel deployment, you have two options:

1. **Proxy approach (recommended):** Create a `/api/chat` serverless function in Vercel that holds your API key server-side
2. **Client-side (demo only):** Add an API key input field in the UI for demo purposes

## Project Structure

```
duochat-pro/
├── index.html          # Entry HTML
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── .gitignore
├── README.md
└── src/
    ├── main.jsx        # React entry point
    └── DuoChatPro.jsx  # Main application component (all-in-one)
```

## Case Study Context

**P0 Problem:** Serious learners (career/relocation-motivated) churn from Duolingo because it lacks conversational practice and structured grammar instruction.

**This prototype addresses 4 of the top 7 RICE-scored solutions:**
1. Grammar Lessons Expansion (RICE: 27.0) → Grammar Capsules tab
2. "Why Was I Wrong?" Deep Explanations (RICE: 27.0) → Inline corrections in chat
3. AI Text Conversation Partner (RICE: 27.0) → Chat tab
4. Scenario-Based Roleplay Expansion (RICE: 9.0) → Roleplay tab

## Author

Built by Sahil Oberoi as part of a Duolingo Product Case Study.
