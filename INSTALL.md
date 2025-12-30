# 🚀 Distributed SaaS Platform - Installation Guide

This repository (`saas-provider`) serves as the **Central Control Plane** for the distributed SaaS platform. It includes the "Master Start Scripts" to launch the entire ecosystem (Provider + Tenant).

## 📋 Prerequisites
- **Docker Desktop** (must be installed and running)
- **Git**

## 📂 Folder Structure
Ensure you have cloned both repositories side-by-side in the same parent directory:

```
workspace/
├── saas-provider/   (This repository)
└── TENANT/          (The Tenant Application repository)
```

## ⚡ Zero-Touch Setup (Recommended)

We provide automated scripts to setup networks, build containers, migrate databases, and seed data automatically.

### 🍎 macOS / 🐧 Linux
1. Open terminal in `saas-provider` folder.
2. Run the script:
   ```bash
   ./start_platform.sh
   ```

### 🪟 Windows
1. Open file explorer in `saas-provider` folder.
2. Double-click `start_platform.bat`.

---

## 🛠️ What happens?
1. Creates a shared docker network `saas-network`.
2. Builds and starts **SaaS Provider** (API & Admin Panel).
   - Auto-runs `php artisan migrate --force`
   - Auto-runs `php artisan db:seed`
3. Builds and starts **Tenant App** (API & Storefront) from the `../TENANT` directory.
   - Auto-runs migrations and seeding.
   - Connects to Provider for License Validation.

## 🌐 Access Points

| Service | URL | Default Credentials |
|---|---|---|
| **SaaS Admin Panel** | [http://localhost:4201](http://localhost:4201) | `admin@provider.com` / `password123` |
| **SaaS API** | [http://localhost:8001](http://localhost:8001) | - |
| **Tenant Store** | [http://localhost:4200](http://localhost:4200) | `admin@test.com` / `password123` |
| **Tenant API** | [http://localhost:8000](http://localhost:8000) | - |

## ❌ Troubleshooting
- **Ports usage**: Ensure ports `8000`, `8001`, `4200`, `4201`, `5432`, `5433` are free.
- **Docker Network**: If you see network errors, run `docker network prune` and try again.
