# 📦 Git Commands - Quick Reference

## 🚀 Setup & Push ke GitHub

### Step 1: Install Git (jika belum)
Download: https://git-scm.com/download/win

### Step 2: Jalankan Script
```cmd
git-commit-and-push.bat
```

### Atau Manual Commands:

```bash
# 1. Initialize Git
git init

# 2. Add Remote
git remote add origin https://github.com/Alerasajeruk/balikudriver.git

# 3. Add Files
git add .

# 4. Commit
git commit -m "Initial commit: Baliku Driver & Guide PWA with Build Process and Vercel Deployment"

# 5. Push
git branch -M main
git push -u origin main
```

## 📋 Commit Message

Default commit message:
```
Initial commit: Baliku Driver & Guide PWA with Build Process and Vercel Deployment Setup

Features:
- Role-based access control (Driver, Guide, Admin)
- PWA support with service worker
- Build process with minification
- Vercel deployment configuration
- Realtime GPS tracking
- Holiday Taxis API integration
- Rate limiting & security features
- Database optimization indexes
```

## ⚠️ Important

- ✅ `.gitignore` sudah configured untuk exclude:
  - `node_modules/`
  - `apps/*/dist/` (build outputs)
  - `public/` (deployment files)
  - `.env` (sensitive data)
  
- ✅ Files yang akan di-commit:
  - Source code
  - Configuration files
  - Build scripts
  - Documentation

## 🔐 Authentication

Jika push meminta credentials:
1. Use **Personal Access Token** (bukan password)
2. Generate di: GitHub → Settings → Developer settings → Personal access tokens
3. Scope: `repo` (full control)

---

**Jalankan: `git-commit-and-push.bat`**

