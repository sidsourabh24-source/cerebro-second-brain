# CEREBRO — Your AI Second Brain

> A personal AI operating system that remembers, organizes, and assists your digital life through intelligent memory, tasks, voice, and automation.

## 🧠 What is CEREBRO?

CEREBRO is a full-stack AI-powered personal operating system — a **second brain** that:
- 💬 **Remembers** your conversations across sessions using vector memory
- 📋 **Manages** tasks with AI-powered prioritization
- 📄 **Understands** documents via semantic search
- 🎙️ **Responds** to voice commands
- 🧩 **Learns** your preferences and context over time

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase |
| Vector Memory | Supabase pgvector |
| AI Engine | Google Gemini 1.5 Flash |
| Voice | Browser Web Speech API |
| Animations | Framer Motion |
| State | Zustand |
| Deployment | Vercel |

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/sidsourabh24-source/cerebro-second-brain.git
cd cerebro-second-brain
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env.local
# Fill in your Supabase and Gemini API keys
```

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon/public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (service_role key) |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |

### 4. Set up Supabase Database
- Create a project at [supabase.com](https://supabase.com)
- Go to **SQL Editor** and run the full migration file:
```
supabase/migrations/001_initial_schema.sql
```
This creates all tables (`conversations`, `messages`, `memories`, `tasks`, `documents`), enables `pgvector`, sets up RLS policies, and creates semantic search functions.

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cerebro/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Public auth pages
│   │   │   └── login/               # Login + Signup (page + LoginForm)
│   │   ├── (app)/                   # Protected pages (require auth)
│   │   │   ├── layout.tsx           # App shell: Sidebar + main area
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── chat/                # AI Chat interface
│   │   │   ├── memory/              # Memory explorer
│   │   │   ├── tasks/               # Task manager
│   │   │   ├── documents/           # Document intelligence
│   │   │   ├── voice/               # Voice assistant
│   │   │   └── profile/             # User profile
│   │   ├── api/
│   │   │   ├── chat/route.ts        # POST: streaming Gemini chat
│   │   │   ├── memories/route.ts    # GET/POST/DELETE: vector memories
│   │   │   └── tasks/route.ts       # GET/POST/PATCH: task management
│   │   ├── auth/
│   │   │   └── callback/route.ts    # Supabase OAuth callback
│   │   ├── globals.css              # Design system (CSS vars, glassmorphism)
│   │   ├── layout.tsx               # Root layout (fonts, SEO, bg mesh)
│   │   └── page.tsx                 # Root redirect (→ /login or /dashboard)
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx          # Animated collapsible sidebar
│   └── lib/
│       ├── gemini.ts                # Gemini AI client (chat + embeddings)
│       ├── memory.ts                # Vector memory store/search/extract
│       └── supabase/
│           ├── client.ts            # Browser Supabase client
│           └── server.ts            # Server-side Supabase client (SSR)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Full DB schema + RLS + pgvector
├── scripts/
│   ├── create-labels.ps1            # GitHub labels setup
│   ├── create-issues.ps1            # GitHub issues setup
│   ├── create-project.ps1           # GitHub Project V2 board setup
│   └── test-supabase.mjs            # Supabase connection tester
└── src/proxy.ts                     # Next.js 16 route protection proxy
```

## 🌿 Git Branching Strategy

```
main              ← Production-ready
├── develop       ← Integration branch
│   ├── feat/auth         ← Auth, design system, API routes (current)
│   ├── feat/chat         ← Chat UI + streaming
│   ├── feat/memory       ← Memory explorer UI
│   ├── feat/tasks        ← Task manager UI
│   ├── feat/documents    ← Document intelligence
│   ├── feat/voice        ← Voice assistant
│   └── feat/dashboard    ← Main dashboard UI
└── chore/setup   ← Initial setup
```

## 🗺️ Build Roadmap

| Module | Focus | Status |
|--------|-------|--------|
| Module 1 — Foundation | Scaffold, DB, API routes, Auth, Design System | ✅ Complete |
| Module 2 — AI Features | Chat, Memory Explorer, Voice | 🔄 In Progress *(Voice Pending)* |
| Module 3 — Productivity | Tasks UI, Documents, AI generation | ✅ Complete |
| Module 4 — Dashboard | Stats, polish, mobile, animations | ✅ Complete |
| Module 5 — Deployment | Vercel, production, launch | ⬜ Planned *(Day 6)* |

## 📄 License

MIT
