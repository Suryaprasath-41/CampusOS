# 🚀 CampusOS AI v2.0 — Deployment & Setup Guide

**Complete guide for running CampusOS on your own machine or deploying it online.**

---

## ⚡ QUICK START (Local Development)

### Prerequisites
- **Node.js** 18+ — Download from https://nodejs.org (LTS version)
- **A Google account** — For the free Gemini AI API key

### Step-by-Step

```bash
# 1. Navigate to the project folder
cd CampusOS

# 2. Install all dependencies
npm install

# 3. Create .env file (or edit the existing one)
#    Just add your Gemini API key on the GEMINI_API_KEY line
#    Get a FREE key at: https://aistudio.google.com/apikey

# 4. Set up the database
npx prisma db push
npx prisma generate

# 5. Seed the database (creates admin + demo data)
npx tsx prisma/seed.ts

# 6. Start the app
npm run dev

# 7. Open http://localhost:3000 and log in:
#    Email:    admin@JSE.com
#    Password: Samyukth@2378
```

### Windows Shortcut
Just double-click **`start.bat`** — it does steps 2-6 automatically.

---

## 🤖 AI SETUP — Google Gemini (FREE)

### What AI Does CampusOS Use?

| Feature | AI Service | Cost |
|---------|-----------|------|
| Chat (all 7 agents) | **Google Gemini 2.0 Flash** | **FREE** |
| Voice-to-Text | **Browser Web Speech API** | **FREE** (built into Chrome) |

### How to Get Your Free Gemini API Key

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key
5. Open the `.env` file in the project root
6. Paste it next to `GEMINI_API_KEY=`:
   ```
   GEMINI_API_KEY=AIzaSyB...your-key-here
   ```
7. Restart the dev server (`Ctrl+C` then `npm run dev` again)

### Gemini Free Tier Limits

| Limit | Value |
|-------|-------|
| Requests per minute | 15 |
| Tokens per minute | 1,000,000 |
| Requests per day | 1,500 |
| Cost | **$0 — completely free** |

For a campus with ~100 students, this is more than enough. If you need more, upgrade to Gemini Pro (pay-per-use).

### Troubleshooting AI Issues

| Error | Fix |
|-------|-----|
| "AI is not configured" | Add GEMINI_API_KEY to .env file |
| "AI rate limit reached" | Wait 1 minute (15 req/min limit) |
| "AI API key is invalid" | Check your key at aistudio.google.com |
| Chat shows generic error | Restart the dev server after adding the key |

---

## 🔍 WHAT WORKS AND WHAT CHANGES AFTER DOWNLOAD

### ✅ Works Perfectly (No Changes Needed)

| Feature | How It Works |
|---------|-------------|
| **Login System** | Local bcrypt + HMAC tokens — fully self-contained |
| **Admin Account Creation** | Creates @JSE.com users in SQLite — works offline |
| **Role-Based Access** | Middleware + cookie tokens — fully self-contained |
| **Student Dashboard** | Reads from SQLite via Prisma — works offline |
| **All 14 Student Sections** | Attendance, Placement, Library, etc. — all Prisma → SQLite |
| **Faculty Portal (7 tabs)** | All data from SQLite — works offline |
| **Admin Portal (11 tabs)** | All data from SQLite — works offline |
| **Dark/Light Mode** | next-themes + CSS variables — works offline |
| **Splash Screen** | Client-side animation — works offline |
| **Charts & Graphs** | Recharts (client-side) — works offline |
| **Animations** | Framer Motion (client-side) — works offline |
| **Command Palette** | Ctrl+K — client-side, works offline |
| **Notifications** | Stored in SQLite — works offline |
| **Sidebar Navigation** | Client-side routing — works offline |
| **Glassmorphism UI** | CSS — works everywhere |
| **Voice-to-Text** | Browser Web Speech API — works in Chrome/Edge |

### ⚠️ Needs Your API Key

| Feature | What You Need |
|---------|--------------|
| **AI Chat (7 agents)** | GEMINI_API_KEY in .env — get free at https://aistudio.google.com/apikey |
| **Context-Aware AI Buttons** | Same — uses the AI chat behind the scenes |
| **Voice-to-AI** | Same — transcribes voice, sends to AI chat |

### 🔧 Already Fixed For You (Was Broken Before Download)

| Issue | What Was Wrong | What I Fixed |
|-------|---------------|-------------|
| **AI SDK** | Used `z-ai-web-dev-sdk` (only works on dev server) | Replaced with **Google Gemini** (works anywhere with API key) |
| **Favicon** | Pointed to `z-cdn.chatglm.cn` (external CDN) | Changed to local `/logo.svg` |
| **Config** | Had sandbox IPs in `allowedDevOrigins` | Cleaned up to `localhost:3000` only |
| **Proxy** | Hardcoded `127.0.0.1:8001` (Python backend that doesn't exist) | Made configurable via env, safe fallback |
| **Dashboard** | Had `_pythonBackend` reference | Removed |

---

## 🌐 DEPLOYING TO THE INTERNET

### Option 1: Vercel (Easiest — Free Tier Available)

**⚠️ CRITICAL: SQLite will NOT work on Vercel.** Vercel is serverless — no persistent file system.

You MUST switch to a cloud database:

**Switch to PostgreSQL (recommended):**
1. Get a free PostgreSQL database from:
   - **Neon** (https://neon.tech) — Free tier, 0.5GB
   - **Supabase** (https://supabase.com) — Free tier, 500MB
   - **Railway** (https://railway.app) — Free tier

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Update `.env`:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

4. Push schema & seed:
   ```bash
   npx prisma db push
   npx prisma generate
   npx tsx prisma/seed.ts
   ```

5. Deploy to Vercel:
   ```bash
   npm i -g vercel
   vercel
   ```
   Add environment variables in Vercel dashboard: `DATABASE_URL`, `GEMINI_API_KEY`, `CAMPUOS_HMAC_SECRET`, `NEXTAUTH_SECRET`

### Option 2: Railway (Full Server — Free Tier Available)

Railway gives you a real server with persistent storage — SQLite works!

1. Go to https://railway.app
2. Connect your GitHub repo
3. Add environment variables: `GEMINI_API_KEY`, `CAMPUOS_HMAC_SECRET`, `NEXTAUTH_SECRET`
4. Railway auto-detects Next.js and deploys
5. SQLite file persists on Railway's volume

### Option 3: Your Own VPS (Full Control — $5-10/month)

1. Get a VPS from DigitalOcean, Linode, or Hetzner
2. Install Node.js 18+ and npm
3. Clone your repo
4. Set up `.env`
5. Run:
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   npx tsx prisma/seed.ts
   npm run build
   npm run start
   ```
6. Use Nginx as a reverse proxy to port 3000
7. Add SSL with Let's Encrypt (free)

### Option 4: Docker (Any Cloud)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔒 SECURITY CHECKLIST FOR PRODUCTION

### Before Going Live:

- [ ] **Change HMAC secret** — Replace `campusos-ai-hmac-secret-2025-jse` with a random 64-character string
- [ ] **Change NEXTAUTH_SECRET** — Replace with a random 64-character string
- [ ] **Change admin password** — Log in as admin@JSE.com, change password from Samyukth@2378
- [ ] **Add HTTPS** — Never run auth over HTTP. Use a reverse proxy with SSL.
- [ ] **Set cookie httpOnly** — In `login/route.ts`, change `httpOnly: false` to `httpOnly: true`
- [ ] **Enable CORS** — If frontend and backend are on different domains
- [ ] **Rate limit** — Already built in (5 attempts / 15 min), but consider Cloudflare for DDoS
- [ ] **Remove TypeScript ignore** — In `next.config.ts`, set `ignoreBuildErrors: false` for production

### Generating Secure Secrets:
```bash
# On Mac/Linux:
openssl rand -hex 32

# On Windows PowerShell:
-join ((1..32) | ForEach-Object { "{0:x2}" -f (Get-Random -Maximum 256) })
```

---

## 📋 ENVIRONMENT VARIABLES REFERENCE

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | SQLite or PostgreSQL connection string | `file:./db/custom.db` (local) or `postgresql://...` (cloud) |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini AI API key | `AIzaSyB...` |
| `CAMPUOS_HMAC_SECRET` | ✅ Yes | Secret for signing auth tokens | Random 64-char string |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for NextAuth.js | Random 64-char string |
| `PROXY_API_BASE` | ❌ No | External API proxy (if needed) | `https://api.example.com` |

---

## 🌍 BROWSER COMPATIBILITY

| Browser | Full Support | Notes |
|---------|-------------|-------|
| **Chrome** | ✅ Yes | Voice input works perfectly |
| **Edge** | ✅ Yes | Voice input works |
| **Safari** | ✅ Yes | Voice input works (macOS/iOS) |
| **Firefox** | ⚠️ Partial | Voice input does NOT work (no Web Speech API) |
| **Mobile Chrome** | ✅ Yes | Voice input works on Android |
| **Mobile Safari** | ⚠️ Partial | Voice input limited on iOS |

---

## ❓ FREQUENTLY ASKED QUESTIONS

### "The AI chat says it's not configured"
→ Add your `GEMINI_API_KEY` to the `.env` file and restart the server.

### "I get 'Too many login attempts' after testing"
→ Wait 15 minutes or restart the server (in-memory rate limiter resets).

### "Voice input doesn't work"
→ Use Chrome or Edge. Firefox doesn't support Web Speech API.

### "Can I use this without the AI?"
→ Yes! Everything except the chat panel works without the API key. All dashboards, charts, data, and navigation work offline.

### "Can I use a different AI model?"
→ Yes. Edit `src/app/api/chat/route.ts`. Replace the Gemini code with OpenAI, Claude, or any LLM API. The interface is simple: receives a message + context, returns a text response.

### "How do I change the admin password?"
→ Log in as admin, go to Settings, change password. Or reset via database:
```bash
npx tsx -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('YourNewPassword', 10);
console.log('New hash:', hash);
// Then update in SQLite directly
"
```

### "Database is corrupted / I want to start fresh"
→ Delete `db/custom.db` and re-run:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

**CampusOS AI v2.0 — Enterprise Edition**
**Made by Jai Samyukth Enterprises**
**© 2025 All Rights Reserved**
