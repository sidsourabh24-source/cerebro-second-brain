$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$repo = "sidsourabh24-source/cerebro-second-brain"
$token = (gh auth token)

$headers = @{
    Authorization = "Bearer $token"
    Accept = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

$issues = @(
    @{
        title = "feat: Design System and Global CSS - CEREBRO Theme"
        body = "## Overview`nSet up the CEREBRO design system - dark theme, color tokens, typography, and glassmorphism.`n`n## Tasks`n- Configure Tailwind with custom CEREBRO color palette`n- Global CSS with CSS custom properties`n- Google Font (Inter/Outfit)`n- Glassmorphism card utilities`n- Dark mode as default`n`n## Design Tokens`n- Primary: Deep purple #7C3AED`n- Background: #0A0A0F`n- Surface: #12121A`n- Accent: #06B6D4`n`n## Acceptance Criteria`n- App loads with dark futuristic theme`n- Glassmorphism cards look beautiful`n- Typography is clean and modern"
        labels = @("feature","ui","week-1","priority:high")
        milestone = 1
    },
    @{
        title = "feat: App Shell and Sidebar Navigation Layout"
        body = "## Overview`nBuild the main app shell with sidebar navigation - backbone of CEREBRO.`n`n## Tasks`n- Root layout.tsx with sidebar and main content`n- Sidebar with Lucide icons`n- Nav links: Dashboard, Chat, Tasks, Memory, Documents, Voice`n- Active link highlighting with glow`n- Mobile collapsible sidebar`n- User avatar and logout button`n- Framer Motion animations`n`n## Acceptance Criteria`n- Sidebar renders with all links`n- Active page clearly highlighted`n- Collapses cleanly on mobile"
        labels = @("feature","ui","week-1","priority:high")
        milestone = 1
    },
    @{
        title = "feat: Authentication - Login and Signup via Supabase"
        body = "## Overview`nFull authentication flow - the gateway into CEREBRO.`n`n## Tasks`n- /login page with email/password`n- /signup page with name, email, password`n- Server actions for login, signup, logout`n- middleware.ts for protected routes`n- Error handling with clear messages`n- Loading states`n- Redirect to /dashboard after login`n- Auto-create user profile on signup`n`n## Acceptance Criteria`n- User can sign up and log in`n- Session persists across refreshes`n- Protected routes redirect to /login`n- Logout works cleanly"
        labels = @("feature","week-1","priority:high")
        milestone = 1
    },
    @{
        title = "feat: Stunning Landing Page - CEREBRO Hero"
        body = "## Overview`nThe first impression - must feel premium, not like a student project.`n`n## Tasks`n- Hero with animated gradient background`n- CEREBRO logo and tagline`n- Floating particle or grid animation`n- Feature highlights section`n- CTA buttons: Get Started and See How It Works`n- Footer with GitHub and tech badges`n- Scroll reveal animations`n`n## Acceptance Criteria`n- Looks premium and futuristic`n- Animations at 60fps`n- CTA leads to /signup`n- Responsive on all screen sizes"
        labels = @("feature","ui","week-1","priority:high")
        milestone = 1
    },
    @{
        title = "feat: AI Chat Interface with Gemini 1.5 Flash Streaming"
        body = "## Overview`nCore interface - smooth, fast, intelligent AI conversations.`n`n## Tasks`n- Chat layout: message list and sticky input bar`n- User bubbles right-aligned, purple`n- Assistant bubbles left-aligned, glass card`n- Streaming with typing indicator animation`n- Markdown rendering in responses`n- Code block syntax highlighting`n- API route /api/chat with Gemini 1.5 Flash`n- Auto-scroll to latest message`n`n## Tech`n- Gemini 1.5 Flash streaming`n- react-markdown and remark-gfm`n- react-syntax-highlighter`n`n## Acceptance Criteria`n- Streaming AI responses work`n- Markdown and code render correctly`n- Feels fast and responsive"
        labels = @("feature","ai","ui","week-1","priority:high")
        milestone = 1
    },
    @{
        title = "feat: Conversation History - Save and Load Chats"
        body = "## Overview`nPersist all conversations to Supabase.`n`n## Tasks`n- Save conversation on first message`n- Save each message to messages table`n- Conversation list in sidebar`n- Load previous conversations`n- Auto-generate titles with AI`n- Delete conversation`n- Show relative timestamps`n`n## Acceptance Criteria`n- Chats persist across sessions`n- Past conversations listed in sidebar`n- Switching conversations is seamless"
        labels = @("feature","week-1","priority:medium")
        milestone = 1
    },
    @{
        title = "feat: Semantic Memory System - AI That Remembers You"
        body = "## Overview`nTHE standout feature. Persistent AI memory across all conversations.`n`n## How It Works`n1. User sends message`n2. Search memories via pgvector similarity`n3. Inject top 5 relevant memories into prompt`n4. Gemini responds with context`n5. Auto-extract new facts and store embeddings`n`n## Tasks`n- Memory retrieval in chat API`n- Auto-extract facts with Gemini`n- Embeddings via text-embedding-004`n- Store in Supabase memories table`n- search_memories RPC function`n- buildMemoryContext utility`n- Test memory recall across sessions`n`n## Acceptance Criteria`n- AI recalls facts from previous conversations`n- Embeddings stored in Supabase`n- Relevant memories auto-injected"
        labels = @("feature","ai","week-2","priority:high")
        milestone = 2
    },
    @{
        title = "feat: Memory Explorer - Browse and Manage Your Memories"
        body = "## Overview`nBeautiful UI to see, search, and manage CEREBRO's memory of you.`n`n## Tasks`n- /memory page with paginated card grid`n- Each card: content, importance, source, date`n- Semantic search bar`n- Filter by source (auto vs manual)`n- Importance indicators 1-5 stars`n- Manual memory creation`n- Delete memory with confirmation`n- Empty state illustration`n`n## Acceptance Criteria`n- All memories shown in card grid`n- Semantic search works`n- User can create and delete memories"
        labels = @("feature","ui","week-2","priority:medium")
        milestone = 2
    },
    @{
        title = "feat: AI Task Manager - Smart Productivity Assistant"
        body = "## Overview`nAI-powered task management that understands your context.`n`n## Tasks`n- CRUD API routes /api/tasks`n- /tasks page with list and kanban view`n- Task cards with priority and status badges`n- Create task form`n- AI task generation from natural language`n- Mark complete and update status`n- Filter by status and priority`n- Due date with overdue warnings`n`n## Acceptance Criteria`n- Full CRUD works`n- AI generates tasks from text`n- Priority and status are color-coded"
        labels = @("feature","ai","week-2","priority:high")
        milestone = 2
    },
    @{
        title = "feat: AI Dashboard - CEREBRO Command Center"
        body = "## Overview`nFuturistic mission control - first screen after login.`n`n## Widgets`n- Welcome header with user name`n- Stats: memories, tasks, conversations`n- AI Daily Briefing by Gemini`n- Recent conversations`n- Today's tasks`n- Recent memories`n- Quick actions: Chat, Task, Doc, Voice`n`n## Acceptance Criteria`n- Live data from Supabase`n- AI briefing generated on load`n- Fast with skeleton loading states`n- Looks incredible"
        labels = @("feature","ui","ai","week-2","priority:high")
        milestone = 2
    },
    @{
        title = "feat: Document Intelligence - Upload and Query PDFs"
        body = "## Overview`nUpload any PDF and have an intelligent conversation with it.`n`n## Tasks`n- Drag-and-drop upload with progress`n- PDF parsing with pdf-parse`n- Smart chunking ~500 tokens`n- Embed chunks with Gemini text-embedding-004`n- Store in document_chunks table`n- AI auto-summarization on upload`n- Q&A API route /api/documents/query`n- /documents page with file list`n- Semantic search across documents`n`n## Acceptance Criteria`n- User can upload PDFs`n- AI summarizes immediately`n- Q&A returns accurate answers"
        labels = @("feature","ai","week-3","priority:high")
        milestone = 3
    },
    @{
        title = "feat: Voice Assistant - Talk to CEREBRO Jarvis Mode"
        body = "## Overview`nHands-free AI interaction. Speak to CEREBRO, hear it respond.`n`n## Tasks`n- useVoice hook with Web Speech API`n- Animated microphone button with pulse`n- STT to chat API pipeline`n- TTS via SpeechSynthesis API`n- /voice page with Jarvis-like circular UI`n- Voice toggle in chat interface`n- Waveform animation while AI speaks`n`n## Acceptance Criteria`n- User can speak to CEREBRO`n- AI responds with voice`n- Mic animation is smooth`n- Works on Chrome and Edge"
        labels = @("feature","ai","ui","week-3","priority:medium")
        milestone = 3
    },
    @{
        title = "enhancement: UI Polish, Animations and Micro-interactions"
        body = "## Overview`nFinal polish - transform CEREBRO from working app to premium product.`n`n## Tasks`n- Page transitions with Framer Motion`n- Loading skeletons everywhere`n- Button and card micro-animations`n- Toast notifications`n- Empty state illustrations`n- Smooth scroll site-wide`n- Full mobile audit 320px to 1440px`n- Accessibility focus states`n`n## Acceptance Criteria`n- No layout shifts`n- All loading states handled`n- Feels premium on all screens"
        labels = @("enhancement","ui","week-3","priority:medium")
        milestone = 3
    },
    @{
        title = "chore: Production Deployment to Vercel"
        body = "## Overview`nDeploy CEREBRO to production and make it live.`n`n## Tasks`n- Connect GitHub repo to Vercel`n- Add env vars: SUPABASE_URL, SUPABASE_ANON_KEY, SERVICE_ROLE_KEY, GEMINI_API_KEY`n- Local build test: npm run build`n- Fix any build errors`n- Enable Vercel Preview Deployments for PRs`n- Final QA on production URL`n- Update README with live URL`n`n## Acceptance Criteria`n- App live on Vercel URL`n- All features work in production`n- Zero build errors`n- PR previews enabled"
        labels = @("chore","week-3","priority:high")
        milestone = 3
    }
)

Write-Host "Creating 14 issues..." -ForegroundColor Cyan

foreach ($issue in $issues) {
    $body = @{
        title     = $issue.title
        body      = $issue.body
        labels    = $issue.labels
        milestone = $issue.milestone
    } | ConvertTo-Json -Compress

    try {
        Invoke-RestMethod -Uri "https://api.github.com/repos/$repo/issues" `
            -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
        Write-Host "  Created: $($issue.title.Substring(0, [Math]::Min(60, $issue.title.Length)))..." -ForegroundColor Green
    } catch {
        Write-Host "  ERROR on: $($issue.title)" -ForegroundColor Red
        Write-Host "  $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! All issues created on GitHub." -ForegroundColor Cyan
