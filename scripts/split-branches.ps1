# ============================================================
# CEREBRO — Automated Multi-Branch Git Commit Sync
# Run this in your native system terminal/VS Code console
# ============================================================

Write-Host "Starting CEREBRO multi-branch sync to map files to correct roadmap branches..." -ForegroundColor Cyan

# 0. Cache current state from feat/auth
Write-Host "Storing active branch context..." -ForegroundColor Yellow
$activeBranch = "feat/auth"

# 1. Sync feat/dashboard
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[Branch 1/5] Syncing feat/dashboard..." -ForegroundColor Yellow
git checkout feat/dashboard
git checkout $activeBranch -- "src/app/(app)/dashboard/page.tsx"
git checkout $activeBranch -- "src/app/(app)/profile/page.tsx"
git checkout $activeBranch -- "src/app/(app)/documents/page.tsx"
git checkout $activeBranch -- "src/app/(app)/voice/page.tsx"
git commit -m "feat(dashboard): implement CEREBRO Command Center & AI Daily Briefing"
git push origin feat/dashboard

# 2. Sync feat/chat
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[Branch 2/5] Syncing feat/chat..." -ForegroundColor Yellow
git checkout feat/chat
git checkout $activeBranch -- "src/app/api/conversations/route.ts"
git checkout $activeBranch -- "src/app/api/chat/route.ts"
git checkout $activeBranch -- "src/app/(app)/chat/page.tsx"
git commit -m "feat(chat): implement multi-thread streaming chat with AI title generator"
git push origin feat/chat

# 3. Sync feat/memory
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[Branch 3/5] Syncing feat/memory..." -ForegroundColor Yellow
git checkout feat/memory
git checkout $activeBranch -- "src/app/(app)/memory/page.tsx"
git commit -m "feat(memory): implement semantic memory vault explorer & stats tracker"
git push origin feat/memory

# 4. Sync feat/tasks
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[Branch 4/5] Syncing feat/tasks..." -ForegroundColor Yellow
git checkout feat/tasks
git checkout $activeBranch -- "src/app/api/tasks/generate/route.ts"
git checkout $activeBranch -- "src/app/api/tasks/route.ts"
git checkout $activeBranch -- "src/app/(app)/tasks/page.tsx"
git checkout $activeBranch -- "src/app/(auth)/login/LoginForm.tsx"
git commit -m "feat(tasks): implement Kanban task synapse & NLP AI task scheduler"
git push origin feat/tasks

# 5. Sync feat/documents
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "[Branch 5/5] Syncing feat/documents..." -ForegroundColor Yellow
git checkout feat/documents
git checkout $activeBranch -- "src/app/api/documents/route.ts"
git checkout $activeBranch -- "src/app/api/documents/query/route.ts"
git checkout $activeBranch -- "src/types/pdf-parse.d.ts"
git checkout $activeBranch -- "src/app/(app)/documents/page.tsx"
git checkout $activeBranch -- "next.config.ts"
git commit -m "feat(documents): implement PDF ingestion & similarity Q&A query engine"
git push origin feat/documents

# Return to active branch
Write-Host ""
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Returning to active auth branch..." -ForegroundColor Yellow
git checkout $activeBranch

Write-Host ""
Write-Host "🎉 SUCCESS! All CEREBRO Day 3 and Day 4 features have been committed and pushed to their correct roadmap branches on GitHub!" -ForegroundColor Cyan
