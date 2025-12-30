@echo off
setlocal

echo 🚀 Starting Distributed SaaS Platform Setup...

REM 0. Create Shared Network
echo 🌐 Creating shared Docker network 'saas-network'...
docker network ls --filter name=^saas-network$ --format="{{ .Name }}" | findstr "saas-network" >nul
if %errorlevel% neq 0 (
    docker network create saas-network
    echo ✅ Network created.
) else (
    echo ℹ️ Network already exists.
)

REM 1. Start SaaS Provider
echo.
echo 🏗️ Building and Starting SaaS Provider...
docker-compose down
docker-compose up -d --build
echo ✅ SaaS Provider started (Admin: http://localhost:4201)

REM 2. Wait
echo ⏳ Waiting 10s for Provider to initialize...
timeout /t 10 /nobreak >nul

REM 3. Start Tenant App
echo.
echo 🏗️ Building and Starting Tenant App...
cd ..\TENANT
if %errorlevel% neq 0 (
    echo ❌ Could not find ..\TENANT directory. Please ensure workspaces are side-by-side.
    pause
    exit /b 1
)
docker-compose down
docker-compose up -d --build
cd ..\saas-provider
echo ✅ Tenant App started (Store: http://localhost:4200)

echo.
echo 🎉 Setup Complete!
echo ------------------------------------------------
echo 👉 Provider Admin: http://localhost:4201
echo 👉 Tenant Store:   http://localhost:4200
echo 👉 Provider API:   http://localhost:8001
echo 👉 Tenant API:     http://localhost:8000
echo ------------------------------------------------
echo Data has been seeded automatically.
echo Admin Login: admin@provider.com / password123
echo Tenant Login: admin@test.com / password123

pause
