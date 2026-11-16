@echo off
title Royal Derby 3D - Launcher
echo ========================================================
echo         ROYAL DERBY 3D - HORSE RACING SIMULATION
echo ========================================================
echo Starting authenticated Node.js server...
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js is required. Install Node.js 18 or newer.
    pause
    exit /b 1
)

start "" http://localhost:8000
node server.js
pause

