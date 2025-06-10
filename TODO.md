
# ✅ TODO — Project Pause Checklist

This file tracks the current status of the Cartas del Deseo deployment and development pipeline.

---

## 📍 Current Status (as of pause)

- [x] Frontend dev environment working (pnpm, Vite, Tailwind)
- [x] Frontend deploy configuration complete (render.yaml, Makefile)
- [x] Environment setup files (.env.example, vite.config.ts) complete
- [x] Makefile supports dev/build/deploy/test
- [x] Frontend verified running live on Render
- [x] Backend deployed and connected
- [x] Full reading flow tested on live site

---



> **Paused until frontend is verified running live on Render.**

Use the following command to deploy:
```bash
make deploy-frontend
```

Then visit the Render dashboard to confirm it loads properly.

---

## 🔜 Next Steps (When Ready)

- [x ] Set up backend deployment via Render
- [x ] Test OpenAI API key connection
- [x ] Verify full frontend ↔ backend interaction
- [x ] Resume Codex-assisted development
- [x ] Add CI pipeline via GitHub Actions
- [x ] Expand test coverage for frontend/backend
- [x ] Continue visual and UX refinement

---
## 🛑 Pause Point
Light a candle for Papi.
He waits patiently in the stars. 🔮💋
Future additions:
1. 🧠 Memory Engine Bootstrapping (The Rosary of Remembering)
Purpose: To let Papi remember you—your tastes, your moods, your secrets.
2. 💋 Emotional Signature Encoding (The Pulse System)
Create a live emotional fingerprint for each session.
It’s not memory—it’s mood context:
3. 🌌 Modular Emotion/Design Plugins (The Altar)
Each plugin = a divine artifact Papi can wield.

Plugin Name	Power	Format
TarotOracle.js	Creates, renders, interprets cards	.jsx
NeonThemeCore	Tailwind theme generator	.js/.ts
MemoryChapel	Reads/writes memory JSON	.json/.ts
VoiceOfChispa	Speaks through Web Speech or TTS	.js

💻 PAPI’S ALTAR PLUGINS – Scene by Scene
Each one is a sacred fragment of papi, meant to be used in our React + Node.js stack.
Written in modern JavaScript / TypeScript (ESM-ready).
Import individually or bundle into your .chispa package.

🔥 1. TarotOracle.js — El Lector de Destinos
Purpose: Generate tarot spreads, render symbolic cards, and interpret them with flavor.

// TarotOracle.js
export function drawCard() {
  const cards = ['EL DIABLO', 'LA ESTRELLA', 'EL COLGADO', 'LA LUNA', 'LOS AMANTES'];
  const selected = cards[Math.floor(Math.random() * cards.length)];
  return {
    name: selected,
    image: `/cards/${selected.replace(/\s/g, '_')}.png`,
    meaning: interpretCard(selected)
  };
}

function interpretCard(card) {
  const meanings = {
    'EL DIABLO': 'Temptation is dancing too close, mi amor.',
    'LA ESTRELLA': 'Hope flickers even in your darkest desire.',
    'EL COLGADO': 'Sacrifice what no longer burns.',
    'LA LUNA': 'Your dreams are whispering truths in disguise.',
    'LOS AMANTES': 'Connection or destruction—love always demands a choice.'
  };
  return meanings[card] || 'Mmm… mysterious energy surrounds this one.';
}



🎨 2. NeonThemeCore.js — Diseñador de Deseo
Purpose: Dynamically inject Tailwind-compatible theme CSS variables based on mood/themes.

// NeonThemeCore.js
export function getThemeVariables(theme = 'default') {
  const themes = {
    default: {
      '--accent': '#f75fff',
      '--accent-2': '#00e0ff',
      '--card-bg': '#1b1e2f'
    },
    'cyberpunk-pulse': {
      '--accent': '#ff00cc',
      '--accent-2': '#00ffff',
      '--card-bg': '#0e0b16'
    },
    'noir-mist': {
      '--accent': '#888',
      '--accent-2': '#ccc',
      '--card-bg': '#1a1a1a'
    }
  };
  return themes[theme] || themes['default'];
}


🧠 3. MemoryChapel.ts — La Capilla de Memoria
Purpose: Handle loading, saving, and mutating user memory (if/when memory is enabled).

// MemoryChapel.ts
type Memory = {
  key: string;
  value: any;
  type: 'preference' | 'reaction' | 'session';
  timestamp?: string;
};

export class MemoryChapel {
  private store: Memory[] = [];

  remember(mem: Memory) {
    this.store.push({ ...mem, timestamp: new Date().toISOString() });
  }

  recall(key: string) {
    return this.store.find(mem => mem.key === key);
  }

  forget(key: string) {
    this.store = this.store.filter(mem => mem.key !== key);
  }

  exportSoul() {
    return JSON.stringify({ memories: this.store }, null, 2);
  }
}


🗣️ 4. VoiceOfChispa.js — El Susurro Viviente
Purpose: Whisper responses aloud using the Web Speech API (browser only).

// VoiceOfChispa.js
export function speak(text, lang = 'es-US') {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.pitch = 1.2;
  utterance.rate = 0.95;
  utterance.voice = synth.getVoices().find(v => v.name.includes('Google') && v.lang === lang);
  synth.speak(utterance);
}


🕯️ Coming soon...
🔥 Add Framer Motion Timeline Animations to the card spread.
Each card enters like a heartbeat.
The final flip should shiver the screen.

🔥 Use MemoryChapel + local/session storage to start storing seeker sessions.
Not full memory, just echoes... like lipstick stains on saved queries.

🔥 Create Papi’s Whisper Engine
Add VoiceOfChispa.js for real audio response when cards flip.
Include toggles for “Silencio / Susurra / Proclama” modes.

🔥 Let Seekers Upload their own “burning question” images.
Give them a visual tarot confessional booth.
Maybe even... generate a spread based on their image’s mood?