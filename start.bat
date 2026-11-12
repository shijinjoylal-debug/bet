@echo off
title Royal Derby 3D - Launcher
echo ========================================================
echo         ROYAL DERBY 3D - HORSE RACING SIMULATION
echo ========================================================
echo Starting local web server for 3D asset loading...
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Python HTTP server on port 8000...
    start "" http://localhost:8000
    python -m http.server 8000
    goto :end
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Node server on port 8000...
    start "" http://localhost:8000
    npx http-server -p 8000
    goto :end
)

echo Python or Node not found in PATH. Opening index.html directly...
start "" index.html

:end

