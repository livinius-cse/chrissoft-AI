@echo off
echo ========================================================
echo        Starting ChrisSoft AI Platform (Full Stack)
echo ========================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "ChrisSoft AI - Backend" cmd /c "pnpm --filter @equation-orchestra/backend dev"
echo.
echo Waiting 3 seconds for Backend to initialize...
timeout /t 3 /nobreak >nul
echo.
echo Starting Admin Frontend Dashboard (Port 3000)...
start "ChrisSoft AI - Frontend" cmd /c "pnpm --filter @equation-orchestra/admin dev"
echo.
echo ========================================================
echo ChrisSoft AI is running!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000/api/health
echo ========================================================
pause
