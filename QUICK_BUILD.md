# ⚡ Quick Build Guide

## 🚀 Langkah Cepat Build

### Option 1: Menggunakan Script Batch (Windows)
```bash
setup-and-build.bat
```

Script ini akan:
1. Install semua dependencies
2. Build semua clients
3. Verify build output

### Option 2: Manual Steps

#### 1. Install Dependencies
```bash
npm install
cd apps/baliku-driver-server
npm install
cd ../..
```

#### 2. Build All Clients
```bash
npm run build
```

#### 3. Verify Build Output
Check apakah file berikut ada:
- `apps/baliku-driver-client/dist/scripts/app.js`
- `apps/baliku-driver-client/dist/styles/main.css`
- `apps/baliku-admin-client/dist/scripts/app.js`
- `apps/baliku-admin-client/dist/styles/main.css`

## 📊 Expected Results

Setelah build, file sizes akan berkurang:
- **JavaScript**: ~50-70% smaller (minified, no console.log)
- **CSS**: ~30-50% smaller (minified, no comments)
- **Service Worker**: Optimized

## ✅ Build Success Indicators

1. ✅ No errors di console
2. ✅ `dist/` folders created
3. ✅ Minified files exist
4. ✅ File sizes reduced

## 🐛 Troubleshooting

### Build Fails: "Cannot find module 'esbuild'"
**Solution**: 
```bash
npm install
```

### Build Fails: "Cannot find module 'postcss'"
**Solution**: 
Tidak perlu postcss lagi, sudah di-remove. CSS minification menggunakan simple regex.

### PowerShell Execution Policy Error
**Solution**: 
Gunakan Command Prompt (cmd.exe) atau jalankan:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Next Steps After Build

1. **Test Build Output**:
   - Check `dist/` folders
   - Verify file sizes

2. **Prepare for Deployment**:
   ```bash
   npm run deploy:prepare
   ```

3. **Deploy to Vercel**:
   ```bash
   npm run deploy
   ```

---

**Happy Building! 🎉**

