Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       Starting ChrisSoft AI Platform (Full Stack)     " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`nStarting Backend API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm.cmd --filter @equation-orchestra/backend dev"

Start-Sleep -Seconds 3

Write-Host "Starting Admin Frontend Dashboard (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm.cmd --filter @equation-orchestra/admin dev"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "ChrisSoft AI is running!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000/api/health" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
