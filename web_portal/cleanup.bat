@echo off
REM HM Nexora Cleanup Batch Script
setlocal enabledelayedexpansion

echo ========================================
echo HM Nexora - Repository Cleanup
echo ========================================
echo.

REM Stop any running npm/node processes
echo Stopping node processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.cmd /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Remove test files
echo Removing test files...
if exist "test_all.js" del test_all.js
if exist "test_drive.js" del test_drive.js
if exist "test_drive_ipv4.js" del test_drive_ipv4.js
if exist "test_drive_sa.js" del test_drive_sa.js
if exist "test_google_raw.js" del test_google_raw.js
if exist "test_upload.js" del test_upload.js
if exist "test_rest_upload.ts" del test_rest_upload.ts
if exist "test_upload.txt" del test_upload.txt
echo.

REM Remove debug/repair files
echo Removing debug and repair scripts...
if exist "debug_json.js" del debug_json.js
if exist "eval_json.js" del eval_json.js
if exist "fix_json.js" del fix_json.js
if exist "fix_json2.js" del fix_json2.js
if exist "fix_last3.js" del fix_last3.js
if exist "fix_missing_terms.js" del fix_missing_terms.js
if exist "repair_and_fix_terms.js" del repair_and_fix_terms.js
if exist "repair_quizzes.js" del repair_quizzes.js
if exist "restructure_json.js" del restructure_json.js
if exist "deep_repair_all.js" del deep_repair_all.js
if exist "final_repair_all.js" del final_repair_all.js
if exist "validate_quizzes.js" del validate_quizzes.js
if exist "generate-drive-token.js" del generate-drive-token.js
echo.

REM Remove log files
echo Removing log and temporary files...
del /S /Q *.log >nul 2>&1
del build_output.txt >nul 2>&1
del build_final.txt >nul 2>&1
del build_latest.log >nul 2>&1
del build_complete.log >nul 2>&1
del build2.log >nul 2>&1
del build.log >nul 2>&1
del compile-errors.txt >nul 2>&1
del tsc_output.txt >nul 2>&1
del tsconfig.tsbuildinfo >nul 2>&1
echo.

REM Remove directories
echo Removing unnecessary directories...
if exist ".rebuild" rmdir /S /Q .rebuild >nul 2>&1
if exist "bnk" rmdir /S /Q bnk >nul 2>&1
echo.

REM Git operations
echo ========================================
echo Git Repository Cleanup
echo ========================================
echo.

echo Checking git status...
git status --short | findstr /V "^\?"

echo.
echo Staging all changes...
git add -A

echo.
echo Creating commit...
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
- Repository is now clean and production-ready"

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Next step: Push to GitHub
echo  git push origin main
echo.
pause
