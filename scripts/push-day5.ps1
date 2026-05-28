# ============================================================
# CEREBRO — Automated Day 5 Vocal Synapse & PDF Sync
# Run this in your native system terminal/VS Code console
# ============================================================

Write-Host "Starting CEREBRO Day 5 automated commits & pushes..." -ForegroundColor Cyan

# 1. Commit and push all updated files on the active dev branch
Write-Host ""
Write-Host "[Step 1/3] Committing Day 5 features & PDF updates to active branch (feat/auth)..." -ForegroundColor Yellow
git add "src/hooks/useVoice.ts"
git add "src/app/(app)/voice/page.tsx"
git add "src/app/(app)/chat/page.tsx"
git add "src/app/api/documents/route.ts"
git add "src/types/pdf-parse.d.ts"
git commit -m "feat(voice/documents): implement useVoice, voice reactor page, and PDFParse upgrades"
git push origin feat/auth
Write-Host "✅ All features committed and pushed on active branch!" -ForegroundColor Green

# 2. Sync and push to feat/voice branch
Write-Host ""
Write-Host "[Step 2/3] Syncing Voice features to target roadmap branch (feat/voice)..." -ForegroundColor Yellow

# Create or checkout the feat/voice branch
$branches = git branch --list "feat/voice"
if ($branches) {
    git checkout feat/voice
} else {
    git checkout -b feat/voice
}

# Pull latest files from active branch
git checkout feat/auth -- "src/hooks/useVoice.ts"
git checkout feat/auth -- "src/app/(app)/voice/page.tsx"
git checkout feat/auth -- "src/app/(app)/chat/page.tsx"

# Commit and push
git commit -m "feat(voice): implement Jarvis Voice Assistant, useVoice hook, reactor visualizer, and TTS feedback"
git push origin feat/voice
Write-Host "✅ feat/voice synchronized!" -ForegroundColor Green

# 3. Sync and push PDF upgrades to feat/documents branch
Write-Host ""
Write-Host "[Step 3/3] Syncing PDF upgrades to target roadmap branch (feat/documents)..." -ForegroundColor Yellow

git checkout feat/documents
git checkout feat/auth -- "src/app/api/documents/route.ts"
git checkout feat/auth -- "src/types/pdf-parse.d.ts"
git commit -m "feat(documents): upgrade PDF parser structure to use native modern PDFParse class"
git push origin feat/documents
Write-Host "✅ feat/documents synchronized!" -ForegroundColor Green

# Return to active branch
git checkout feat/auth

Write-Host ""
Write-Host "🎉 SUCCESS! All CEREBRO Day 5 voice assistant and PDF parser features have been committed and synced to GitHub!" -ForegroundColor Cyan
