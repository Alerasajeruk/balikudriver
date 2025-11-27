# 📦 Git Setup & Push to GitHub

## 🚀 Quick Start

### Option 1: Menggunakan Script Batch (Windows)
```cmd
git-commit-and-push.bat
```

Script ini akan:
1. Check/Initialize Git repository
2. Add remote GitHub repository
3. Add all files
4. Create commit
5. Push to GitHub

### Option 2: Manual Commands

#### 1. Install Git (jika belum)
Download dari: https://git-scm.com/download/win

#### 2. Initialize Git Repository
```bash
git init
```

#### 3. Add Remote Repository
```bash
git remote add origin https://github.com/Alerasajeruk/balikudriver.git
```

#### 4. Add All Files
```bash
git add .
```

#### 5. Create Commit
```bash
git commit -m "Initial commit: Baliku Driver & Guide PWA with Admin Portal, Build Process, and Vercel Deployment Setup"
```

#### 6. Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## ⚠️ Important Notes

### Files Excluded (via .gitignore)
- `node_modules/` - Dependencies
- `apps/*/dist/` - Build outputs
- `public/` - Deployment files
- `.env` - Environment variables (sensitive)
- `.vercel` - Vercel config
- `*.log` - Log files

### Files Included
- ✅ Source code (apps/baliku-driver-server, apps/baliku-driver-client, apps/baliku-admin-client)
- ✅ Build scripts
- ✅ Configuration files (vercel.json, package.json, dll)
- ✅ Documentation
- ✅ Startup scripts

## 🔐 Authentication

Jika push meminta authentication:

### Option 1: Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token dengan scope `repo`
3. Use token sebagai password saat push

### Option 2: SSH Key
1. Generate SSH key: `ssh-keygen -t ed25519 -C "your_email@example.com"`
2. Add to GitHub: Settings → SSH and GPG keys
3. Change remote URL: `git remote set-url origin git@github.com:Alerasajeruk/balikudriver.git`

## 🐛 Troubleshooting

### Error: "Repository is not empty"
**Solution**: 
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: "Authentication failed"
**Solution**: 
- Use Personal Access Token instead of password
- Or setup SSH key

### Error: "Git is not recognized"
**Solution**: 
- Install Git from https://git-scm.com/download/win
- Restart terminal after installation

## 📝 Commit Message Examples

```bash
# Initial commit
git commit -m "Initial commit: Baliku Driver & Guide PWA"

# Update commit
git commit -m "Update: Add build process and Vercel deployment setup"

# Feature commit
git commit -m "Feature: Add admin portal with full access"

# Fix commit
git commit -m "Fix: Auto-login on page refresh"
```

## ✅ Verification

Setelah push sukses, check di:
https://github.com/Alerasajeruk/balikudriver

---

**Jalankan: `git-commit-and-push.bat`**

