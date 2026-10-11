# TypingIQ Fullstack Startup Script (PowerShell)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      Starting TypingIQ Full-Stack System          " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting Python FastAPI ML Service on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\TypingIQ\ml-service'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting Spring Boot Main Gateway on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\TypingIQ\backend'; mvn spring-boot:run"

Start-Sleep -Seconds 5

Write-Host "[3/3] Starting Vite React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\TypingIQ\frontend'; npm.cmd run dev"

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host " All 3 services started in dedicated windows!" -ForegroundColor Green
Write-Host " App URL: http://localhost:5173" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
