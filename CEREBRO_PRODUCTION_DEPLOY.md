# CEREBRO — Production Deployment & Launch Blueprint

Welcome to the production deployment guide for **CEREBRO**! This document provides clear, step-by-step instructions to take your personal AI Second Brain out of the local development environment and deploy it securely to the cloud.

We will use:
* **Hosting Portal**: Vercel (Next.js 16 Edge Optimized Container)
* **Cloud Database & Vector Engine**: Supabase (PostgreSQL with `pgvector` enabled)
* **AI Cognitive Engine**: Google Gemini 1.5 Flash (Google AI Studio)

---

## 📁 1. Provisioning Your Production Supabase Database

1. Go to [Supabase Cloud](https://supabase.com) and log in.
2. Click **New Project**, choose your organization, name your project (e.g. `CEREBRO-Prod`), set a secure Database Password, and select the region closest to you.
3. Once the database finishes provisioning (takes ~2 minutes), go to the **SQL Editor** in the left sidebar.
4. Click **New Query**, copy the entire contents of your migration file:
   👉 [001_initial_schema.sql](file:///d:/Mini%20OS/cerebro/supabase/migrations/001_initial_schema.sql)
5. Paste the schema contents in the SQL Editor and click **Run**.
6. **Verification Checklist**:
   - [x] Go to **Table Editor** and confirm that all tables exist (`conversations`, `messages`, `memories`, `tasks`, `documents`, `document_chunks`, `user_profiles`).
   - [x] Go to **Database** → **Extensions** and verify that `vector` extension is active.
   - [x] Confirm that **Row Level Security (RLS)** policies are enabled on all tables (this secures your private memories).

---

## 🔒 2. Auditing Row Level Security (RLS)

CEREBRO enforces strict RLS policies to safeguard personal data. In your production console, ensure the following policies are active:

```sql
-- Conversations Policy
CREATE POLICY "Users can manage their own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

-- Memories Policy
CREATE POLICY "Users can manage their own memories" ON memories
  FOR ALL USING (auth.uid() = user_id);

-- Tasks Policy
CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Documents Policy
CREATE POLICY "Users can manage their own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

This guarantees that even if a database bypass is attempted, Supabase will block users from accessing any memory chunks or vector similarity matches that do not match their verified user session UUID.

---

## 🔑 3. Environment Variables Checklist

During your Vercel project configuration, you will be prompted to enter the following environment variables. Copy them exactly from your local `.env.local` or fetch new cloud values:

| Variable Name | Description / Source | Required? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Portal → Project Settings → API → Project URL | **Yes** (Client/Server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase Portal → Project Settings → API → `anon` public key | **Yes** (Client/Server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Portal → Project Settings → API → `service_role` private key | **Yes** (Server-only) |
| `GEMINI_API_KEY` | Google AI Studio ([aistudio.google.com](https://aistudio.google.com)) → Get API Key | **Yes** (Server-only) |

> [!CAUTION]
> Keep `SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` hidden from client bundles. Under Vercel, they are securely encrypted on the server. Never expose these keys in any client-side `console.log` or `.env` files checked into Git.

---

## 🚀 4. Deployment on Vercel (Step-by-Step)

1. Commit all your local changes to your GitHub repository on your active dev branch (`feat/auth`) and ensure all feature syncs are completed.
2. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New** → **Project**.
3. Import your `cerebro-second-brain` repository.
4. Expand the **Environment Variables** panel and copy/paste all four keys from **Section 3** above.
5. Expand **Build and Development Settings**:
   - Frame Framework Preset: **Next.js**
   - Root Directory: `./` (or `./cerebro` depending on repo structure)
6. Click **Deploy**.
7. Vercel will pull your branch, compile the Next.js 16 TypeScript bundle, optimize the assets, and deploy the application onto edge-rendering nodes.

---

## 🔗 5. Post-Deployment Authentication Linkage (CRITICAL)

Once Vercel supplies your production URL (e.g. `https://cerebro-app.vercel.app`), you **MUST** update your Supabase Auth configuration to prevent redirects from failing:

1. Copy your Vercel production domain address.
2. Go to your **Supabase Cloud Dashboard** → select your active production database.
3. In the left menu, click **Authentication** → **URL Configuration**.
4. In **Site URL**, replace `http://localhost:3000` with your Vercel production URL:
   ```text
   https://cerebro-app.vercel.app
   ```
5. In **Redirect URLs**, click **Add URL** and add your callback pathway:
   ```text
   https://cerebro-app.vercel.app/auth/callback
   ```
6. Click **Save**.

---

### 🎉 Your AI Second Brain is Live!
Now, visiting your production URL will present the glowing glassmorphic CEREBRO portal, allowing you to log in securely, query your PDFs, organize tasks with NLP dates, and converse hands-free with Jarvis from any desktop or mobile device!
