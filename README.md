# 🏢 SaaS Provider - License Management System

Central management system for distributed B2B SaaS platform. Manages tenant licenses, validates requests, and distributes updates.


## 🚀 Quick Start (Zero-Touch Docker Setup)

We recommend using the automated one-click setup script.

**Mac/Linux:**
```bash
./start_platform.sh
```

**Windows:**
Double-click `start_platform.bat`

👉 [Read full INSTALL.md for details](INSTALL.md)

### Manual Development Setup (Old Way)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --port=8001
```

## 📊 API Endpoints

### Public API (For Tenant Apps)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/license/validate` | Validate license key |
| `GET` | `/api/license/{key}/info` | Get license details |
| `GET` | `/api/updates/check` | Check for updates |
| `GET` | `/api/updates/download/{version}` | Get update info |

### Admin API (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth/login` | Admin login |
| `POST` | `/api/admin/auth/logout` | Admin logout |
| `GET` | `/api/admin/dashboard` | Dashboard stats |
| `GET` | `/api/admin/tenants` | List tenants |
| `POST` | `/api/admin/tenants` | Create tenant |
| `GET` | `/api/admin/tenants/{id}` | Get tenant |
| `PUT` | `/api/admin/tenants/{id}` | Update tenant |
| `DELETE` | `/api/admin/tenants/{id}` | Delete tenant |
| `GET` | `/api/admin/licenses` | List licenses |
| `POST` | `/api/admin/licenses` | Create license |
| `POST` | `/api/admin/licenses/{id}/extend` | Extend license |
| `POST` | `/api/admin/licenses/{id}/revoke` | Revoke license |
| `GET` | `/api/admin/validations` | View logs |
| `GET` | `/api/admin/validations/stats` | Validation stats |
| `GET` | `/api/admin/versions` | List versions |
| `POST` | `/api/admin/versions` | Create version |

## 🔑 License Validation

Tenant apps call this endpoint on every request:

```bash
curl -X POST http://localhost:8001/api/license/validate \
  -H "Content-Type: application/json" \
  -H "X-License-Key: SAAS-XXXX-XXXX-XXXX-XXXX" \
  -d '{"domain":"tenant.example.com","app_version":"1.0.0"}'
```

**Response:**
```json
{
  "valid": true,
  "license": {
    "plan": "pro",
    "max_users": 50,
    "expires_at": "2026-12-25",
    "days_remaining": 364
  },
  "tenant": {
    "company_name": "Demo Tenant",
    "domain": "demo.tenant.local"
  },
  "update_available": true,
  "latest_version": "1.0.0"
}
```

## 📦 Database Schema

- `admins` - SaaS provider administrators
- `tenants` - Registered tenant companies
- `licenses` - License keys with plans and expiration
- `license_validations` - Validation attempt logs
- `app_versions` - Application releases

## 🔧 Default Test Data

| Type | Value |
|------|-------|
| Admin Email | admin@provider.com |
| Admin Password | password123 |
| Test Tenant | Demo Tenant |
| Test License | SAAS-SZNE-53LV-HOFY-WPPJ |

## 🌐 Connecting Tenant App

Update `tenant-app/.env`:

```env
LICENSE_PROVIDER_URL=http://localhost:8001/api
LICENSE_KEY=SAAS-XXXX-XXXX-XXXX-XXXX
```

## 📁 Project Structure

```
saas-provider/
├── backend/                    # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Api/           # License, Update controllers
│   │   │   └── Api/Admin/     # Admin panel controllers
│   │   ├── Models/            # Admin, Tenant, License, etc.
│   │   └── Services/          # LicenseValidationService
│   ├── database/migrations/   # 5 custom migrations
│   └── routes/api.php         # 19 API endpoints
│
└── admin-frontend/            # Angular 19 Admin Panel (TODO)
```

## 🛠️ Tech Stack

- Laravel 12 (PHP 8.4+)
- Laravel Sanctum for authentication
- SQLite (development) / PostgreSQL (production)
- Angular 19 (admin panel - coming soon)
