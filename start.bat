@echo off
title CampusOS AI v2.0 - Enterprise Edition
color 0A
setlocal enabledelayedexpansion

echo.
echo  ============================================================
echo   _____  ____  _      __  __ ___ ____   ___  ____ _____
echo  / ___/  / __ \/ \    / / / // _// __/  / _ \/ __// ___/
echo  / /__  / /_/ / / \  / / / / / / / /__  / , _/ _/ / /__
echo  \___/  \____/_/  \_/ /_/ /_/ /_/ \___//_/|_/___/ \___/
echo.
echo            AI v2.0 - Enterprise Edition
echo         Made by Jai Samyukth Enterprises
echo  ============================================================
echo.

:: ──────────────────────────────────────────────────────────
::  REFRESH PATH FROM REGISTRY (fixes "just installed" issue)
::  When you install Node.js, the current CMD window doesn't
::  see it until you open a new window. This trick refreshes it.
:: ──────────────────────────────────────────────────────────
echo  [1/8] Refreshing system PATH...

:: Read system PATH from registry and merge with current session
for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v Path 2^>nul') do set "SYS_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path 2^>nul') do set "USER_PATH=%%B"
set "PATH=%USER_PATH%;%SYS_PATH%;%PATH%"

echo         PATH refreshed.

:: ──────────────────────────────────────────────────────────
::  CHECK FOR BUN / NODE (with fallback direct paths)
:: ──────────────────────────────────────────────────────────
echo.
echo  [2/8] Checking prerequisites...

set "RUNNER="
set "INSTALLER="
set "SEEDER="
set "DEV_CMD="

:: Try bun first
where bun >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo         Found: bun
    set "RUNNER=bun"
    set "INSTALLER=bun install"
    set "SEEDER=bunx tsx prisma/seed.ts"
    set "DEV_CMD=bun run dev"
    goto :found_runner
)

:: Try node via PATH
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo         Found: node ^& npm
    set "RUNNER=npm"
    set "INSTALLER=npm install"
    set "SEEDER=npx tsx prisma/seed.ts"
    set "DEV_CMD=npm run dev"
    goto :found_runner
)

:: Fallback: Check common Node.js install locations on Windows
echo         Searching common install locations...

:: Check Program Files
if exist "%ProgramFiles%\nodejs\node.exe" (
    echo         Found: Node.js in %ProgramFiles%\nodejs\
    set "PATH=%ProgramFiles%\nodejs;%PATH%"
    set "RUNNER=npm"
    set "INSTALLER=npm install"
    set "SEEDER=npx tsx prisma/seed.ts"
    set "DEV_CMD=npm run dev"
    goto :found_runner
)

:: Check Program Files (x86)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    echo         Found: Node.js in %ProgramFiles(x86)%\nodejs\
    set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
    set "RUNNER=npm"
    set "INSTALLER=npm install"
    set "SEEDER=npx tsx prisma/seed.ts"
    set "DEV_CMD=npm run dev"
    goto :found_runner
)

:: Check AppData (nvm-windows default)
if exist "%APPDATA%\nvm\v*" (
    for /d %%D in ("%APPDATA%\nvm\v*") do (
        if exist "%%D\node.exe" (
            echo         Found: Node.js in %%D
            set "PATH=%%D;%PATH%"
            set "RUNNER=npm"
            set "INSTALLER=npm install"
            set "SEEDER=npx tsx prisma/seed.ts"
            set "DEV_CMD=npm run dev"
            goto :found_runner
        )
    )
)

:: Check local AppData for Volta/fnm
if exist "%LOCALAPPDATA%\Volta\bin\node.exe" (
    echo         Found: Node.js via Volta
    set "PATH=%LOCALAPPDATA%\Volta\bin;%PATH%"
    set "RUNNER=npm"
    set "INSTALLER=npm install"
    set "SEEDER=npx tsx prisma/seed.ts"
    set "DEV_CMD=npm run dev"
    goto :found_runner
)

if exist "%LOCALAPPDATA%\fnm_*" (
    for /d %%D in ("%LOCALAPPDATA%\fnm_*") do (
        if exist "%%D\node.exe" (
            echo         Found: Node.js via fnm
            set "PATH=%%D;%PATH%"
            set "RUNNER=npm"
            set "INSTALLER=npm install"
            set "SEEDER=npx tsx prisma/seed.ts"
            set "DEV_CMD=npm run dev"
            goto :found_runner
        )
    )
)

:: ── NOT FOUND ──
echo.
echo   ========================================================
echo    [ERROR] Node.js or Bun not found on your system!
echo   ========================================================
echo.
echo    You just installed Node.js but this command prompt
echo    doesn't see it yet. Try one of these:
echo.
echo    OPTION 1 (Easiest):
echo      Close this window and double-click start.bat again.
echo      A fresh window will pick up the new Node.js install.
echo.
echo    OPTION 2:
echo      Open a NEW Command Prompt and run:
echo        cd /d "%~dp0"
echo        start.bat
echo.
echo    OPTION 3 (Verify install):
echo      Open a NEW Command Prompt and type:
echo        node --version
echo      If that works, close this and retry start.bat.
echo.
echo    Download Node.js from: https://nodejs.org
echo    Download Bun from:     https://bun.sh
echo.
echo   ========================================================
echo.
pause
exit /b 1

:found_runner

:: ──────────────────────────────────────────────────────────
::  VERIFY NODE ACTUALLY WORKS
:: ──────────────────────────────────────────────────────────
echo         Verifying installation...
node --version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Node.js was found but doesn't work properly.
    echo   Please restart this command prompt and try again.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>nul') do echo         Node.js version: %%v
for /f "tokens=*" %%v in ('npm --version 2^>nul') do echo         npm version: %%v

:: ──────────────────────────────────────────────────────────
::  CHECK / CREATE .env FILE
:: ──────────────────────────────────────────────────────────
echo.
echo  [3/8] Checking environment configuration...

if not exist ".env" (
    echo         Creating .env file...
    (
        echo DATABASE_URL=file:./db/custom.db
        echo CAMPUOS_HMAC_SECRET=campusos-ai-hmac-secret-2025-jse
        echo NEXTAUTH_SECRET=campusos-v2-secret-key-2024
    ) > .env
    echo         .env created successfully.
) else (
    echo         .env file already exists.
)

:: ──────────────────────────────────────────────────────────
::  INSTALL DEPENDENCIES
:: ──────────────────────────────────────────────────────────
echo.
echo  [4/8] Installing dependencies (this may take a minute)...
%INSTALLER%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo   [ERROR] Failed to install dependencies.
    echo   Try running manually: %INSTALLER%
    echo.
    pause
    exit /b 1
)
echo         Dependencies installed.

:: ──────────────────────────────────────────────────────────
::  PUSH DATABASE SCHEMA
:: ──────────────────────────────────────────────────────────
echo.
echo  [5/8] Setting up database...

if not exist "db" mkdir db

%RUNNER% run db:push
if %ERRORLEVEL% NEQ 0 (
    echo   [WARNING] db:push failed, trying with npx...
    npx prisma db push
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Failed to push database schema.
        pause
        exit /b 1
    )
)
echo         Database schema applied.

:: ──────────────────────────────────────────────────────────
::  GENERATE PRISMA CLIENT
:: ──────────────────────────────────────────────────────────
echo.
echo  [6/8] Generating Prisma client...
%RUNNER% run db:generate
if %ERRORLEVEL% NEQ 0 (
    echo   [WARNING] db:generate failed, trying with npx...
    npx prisma generate
    if %ERRORLEVEL% NEQ 0 (
        echo   [ERROR] Failed to generate Prisma client.
        pause
        exit /b 1
    )
)
echo         Prisma client generated.

:: ──────────────────────────────────────────────────────────
::  SEED DATABASE
:: ──────────────────────────────────────────────────────────
echo.
echo  [7/8] Seeding database with demo data...
%SEEDER%
if %ERRORLEVEL% NEQ 0 (
    echo   [WARNING] Database seeding had issues - data may already exist.
    echo         This is normal if you've already seeded before.
) else (
    echo         Database seeded successfully.
)

:: ──────────────────────────────────────────────────────────
::  START DEVELOPMENT SERVER
:: ──────────────────────────────────────────────────────────
echo.
echo  [8/8] Starting CampusOS AI development server...
echo.
echo  ============================================================
echo.
echo    _^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^
echo     CampusOS AI v2.0 is starting!
echo.
echo     Open your browser and go to:
echo         http://localhost:3000
echo.
echo     Default Admin Login:
echo         Email:    admin@JSE.com
echo         Password: Samyukth@2378
echo.
echo     Press Ctrl+C to stop the server.
echo    _^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^|_^
echo.
echo  ============================================================

%DEV_CMD%

pause
