@echo off
cd /d "%~dp0"
echo ========================================
echo Starting F.L.O.W. Application
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "F.L.O.W. Backend" cmd /k "cd /d "%~dp0server" && npm start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend...
start "F.L.O.W. Frontend" cmd /k "cd /d "%~dp0" && npm start"

echo.
echo ========================================
echo F.L.O.W. is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
