# ⚡ Quick Start: Deploy ke Vercel

## 🚀 Langkah Cepat (5 Menit)

### 1. Prepare Files
```bash
# Windows
scripts\prepare-vercel-deploy.bat

# Mac/Linux
chmod +x scripts/prepare-vercel-deploy.sh
./scripts/prepare-vercel-deploy.sh
```

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Login ke Vercel
```bash
vercel login
```

### 4. Setup Environment Variables
Di Vercel Dashboard → Project Settings → Environment Variables, tambahkan:

```
DB_HOST=103.150.116.213
DB_PORT=3306
DB_USER=baliku
DB_PASSWORD=your_password
DB_NAME=balikunewdb
DB_POOL_SIZE=5
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
HOLIDAY_TAXIS_ENDPOINT=https://suppliers.htxstaging.com
HOLIDAY_TAXIS_API_KEY=your_api_key
HOLIDAY_TAXIS_API_VERSION=2025-01
NODE_ENV=production
```

### 5. Deploy!
```bash
vercel --prod
```

## ✅ Selesai!

Aplikasi akan tersedia di:
- **Driver/Guide**: `https://your-project.vercel.app/driver`
- **Admin**: `https://your-project.vercel.app/admin`
- **API**: `https://your-project.vercel.app/api`

## 📝 Catatan Penting

1. **Database**: Pastikan database server allow connections dari Vercel IPs
2. **Environment Variables**: Jangan commit `.env` file ke Git
3. **Realtime Updates**: Menggunakan polling (setiap 30 detik untuk GPS, 5 menit untuk data refresh)
4. **Auto-Deploy**: Setiap push ke main branch akan auto-deploy

## 🔧 Troubleshooting

**Database connection timeout?**
→ Check database credentials dan pastikan server allow external connections

**API returns 404?**
→ Check `vercel.json` routing dan pastikan `api/index.js` exists

**Frontend can't load?**
→ Pastikan files sudah di-copy ke `public/` dan `API_BASE` sudah di-update

---

Lihat `VERCEL_DEPLOYMENT.md` untuk panduan lengkap.

