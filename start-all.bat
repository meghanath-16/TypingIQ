@echo off
title TypingIQ - Start All Services
echo ===================================================
echo           Starting TypingIQ Full-Stack System
echo ===================================================
echo.

echo [1/3] Starting Python FastAPI ML Service on port 8000...
start "TypingIQ ML Service (Port 8000)" cmd /k "cd /d d:\TypingIQ\ml-service && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Spring Boot Main Gateway on port 8080...
start "TypingIQ Spring Boot Backend (Port 8080)" cmd /k "cd /d d:\TypingIQ\backend && mvn spring-boot:run"

timeout /t 5 /nobreak >nul

echo [3/3] Starting Vite React Frontend on port 5173...
start "TypingIQ Frontend (Port 5173)" cmd /k "cd /d d:\TypingIQ\frontend && npm.cmd run dev"

echo.
echo ===================================================
echo   All 3 services are launching in separate windows!
echo   Frontend will be available at: http://localhost:5173
echo ===================================================
pause
