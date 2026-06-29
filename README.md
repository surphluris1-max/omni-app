# OmniTool - Multi-Tool Super App

A responsive, full-stack web application combining productivity, social sharing, finance, and AI tools into one beautiful interface.

## ✨ Features

- **Voice & AI Task Manager** — Dictate tasks via microphone, organize into folders, and let AI arrange them. Track progress with live charts.
- **Social Sharing** — Add friends using 9-digit unique IDs or share links. Share task folders with friends/family.
- **Bill Splitting** — Add expenses, tag friends, and the app automatically calculates each person's share.
- **Disease Detector** — AI-powered symptom checker for plants and pets.
- **Air Quality Index** — Live AQI display based on your browser geolocation.
- **Profile System** — Upload a profile picture, optional email login, unique 9-digit identity code.

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS (Glassmorphism, Dark Mode) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Voice | Web Speech API |
| Location | Browser Geolocation API |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd multi-tool-app

# Install frontend
cd frontend
npm install

# Install backend
cd ../backend
npm install
```

### 2. Run

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📱 Responsive

The app is fully responsive — works on desktop, tablet, and phone. The sidebar collapses into an icon-only bottom bar on mobile.

## 🌐 Deployment

### Frontend (GitHub Pages / Vercel / Netlify)
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder to any static hosting.

### Backend (Render / Railway / Fly.io)
Deploy the `backend/` folder as a Node.js app.

> **Note:** For a live link with both frontend and backend, use **Vercel** (frontend) + **Render** (backend), or deploy both on **Railway**.

## 📄 License

MIT
