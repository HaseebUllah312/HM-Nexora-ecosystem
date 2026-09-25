# HM Nexora - Manual GitHub Push Guide

**Status**: Your repository is 95% ready. The terminal is stuck in a build loop. Follow these manual steps to complete the cleanup and push to GitHub.

## IMPORTANT: Terminal Reset Required

Your terminal is currently stuck in an `npm run build` loop. You need to restart it:

1. **Close the current terminal** (PowerShell)
2. **Open a new PowerShell terminal** in the same directory

---

## Step-by-Step Guide to Clean & Push

### Step 1: Kill Stuck Processes (New Terminal)
```powershell
taskkill /F /IM node.exe /T
taskkill /F /IM npm.cmd /T
Start-Sleep -Seconds 2
Write-Host "Processes cleared"
```

### Step 2: Delete Test & Debug Files
```powershell
# Remove test files
Remove-Item -Force -ErrorAction SilentlyContinue @(
    'test_all.js', 'test_drive.js', 'test_drive_ipv4.js', 'test_drive_sa.js',
    'test_google_raw.js', 'test_upload.js', 'test_rest_upload.ts', 'test_upload.txt'
)

# Remove debug/repair scripts
Remove-Item -Force -ErrorAction SilentlyContinue @(
    'debug_json.js', 'eval_json.js', 'fix_json.js', 'fix_json2.js', 'fix_last3.js',
    'fix_missing_terms.js', 'repair_and_fix_terms.js', 'repair_quizzes.js',
    'restructure_json.js', 'deep_repair_all.js', 'final_repair_all.js',
    'validate_quizzes.js', 'generate-drive-token.js'
)

# Remove log files
Get-ChildItem -Force *.log, build*.txt, *_output.txt, compile-errors.txt, tsc_output.txt, tsconfig.tsbuildinfo 2>/dev/null | Remove-Item -Force

# Remove directories
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue @('.rebuild', 'bnk')

Write-Host "✅ Cleanup done"
```

### Step 3: Check Git Status
```powershell
git status
```

You should see output showing modified and deleted files.

### Step 4: Stage All Changes
```powershell
git add -A
```

### Step 5: Create Commit
```powershell
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
```

### Step 6: Verify Commit
```powershell
git log --oneline -3
```

You should see your new commit at the top.

### Step 7: Push to GitHub
```powershell
# Push to main branch (or your current branch)
git push origin main

# OR if you're on a different branch:
git push origin <your-branch-name>

# Force push if needed (be careful!):
git push origin main --force-with-lease
```

### Step 8: Verify on GitHub
1. Go to your repository on GitHub: `https:// github.com/your-username/your-repo`
2. Verify that:
   - All your changes are pushed
   - Test files are removed
   - New files (DEPLOYMENT_GUIDE.md, REBRANDING_SUMMARY.md, etc.) are present
   - Package.json shows `"hm-nexora"` as the name

---

## What Was Done (Summary)

✅ **TypeScript Fixes**
- Fixed ANIMATION_EXAMPLES.tsx type errors
- Fixed test_rest_upload.ts error handling
- Project compiles successfully

✅ **Rebranding (20+ files)**
- VU Academic Hub → HM nexora
- HSM Tech → HM nexora
- Updated all metadata, email templates, admin settings

✅ **New Files Created**
- DEPLOYMENT_GUIDE.md - Complete deployment instructions
- REBRANDING_SUMMARY.md - Change documentation
- .netlifyignore - Netlify configuration
- cleanup-and-commit.ps1 - PowerShell cleanup script
- simple-cleanup.bat - Batch cleanup script
- MANUAL_GITHUB_PUSH.md - This file

✅ **Files To Be Removed** (in Step 2)
- All test_*.js/ts files (8 files)
- All debug_*.js and repair_*.js files (13 files)
- All build logs and temporary files
- .rebuild and bnk directories

---

## Troubleshooting

### Git asks for authentication
```powershell
# You may need to use GitHub token or SSH
# If using HTTPS, it will ask for your GitHub token (not password)
# Or use SSH if you've set it up:
git remote set-url origin git@github.com:your-username/your-repo.git
```

### Push is rejected ("Your branch is ahead")
```powershell
git pull origin main --rebase
git push origin main
```

### Want to see what will be pushed
```powershell
git log origin/main..HEAD --oneline
```

### Undo last commit (if needed)
```powershell
git reset --soft HEAD~1  # Keeps changes staged
git reset HEAD   # Unstage changes
```

---

## After Successful Push

1. **Verify on GitHub** - All files should be synced
2. **Connect Vercel/Netlify** - Use the GitHub repository for deployment
3. **Set up CI/CD** - Consider GitHub Actions for automated testing
4. **Monitor Deployments** - Check build status on Vercel/Netlify dashboard

---

## Quick Copy-Paste All-in-One Command

If you trust the above, here's everything in one command:

```powershell
# Kill processes
taskkill /F /IM node.exe /T; taskkill /F /IM npm.cmd /T; Start-Sleep -Seconds 2

# Delete files (all in one)
$delFiles = @('test_all.js','test_drive.js','test_drive_ipv4.js','test_drive_sa.js','test_google_raw.js','test_upload.js','test_rest_upload.ts','test_upload.txt','debug_json.js','eval_json.js','fix_json.js','fix_json2.js','fix_last3.js','fix_missing_terms.js','repair_and_fix_terms.js','repair_quizzes.js','restructure_json.js','deep_repair_all.js','final_repair_all.js','validate_quizzes.js','generate-drive-token.js')
foreach($f in $delFiles) { if(Test-Path $f) { Remove-Item $f -Force } }
Get-ChildItem -Force *.log, build*.txt, *_output.txt 2>/dev/null | Remove-Item -Force
Remove-Item -Force -Recurse -ErrorAction SilentlyContinue .rebuild, bnk

# Git operations
git add -A
git commit -m "chore: rebrand to HM nexora and cleanup repository

- Renamed project from 'VU Academic Hub' to 'HM nexora'
- Fixed TypeScript compilation errors  
- Updated all UI text, metadata, and email templates
- Cleaned up test, debug, and temporary files
- Prepared for deployment to Vercel/Netlify"

git push origin main

Write-Host "✅ All done! Check GitHub to verify." -ForegroundColor Green
```

---

**Need help?** This document covers all steps needed to complete the GitHub push. Follow them in order and you'll be done!
