@echo off
title CampusOS AI v2.0 - Enterprise Edition
color 0A

echo.
echo ============================================================
echo                CampusOS AI v2.0
echo          Made by Jai Samyukth Enterprises
echo ============================================================
echo.

:: ──────────────────────────────────────────────────────────
::  CHECK FOR BUN / NODE
:: ──────────────────────────────────────────────────────────
echo  [1/7] Checking prerequisites...

where bun >nul 2>nul
if not errorlevel 1 (
    echo         Found: bun
    set "RUNNER=bun"
    set "INSTALLER=bun install"
    set "SEEDER=bunx tsx prisma/seed.ts"
    set "DEV_CMD=bun run dev"
    goto :prereq_done
)

where node >nul 2>nul
if not errorlevel 1 (
    echo         Found: node ^& npm
    set "RUNNER=npm"
    set "INSTALLER=npm install"
    set "SEEDER=npx tsx prisma/seed.ts"
    set "DEV_CMD=npm run dev"
    goto :prereq_done
)

echo.
echo   [ERROR] Neither bun nor node.js found!
echo   Please install one of the following:
echo     - Bun:   https://bun.sh
echo     - Node:  https://nodejs.org
echo.
pause
exit /b 1

:prereq_done

:: ──────────────────────────────────────────────────────────
::  CHECK / CREATE .env FILE
:: ──────────────────────────────────────────────────────────
echo.
echo  [2/7] Checking environment configuration...

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
echo  [3/7] Installing dependencies...
call %INSTALLER%
if errorlevel 1 (
    echo   [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo         Dependencies installed.

:: ──────────────────────────────────────────────────────────
::  PUSH DATABASE SCHEMA
:: ──────────────────────────────────────────────────────────
echo.
echo  [4/7] Setting up database...

if not exist "db" mkdir db

call %RUNNER% run db:push
if errorlevel 1 (
    echo   [ERROR] Failed to push database schema.
    pause
    exit /b 1
)
echo         Database schema applied.

:: ──────────────────────────────────────────────────────────
::  GENERATE PRISMA CLIENT
:: ──────────────────────────────────────────────────────────
echo.
echo  [5/7] Generating Prisma client...
call %RUNNER% run db:generate
if errorlevel 1 (
    echo   [ERROR] Failed to generate Prisma client.
    pause
    exit /b 1
)
echo         Prisma client generated.

:: ──────────────────────────────────────────────────────────
::  SEED DATABASE
:: ──────────────────────────────────────────────────────────
echo.
echo  [6/7] Seeding database with demo data...
call %SEEDER%
if errorlevel 1 (
    echo   [WARNING] Database seeding failed - data may already exist.
    echo         This is normal if you've already seeded before.
) else (
    echo         Database seeded successfully.
)

:: ──────────────────────────────────────────────────────────
::  START DEVELOPMENT SERVER
:: ──────────────────────────────────────────────────────────
echo.
echo  [7/7] Starting CampusOS AI development server...
echo.
echo  ============================================================
echo   CampusOS AI is starting!
echo.
echo   Open your browser and go to:
echo       http://localhost:3000
echo.
echo   Default Admin Login:
echo       Email:    admin@JSE.com
echo       Password: Samyukth@2378
echo.
echo   Press Ctrl+C to stop the server.
echo  ============================================================
echo.

call %DEV_CMD%

pause

