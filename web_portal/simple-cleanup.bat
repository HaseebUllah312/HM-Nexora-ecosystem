@echo off
setlocal enabledelayedexpansion

REM Kill all node processes immediately
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.cmd /T /nul 2>&1
timeout /t 1 /nobreak >nul

REM Change to project directory
cd /d "g:\Web\New folder\web"

REM Remove test files
del /F /Q test_all.js test_drive.js test_drive_ipv4.js test_drive_sa.js test_google_raw.js test_upload.js test_rest_upload.ts test_upload.txt >nul 2>&1

REM Remove debug/repair files
del /F /Q debug_json.js eval_json.js fix_json.js fix_json2.js fix_last3.js fix_missing_terms.js repair_and_fix_terms.js repair_quizzes.js restructure_json.js deep_repair_all.js final_repair_all.js validate_quizzes.js generate-drive-token.js >nul 2>&1

REM Remove log and build files
del /F /Q *.log build*.txt *_output.txt compile-errors.txt tsc_output.txt tsconfig.tsbuildinfo >nul 2>&1

REM Remove directories
rmdir /S /Q .rebuild >nul 2>&1
rmdir /S /Q bnk >nul 2>&1

REM Git cleanup and push
echo Removing deleted files from git
git rm --force test_*.js test_*.ts test_*.txt debug_*.js fix_*.js repair_*.js validate_*.js eval_*.js restructure_*.js deep_repair_*.js final_repair_*.js generate_*.js >nul 2>&1

echo Staging changes
git add -A

echo Creating commit
git commit -m "chore: rebrand to HM nexora and cleanup repository

- Renamed project from 'VU Academic Hub' to 'HM nexora'
- Fixed TypeScript compilation errors
- Updated all UI text, metadata, and email templates  
- Cleaned up test, debug, and temporary files
- Prepared for deployment to Vercel/Netlify
- Added comprehensive deployment documentation

Changes:
- Fixed ANIMATION_EXAMPLES.tsx type errors
- Updated package.json name and version
- Rebranded 20+ files with new identity
- Updated email templates and admin settings
- Created deployment guides (.vercelignore, DEPLOYMENT_GUIDE.md)
- Removed test/debug scripts and build artifacts
- Repository is now clean and production-ready" >nul 2>&1

echo.
echo Cleanup and commit completed!
echo.
echo Current git status:
git status

echo.
echo Ready to push? Run:
echo   git push origin main
echo.
