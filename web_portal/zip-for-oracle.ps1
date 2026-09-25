# This script packages the lightweight 'standalone' Next.js build for Oracle Cloud

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📦 Packaging Lightweight Build for Oracle" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Ensure the standalone folder exists
if (-Not (Test-Path ".next\standalone")) {
    Write-Host "❌ Standalone build not found! Run 'npm run build' first." -ForegroundColor Red
    exit
}

# 1. Copy required static files into the standalone folder
Write-Host "Copying static assets..." -ForegroundColor Yellow
Copy-Item -Path "public" -Destination ".next\standalone\public" -Recurse -Force
Copy-Item -Path ".next\static" -Destination ".next\standalone\.next\static" -Recurse -Force

# 2. Compress the standalone folder into a tiny zip file
$zipName = "oracle_deploy_lightweight.zip"
if (Test-Path $zipName) { Remove-Item $zipName -Force }

Write-Host "Compressing to $zipName (this will be very small!)..." -ForegroundColor Yellow
Compress-Archive -Path ".next\standalone\*" -DestinationPath $zipName -Force

Write-Host "✅ Done! You can now safely push or upload $zipName!" -ForegroundColor Green
Write-Host "Size should be under 50MB and easily pass GitHub limits." -ForegroundColor White
