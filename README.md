# 🚗 Baliku Driver & Guide PWA

Progressive Web App untuk manajemen driver dan guide dengan admin portal.

## 📋 Features

- ✅ **Role-Based Access Control**: Driver, Guide, dan Admin
- ✅ **PWA Support**: Installable, offline-capable
- ✅ **Realtime Updates**: GPS tracking, status updates
- ✅ **Holiday Taxis Integration**: API integration untuk booking management
- ✅ **Build Process**: Optimized production builds
- ✅ **Vercel Ready**: Deployment configuration included

## 🏗️ Project Structure

```
.
├── apps/
│   ├── baliku-driver-server/    # Backend API (Express.js)
│   ├── baliku-driver-client/     # Driver/Guide PWA Client
│   └── baliku-admin-client/     # Admin PWA Client
├── api/                         # Vercel serverless functions
├── scripts/                     # Build & deployment scripts
├── vercel.json                  # Vercel configuration
└── package.json                 # Root package.json
```

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install
cd apps/baliku-driver-server
npm install
cd ../..

# Start development servers
start-all.bat  # Windows
# or
MAC-startup/start-all.sh  # Mac/Linux
```

### Build for Production

```bash
# Build all clients
npm run build

# Build & prepare for deployment
npm run build:all
```

### Deploy to Vercel

```bash
# Prepare and deploy
npm run deploy
```

## 🌐 Access URLs

### Development
- **Backend API**: http://localhost:4000
- **Driver/Guide Client**: http://localhost:3001
- **Admin Client**: http://localhost:3002

### Production (After Vercel Deploy)
- **Driver/Guide**: `https://your-project.vercel.app/driver`
- **Admin**: `https://your-project.vercel.app/admin`
- **API**: `https://your-project.vercel.app/api`

## 🔐 Login Credentials

### Driver/Guide
- Login menggunakan credentials dari database
- Username: Driver/Guide Name dari database
- Password: Password dari database

### Admin
- Username: `admin` (default, bisa diubah via env var)
- Password: `4dm1n` (default, bisa diubah via env var)

## ⚙️ Environment Variables

Lihat `.env.example` untuk daftar lengkap environment variables.

Required:
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `ADMIN_USERNAME` - Admin username
- `ADMIN_PASSWORD` - Admin password

## 📦 Dependencies

### Backend
- express
- mysql2
- cors
- dotenv
- express-rate-limit

### Frontend
- Tailwind CSS (CDN)
- Preline UI (CDN)

### Build Tools
- esbuild

## 🔨 Build Process

Aplikasi menggunakan esbuild untuk:
- JavaScript minification
- CSS minification
- Service Worker optimization
- Remove console.log for production

## 📚 Documentation

- `BUILD_GUIDE.md` - Build process documentation
- `VERCEL_DEPLOYMENT.md` - Vercel deployment guide
- `GIT_SETUP.md` - Git & GitHub setup guide

## 🔄 Realtime Updates

Aplikasi menggunakan polling mechanism:
- GPS location: Update setiap 30 detik
- Data refresh: Manual atau auto setiap 5 menit
- Status updates: Real-time saat user update

## 🛠️ Development

### Adding New Features
1. Edit source files di `apps/baliku-*-client/`
2. Test di development mode
3. Build untuk production: `npm run build`
4. Deploy: `npm run deploy`

### Database
- Run `apps/baliku-driver-server/database-optimization.sql` untuk optimasi
- Indexes sudah di-setup untuk fast queries

## 📝 License

Private project

## 👥 Contributors

Alerasajeruk

---

**Repository**: https://github.com/Alerasajeruk/balikudriver.git

