$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

$repo = "sidsourabh24-source/cerebro-second-brain"

Write-Host "Creating labels..." -ForegroundColor Cyan

# Delete defaults first
gh api repos/$repo/labels/bug -X DELETE 2>$null
gh api repos/$repo/labels/documentation -X DELETE 2>$null
gh api repos/$repo/labels/duplicate -X DELETE 2>$null
gh api repos/$repo/labels/enhancement -X DELETE 2>$null
gh api repos/$repo/labels/help-wanted -X DELETE 2>$null  
gh api repos/$repo/labels/invalid -X DELETE 2>$null
gh api repos/$repo/labels/question -X DELETE 2>$null
gh api repos/$repo/labels/wontfix -X DELETE 2>$null
gh api repos/$repo/labels/good-first-issue -X DELETE 2>$null

# Create custom labels
$labels = @(
    @{ name="feature";          color="7C3AED"; description="New feature implementation" },
    @{ name="bug";              color="EF4444"; description="Something is broken" },
    @{ name="enhancement";      color="3B82F6"; description="Improvement to existing feature" },
    @{ name="chore";            color="6B7280"; description="Setup, config, or docs work" },
    @{ name="week-1";           color="10B981"; description="Week 1 scope - Foundation" },
    @{ name="week-2";           color="F59E0B"; description="Week 2 scope - Intelligence" },
    @{ name="week-3";           color="EC4899"; description="Week 3 scope - Full MVP" },
    @{ name="priority:high";    color="DC2626"; description="Must complete this sprint" },
    @{ name="priority:medium";  color="D97706"; description="Normal priority" },
    @{ name="priority:low";     color="059669"; description="Nice to have" },
    @{ name="ai";               color="8B5CF6"; description="AI/ML related work" },
    @{ name="ui";               color="06B6D4"; description="UI/UX and design work" }
)

foreach ($label in $labels) {
    gh api repos/$repo/labels -X POST `
        -f name=$($label.name) `
        -f color=$($label.color) `
        -f description=$($label.description) | Out-Null
    Write-Host "  Created label: $($label.name)" -ForegroundColor Green
}

Write-Host "All labels created!" -ForegroundColor Cyan
