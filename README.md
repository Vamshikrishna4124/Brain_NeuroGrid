# NEUROGRID 🧠

> A brain training game built for ADHD and focus. Find numbers in order. Think faster.

![License](https://img.shields.io/badge/license-MIT-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-5-yellow)

---

## Features

- **3×3 to 10×10** grid sizes — difficulty scales automatically
- **4 game modes** — Normal, Reverse, Even only, Odd only
- **Focus dot** — tiny blinking dot on the current target, no highlighting
- **Silent wrong clicks** — no red flash, no shake. Just silence. Find it yourself.
- **Countdown** — 3-2-1-GO before every game
- **Rank system** — Beginner → Intermediate → Pro → Expert (thresholds scale per grid size)
- **Persistent stats** — best times, averages, streak, longest streak (saved via localStorage)
- **Simulated multiplayer** — create/join a room code, race against AI peers
- **Confetti** on Expert rank
- **ADHD-friendly UI** — dark, high contrast, minimal clutter, animated depth

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool |
| Framer Motion | Animations & transitions |
| Zustand | Global state + localStorage persistence |
| React Router v6 | Screen routing |
| CSS Modules | Scoped styles |

---

## Getting Started

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/neurogrid.git
cd neurogrid
```

### 2. Install

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`

---

## Deploy to GitHub Pages

### Option A — gh-pages (easiest)

```bash
npm install -D gh-pages
```

Add to `package.json` scripts:
```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

Add to `vite.config.js`:
```js
base: '/neurogrid/',   // replace with your repo name
```

Then:
```bash
npm run deploy
```

Go to **Settings → Pages → Source → gh-pages branch** in your GitHub repo.

---

### Option B — Vercel (zero config)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Select repo → Deploy

Done. Vercel auto-detects Vite.

---

### Option C — Netlify

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com) → New site from Git
3. Build command: `npm run build`
4. Publish dir: `dist`
5. Deploy

---

## Project Structure

```
neurogrid/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── BackgroundBlobs.jsx      # Animated ambient blobs
│   │   ├── Countdown.jsx            # 3-2-1-GO overlay
│   │   ├── GameGrid.jsx             # The actual number grid
│   │   ├── GameScreen.jsx           # Game screen wrapper
│   │   ├── HomeScreen.jsx           # Config + name + mode + room
│   │   ├── HUD.jsx                  # Timer, best, avg, streak dots
│   │   ├── MultiplayerPanel.jsx     # Live peer progress bars
│   │   └── ResultScreen.jsx         # Score, rank, leaderboard
│   ├── hooks/
│   │   ├── useConfetti.js           # Confetti spawner
│   │   ├── useMultiplayer.js        # Simulated peer AI
│   │   └── useTimer.js              # RAF-based live timer
│   ├── store/
│   │   └── gameStore.js             # Zustand store (game state + stats)
│   ├── styles/
│   │   └── globals.css              # Global CSS vars & resets
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Real Multiplayer (future upgrade)

The current multiplayer uses simulated AI peers. To make it truly real-time:

1. Add [Partykit](https://partykit.io) or [Socket.io](https://socket.io)
2. Replace `useMultiplayer.js` with WebSocket logic
3. Broadcast `currentIndex` on every correct click

---

## License

MIT — use it, fork it, build on it.
