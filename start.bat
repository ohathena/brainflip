@echo off
echo Starting ArcadeHub...

start "ArcadeHub Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

timeout /t 2 /nobreak >nul

start "ArcadeHub Frontend" cmd /k "cd /d "%~dp0frontend" && npx vite --host"

timeout /t 4 /nobreak >nul

start "" http://localhost:5173

echo Both servers are starting. The browser will open automatically.
