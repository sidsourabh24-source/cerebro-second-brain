# CEREBRO — Your AI Second Brain

> A personal AI operating system that remembers, organizes, and assists your digital life through intelligent memory, tasks, voice, and automation.

![CEREBRO](./public/og-image.png)

## 🧠 What is CEREBRO?

CEREBRO is a full-stack AI-powered personal operating system — a **second brain** that:
- 💬 **Remembers** your conversations across sessions
- 📋 **Manages** tasks with AI-powered prioritization
- 📄 **Understands** documents via semantic search
- 🎙️ **Responds** to voice commands
- 🧩 **Learns** your preferences and context over time

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Auth + DB | Supabase |
| Vector Memory | Supabase pgvector |
| AI Engine | Google Gemini 1.5 Flash |
| Voice | Browser Web Speech API |
| Animations | Framer Motion |
| Deployment | Vercel |

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/cerebro.git
cd cerebro
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

### 4. Set up Supabase
- Create a project at [supabase.com](https://supabase.com)
- Enable the `vector` extension in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
- Run the database migrations from `/supabase/migrations/`

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cerebro/
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── (auth)/        # Login / Signup
│   │   ├── dashboard/     # Main dashboard
│   │   ├── chat/          # AI Chat interface
│   │   ├── tasks/         # Task Manager
│   │   ├── memory/        # Memory explorer
│   │   ├── voice/         # Voice assistant
│   │   ├── documents/     # File intelligence
│   │   └── api/           # API routes
│   ├── components/        # Reusable UI components
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Helper functions
├── supabase/
│   └── migrations/        # Database schema
└── public/                # Static assets
```

## 🌿 Git Branching Strategy

```
main              ← Production-ready
├── develop       ← Integration branch
│   ├── feat/auth
│   ├── feat/chat
│   ├── feat/memory
│   ├── feat/tasks
│   ├── feat/documents
│   ├── feat/voice
│   └── feat/dashboard
└── chore/setup   ← Initial setup (current)
```

## 📄 License

MIT
