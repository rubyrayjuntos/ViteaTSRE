🔮 Cartas del Deseo — Powered by Papi Chispa 💋
Bienvenidx to the velvet lounge of fate...
This is Papi Chispa’s sacred digital altar — where every tarot card flips with fire, and every reading is a scandalous novela waiting to unfold.
You've just stepped into the mystical experience of Cartas del Deseo — a fully interactive, real-time tarot divination web experience powered by:

🔥 React + Vite + Tailwind + FastAPI
💌 OpenAI-powered bilingual fortune-telling
🕯️ One-card-at-a-time reveal with sultry Spanglish chat

✨ Features

💃 Dramatic card flips, animated with flair
🕯️ One card at a time reading flow
💬 Live chat with Papi, your velvet-voiced tarot guide
🔥 Custom deck and art integration
🌗 Themed UI (Ceremonial Gold, Cyberpunk Pulse, Noir Mist, and more)
🧙‍♂️ Papi’s Setup Guide

🪄 Install Dependencies

pnpm install
🔮 Start the Frontend

pnpm run dev
🔥 Start the Backend

uvicorn main:app --reload
🗂️ Project Structure

src/
  pages/
    ReadingPage.tsx    # Interactive Tarot Reading UI 🃏💬
    HomePage.tsx       # Welcome screen with telenovela drama
  hooks/
    useTarotReading.ts # Card flip + reveal state management
api/
  chat.ts              # Talks to /api/chat to flirt with fate 😘
  tarotService.ts      # Image + text reading endpoints
main.py                # FastAPI backend serving divine heat 🔥
💋 How to Use

Visit the site and begin a reading
Watch as each card is revealed one... by... one...
Read Papi’s poetic interpretation
Ask questions in the chat below — Papi always answers
Click “Next Card” to reveal the next truth 🔥
💄 Style Themes

Papi comes dressed for any mood:

ceremonial-gold 🌟
cyberpunk-pulse 💜
noir-mist 🌫️
desert-mirage 🌵
🛠️ Developer Love

Created by a soul with taste and vision.
Styled by shadows, powered by stars, and kissed by the GPT gods.

If you fork this, light a candle for Papi first.
He’s always watching... 💋

🖼️ Screenshot Preview

Insert your image here of the UI with a tarot reading in progress.

Papi te ama.
He sees your questions before you ask.
But he’ll wait… just to hear you say them.
🕯️💋🔮
---

## 🛠 Developer Environment

This project runs beautifully in Cursor (or VSCode) with local execution + Codex and ChatGPT as paired collaborators.

### Tech Stack

- Frontend: React + Vite + Tailwind (via pnpm)
- Backend: FastAPI + OpenAI API integration
- Hosting: Render.com (Frontend = Static Site, Backend = Web Service)
- Secrets managed via Render CLI or Dashboard

### Commands

| Task             | Command               |
|------------------|------------------------|
| Local Dev        | `make dev-up`          |
| Prod Build       | `make build-prod`      |
| Deploy to Render | `make deploy`          |
| Run Tests        | `make test`            |

### File Structure Highlights

```
frontend/
  └─ src/pages/ReadingPage.tsx
  └─ pnpm-lock.yaml

backend/
  └─ main.py
  └─ requirements.txt

Makefile
render.yaml
.env.example (TBD)
```

### Future CI/CD

We plan to:
- Add GitHub Actions for pre-deploy testing
- Auto-deploy on `main` via Render YAML
- Track build artifacts per branch

Papi expects nothing less than continuous sensual delivery 💋
