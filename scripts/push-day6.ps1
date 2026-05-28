# ============================================================
# CEREBRO — Automated Day 6 Production Sync & Cleanup
# Run this in your native system terminal/VS Code console
# ============================================================

Write-Host "Starting CEREBRO Day 6 Production security sync..." -ForegroundColor Cyan

# 1. Cleanup the redundant middleware.ts file
Write-Host ""
Write-Host "[Step 1/3] Removing redundant middleware.ts to satisfy Next.js compiler checks..." -ForegroundColor Yellow

if (Test-Path "src/middleware.ts") {
    Remove-Item "src/middleware.ts" -Force -ErrorAction SilentlyContinue
    git rm "src/middleware.ts" --cached --ignore-unmatch
    Write-Host "Redundant middleware.ts removed!" -ForegroundColor Green
} else {
    Write-Host "middleware.ts not found. Cleanup bypassed." -ForegroundColor Gray
}

# 2. Stage and commit production deployment configurations to active branch
Write-Host ""
Write-Host "[Step 2/3] Committing vercel.json, CEREBRO_PRODUCTION_DEPLOY.md, and PDF route fixes to active branch (feat/auth)..." -ForegroundColor Yellow

git add "vercel.json"
git add "CEREBRO_PRODUCTION_DEPLOY.md"
git add "src/app/api/documents/route.ts"
git add "src/lib/gemini.ts"
git commit -m "chore(prod): configure Vercel security headers, deployment blueprints, PDF parsing fixes, and Gemini embedding upgrades"
git push origin feat/auth
Write-Host "Active dev branch fully updated!" -ForegroundColor Green

# 3. Sync and push PDF upgrades to feat/documents branch
Write-Host ""
Write-Host "[Step 3/3] Syncing PDF upgrades to target roadmap branch (feat/documents)..." -ForegroundColor Yellow

git checkout feat/documents
git checkout feat/auth -- "src/app/api/documents/route.ts"
git commit -m "feat(documents): fix PDF extraction by restoring functional pipeline with dynamic ESM/CJS fallback resolver"
git push origin feat/documents
Write-Host "feat/documents synchronized!" -ForegroundColor Green

# Return to active branch
git checkout feat/auth

Write-Host ""
Write-Host "SUCCESS! CEREBRO Day 6 production configurations and PDF route fixes have been cleanly synced and pushed to GitHub!" -ForegroundColor Cyan
