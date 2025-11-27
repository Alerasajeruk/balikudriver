# 🚀 Vercel Deployment Guide

## 📋 Overview

Panduan lengkap untuk deploy aplikasi Baliku Driver & Guide ke Vercel dengan dukungan realtime updates.

## 🏗️ Struktur Deployment

```
.
├── api/
│   └── index.js              # Vercel serverless function (backend API)
├── public/
│   ├── driver/              # Driver/Guide client (static files)
│   └── admin/               # Admin client (static files)
├── apps/
│   └── baliku-driver-server/
│       └── src/
│           └── index.js     # Express app (shared with local dev)
├── vercel.json              # Vercel configuration
├── .vercelignore           # Files to ignore in deployment
└── .env.example            # Environment variables template
```

## 📦 Prerequisites

1. **Vercel Account**: Daftar di [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install dengan `npm i -g vercel`
3. **Git Repository**: Push code ke GitHub/GitLab/Bitbucket

## 🔧 Setup Steps

### Step 1: Install Dependencies

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install project dependencies
npm install
cd apps/baliku-driver-server
npm install
```

### Step 2: Copy Frontend Files

Sebelum deploy, copy frontend files ke `public/` directory:

**Windows (PowerShell):**
```powershell
# Copy driver client
Copy-Item -Path "apps\baliku-driver-client\*" -Destination "public\driver\" -Recurse -Force

# Copy admin client
Copy-Item -Path "apps\baliku-admin-client\*" -Destination "public\admin\" -Recurse -Force
```

**Mac/Linux:**
```bash
# Copy driver client
cp -r apps/baliku-driver-client/* public/driver/

# Copy admin client
cp -r apps/baliku-admin-client/* public/admin/
```

### Step 3: Update API_BASE in Frontend

Update `API_BASE` di frontend untuk production:

**File: `public/driver/scripts/app.js` dan `public/admin/scripts/app.js`**

Ganti baris pertama:
```javascript
// OLD:
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:4000' : '';

// NEW:
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
  ? 'http://localhost:4000' 
  : '/api';
```

### Step 4: Setup Environment Variables

Di Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add semua variables dari `.env.example`:

```
DB_HOST=103.150.116.213
DB_PORT=3306
DB_USER=baliku
DB_PASSWORD=your_password_here
DB_NAME=balikunewdb
DB_POOL_SIZE=5
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password_here
HOLIDAY_TAXIS_ENDPOINT=https://suppliers.htxstaging.com
HOLIDAY_TAXIS_API_KEY=your_api_key_here
HOLIDAY_TAXIS_API_VERSION=2025-01
NODE_ENV=production
```

### Step 5: Deploy to Vercel

**Option 1: Via Vercel Dashboard**
1. Push code ke GitHub
2. Import project di Vercel Dashboard
3. Configure build settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install && cd apps/baliku-driver-server && npm install`
4. Add environment variables
5. Deploy!

**Option 2: Via Vercel CLI**
```bash
# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

## 🔄 Realtime Updates

Aplikasi menggunakan **polling mechanism** untuk realtime updates:

1. **Location Tracking**: Update GPS location setiap 30 detik
2. **Status Updates**: Real-time saat user update status
3. **Data Refresh**: Manual refresh button atau auto-refresh setiap 5 menit

### Cara Kerja:
- Frontend melakukan polling ke backend API
- Backend API membaca data langsung dari database
- Tidak perlu WebSocket (Vercel serverless tidak support persistent connections)

### Optimasi untuk Realtime:
- Database indexes sudah di-setup untuk fast queries
- Connection pooling optimized untuk serverless
- Rate limiting mencegah abuse

## 🌐 URLs Setelah Deploy

Setelah deploy, aplikasi akan tersedia di:

- **Driver/Guide Client**: `https://your-project.vercel.app/driver`
- **Admin Client**: `https://your-project.vercel.app/admin`
- **API Base**: `https://your-project.vercel.app/api`

## ⚙️ Configuration Files

### vercel.json
Konfigurasi routing dan serverless functions:
- API routes → `/api/*` → `api/index.js`
- Driver client → `/driver/*` → `public/driver/*`
- Admin client → `/admin/*` → `public/admin/*`

### .vercelignore
Files yang di-exclude dari deployment:
- Source files (`apps/baliku-driver-client`, `apps/baliku-admin-client`)
- Development files (`.bat`, `.sh`, `.md`)
- `node_modules` (akan di-install di Vercel)

## 🔍 Troubleshooting

### Issue: Database Connection Timeout
**Solution**: 
- Check database credentials di Environment Variables
- Pastikan database server allow connections dari Vercel IPs
- Increase `connectTimeout` di database config jika perlu

### Issue: API Returns 404
**Solution**:
- Check `vercel.json` routing configuration
- Pastikan `api/index.js` exists dan export default app
- Check Vercel function logs

### Issue: Frontend Can't Load
**Solution**:
- Pastikan files sudah di-copy ke `public/` directory
- Check `API_BASE` sudah di-update untuk production
- Check browser console untuk errors

### Issue: Rate Limiting Too Strict
**Solution**:
- Adjust rate limits di `apps/baliku-driver-server/src/index.js`
- Atau disable untuk testing (tidak recommended untuk production)

## 📊 Performance Tips

1. **Database Indexes**: Pastikan sudah run `database-optimization.sql`
2. **Connection Pooling**: Optimized untuk serverless (smaller pool)
3. **Caching**: Frontend cache data di localStorage
4. **CDN**: Vercel automatically serves static files via CDN

## 🔐 Security Notes

1. **Environment Variables**: Jangan commit `.env` file
2. **Database Credentials**: Gunakan strong passwords
3. **Rate Limiting**: Aktif untuk prevent abuse
4. **CORS**: Configured untuk allow frontend access
5. **Authentication**: All API endpoints require valid token

## 📝 Post-Deployment Checklist

- [ ] Environment variables sudah di-setup
- [ ] Frontend files sudah di-copy ke `public/`
- [ ] `API_BASE` sudah di-update untuk production
- [ ] Database indexes sudah dibuat
- [ ] Test login (driver, guide, admin)
- [ ] Test CRUD operations
- [ ] Test location tracking
- [ ] Test realtime updates
- [ ] Monitor Vercel function logs
- [ ] Setup custom domain (optional)

## 🚀 Continuous Deployment

Vercel akan auto-deploy setiap push ke main branch:
1. Push code ke GitHub
2. Vercel automatically builds & deploys
3. Preview deployments untuk pull requests

## 📞 Support

Jika ada masalah:
1. Check Vercel function logs
2. Check browser console untuk errors
3. Verify environment variables
4. Test database connection

---

**Happy Deploying! 🎉**

