# HM Nexora Repository Cleanup & Git Commit Script
# This script cleans up temporary files and prepares the repository for deployment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "HM Nexora - Repository Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove test files
Write-Host "[1/4] Removing test scripts..." -ForegroundColor Yellow
$testFiles = @(
    'test_all.js',
    'test_drive.js',
    'test_drive_ipv4.js',
    'test_drive_sa.js',
    'test_google_raw.js',
    'test_upload.js',
    'test_rest_upload.ts',
    'test_upload.txt'
)
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

# Step 2: Remove debug and repair files
Write-Host ""
Write-Host "[2/4] Removing debug and repair scripts..." -ForegroundColor Yellow
$debugFiles = @(
    'debug_json.js',
    'eval_json.js',
    'fix_json.js',
    'fix_json2.js',
    'fix_last3.js',
    'fix_missing_terms.js',
    'repair_and_fix_terms.js',
    'repair_quizzes.js',
    'restructure_json.js',
    'deep_repair_all.js',
    'final_repair_all.js',
    'validate_quizzes.js',
    'generate-drive-token.js'
)
foreach ($file in $debugFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

# Step 3: Remove build logs and temporary files
Write-Host ""
Write-Host "[3/4] Removing build logs and temporary files..." -ForegroundColor Yellow
$logFiles = Get-ChildItem -File | Where-Object {
    $_.Name -match '\.(log|bak|backup)$' -or 
    $_.Name -match 'build.*\.txt' -or 
    $_.Name -match '_output\.txt'
}
foreach ($file in $logFiles) {
    Remove-Item $file.FullName -Force
    Write-Host "  ✓ Removed: $($file.Name)" -ForegroundColor Green
}

# Step 4: Remove unnecessary directories
Write-Host ""
Write-Host "[4/4] Cleaning up directories..." -ForegroundColor Yellow
if (Test-Path '.rebuild') {
    Remove-Item '.rebuild' -Force -Recurse
    Write-Host "  ✓ Removed: .rebuild directory" -ForegroundColor Green
}
if (Test-Path 'bnk') {
    Remove-Item 'bnk' -Force -Recurse
    Write-Host "  ✓ Removed: bnk directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Git Operations" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 5: Check git status
Write-Host "[5/5] Preparing git repository..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Current git status:" -ForegroundColor White
git status --short | Select-Object -First 20

Write-Host ""
Write-Host "Staging all changes..." -ForegroundColor Yellow
git add -A
Write-Host "✓ All changes staged" -ForegroundColor Green

Write-Host ""
Write-Host "Creating commit..." -ForegroundColor Yellow
git commit -m "chore: rebrand to HM nexora and cleanup repository

- Renamed project from 'VU Academic Hub' to 'HM nexora'
- Fixed TypeScript compilation errors
- Updated all UI text, metadata, and email templates
- Cleaned up test, debug, and temporary files
- Prepared for deployment to Vercel/Netlify
- Added comprehensive deployment documentation

Changes:
✓ Fixed ANIMATION_EXAMPLES.tsx type errors
✓ Updated package.json name and version
✓ Rebranded 20+ files with new identity
✓ Updated email templates and admin settings
✓ Created deployment guides (.vercelignore, DEPLOYMENT_GUIDE.md)
✓ Removed test/debug scripts and build artifacts
✓ Repository is now clean and production-ready"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the commit:" -ForegroundColor White
Write-Host "   git log --oneline -1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push to GitHub:" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Or push to specific branch:" -ForegroundColor White
Write-Host "   git push origin <branch-name>" -ForegroundColor Gray
Write-Host ""
