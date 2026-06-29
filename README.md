# OmniTool - Multi-Tool Super App

A responsive, full-stack web application combining productivity, social sharing, finance, AI tools, and messaging into one beautiful interface.

## ✨ Features

### 📝 Voice & AI Task Manager
- Dictate tasks via microphone (Web Speech API) or type them
- Organize tasks into personal folders or **Group folders**
- **Group Task Delegation** — assign tasks to specific friends in a group
- **Contribution Tracking** — view a live leaderboard of who completed the most group tasks
- Mark tasks as **Pending, Completed, Extended, or Abandoned**
- **AI task arrangement** — one click to auto-sort your tasks
- **Progress charts** — live donut chart showing task statuses

### 🎨 Notepad & Drawing Canvas
- Create text notes or **freehand drawings**
- Drawing tools: Color picker, brush size, eraser, and download image
- Notes are saved with a title and timestamp
- View visual thumbnails of your drawings on the dashboard

### 👥 Social System & Friends
- **No password login** — just enter a name, optional email, and upload a profile picture
- Every user gets a unique **9-digit ID** for identity
- Add friends by their ID or share a **link** — no phone number or email needed
- Friends appear in your friend list for tagging and messaging

### 💬 Groups & Messaging
- **Direct Messages (DMs)** — chat 1-on-1 with any friend
- **Group creation** — create named groups, pick friends as members
- **Group chat** — full chat interface within groups
- **Auto-expiry** — messages disappear after **3 days** automatically
- **Star messages** ⭐ — star-marked messages stay for **3 weeks** instead
- Each message shows a countdown (e.g. "2d left") and a star button
- Expiry cleanup runs every minute in the background

### 💰 Bill Splitting & Price Comparison
- Add expenses with a dollar amount and description
- **Tag friends** to automatically calculate each person's split
- Tagged friends get a notification alert
- Expenses persist across sessions

### 🩺 Disease Detector (Plants & Pets)
- Select **Plant** or **Pet/Animal**
- Describe symptoms in plain text
- AI-powered backend returns suggested diseases with descriptions

### 🌍 Air Quality Index (AQI)
- Uses **browser geolocation** to get your coordinates
- Displays local AQI level (1–5 scale), PM2.5 reading, and status badge
- Color-coded from green (Good) to red (Very Poor)

### 🎨 Premium UI
- Dark mode with **glassmorphism** panels
- Google **Outfit** font for modern typography
- Smooth animations, gradient buttons, glowing hover effects
- Fully **responsive** — desktop sidebar becomes a mobile icon bar

## 📊 Feature Duration Reference

| Feature | Duration | Notes |
|---------|----------|-------|
| Messages (default) | **3 days** | Auto-deleted after 3 days |
| Starred messages | **3 weeks** | Star ⭐ a message to extend its life |
| Tasks | **Permanent** | Stored in localStorage until manually deleted |
| Expenses | **Permanent** | Stored in localStorage until manually deleted |
| User session | **Permanent** | Stored until logout |

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
| Storage | localStorage (client-side) |

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
→ Runs on `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
→ Open `http://localhost:5173` in your browser

## 📱 Responsive Design

The app adapts to any screen size:
- **Desktop**: Sidebar navigation on the left
- **Mobile** (< 768px): Compact icon-only navigation bar at the top

## 🌐 Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder.

### Backend (Render / Railway)
Deploy the `backend/` folder as a Node.js service.

> **Recommended**: **Vercel** (frontend) + **Render** (backend) — both free.

## 📄 License

MIT
