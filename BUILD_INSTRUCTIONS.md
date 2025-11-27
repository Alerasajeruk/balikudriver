# 🔨 Build Instructions - Step by Step

## ✅ Setup Build Process - COMPLETED

Semua file build sudah dibuat dan siap digunakan!

## 📋 Files Created

1. ✅ `scripts/build-client.js` - Main build script
2. ✅ `scripts/clean-build.js` - Clean build directories
3. ✅ `setup-and-build.bat` - All-in-one setup script (Windows)
4. ✅ `BUILD_GUIDE.md` - Complete build documentation
5. ✅ `QUICK_BUILD.md` - Quick reference guide

## 🚀 Next Steps - Jalankan Sekarang

### Step 1: Install Dependencies

**Windows (Command Prompt atau PowerShell dengan execution policy):**
```cmd
npm install
cd apps\baliku-driver-server
npm install
cd ..\..
```

**Atau gunakan script batch:**
```cmd
setup-and-build.bat
```

### Step 2: Build All Clients

```cmd
npm run build
```

Ini akan:
- Build driver client → `apps/baliku-driver-client/dist/`
- Build admin client → `apps/baliku-admin-client/dist/`
- Minify JavaScript (remove console.log)
- Minify CSS
- Optimize Service Worker

### Step 3: Verify Build Output

Check apakah file berikut ada:
- ✅ `apps/baliku-driver-client/dist/scripts/app.js` (minified)
- ✅ `apps/baliku-driver-client/dist/styles/main.css` (minified)
- ✅ `apps/baliku-admin-client/dist/scripts/app.js` (minified)
- ✅ `apps/baliku-admin-client/dist/styles/main.css` (minified)

### Step 4: Prepare for Vercel Deployment

```cmd
npm run deploy:prepare
```

Ini akan:
- Build all clients
- Copy to `public/` directory
- Update API_BASE for production

### Step 5: Deploy to Vercel

```cmd
npm run deploy
```

Atau manual:
```cmd
vercel --prod
```

## 📊 Expected Results

Setelah build:
- **JavaScript**: 50-70% smaller (minified, no console.log)
- **CSS**: 30-50% smaller (minified)
- **Service Worker**: Optimized
- **Total**: Faster load times, better performance

## 🔧 Available Commands

```bash
# Build all clients
npm run build

# Build individual client
npm run build:driver
npm run build:admin

# Build & prepare for deployment
npm run build:all

# Clean build directories
npm run clean

# Deploy to Vercel
npm run deploy
```

## ⚠️ Troubleshooting

### PowerShell Execution Policy Error
**Solution**: 
- Gunakan Command Prompt (cmd.exe) instead of PowerShell
- Atau jalankan: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### "Cannot find module 'esbuild'"
**Solution**: 
```cmd
npm install
```

### Build Output Not Found
**Solution**: 
- Check error messages di console
- Verify source files exist
- Run `npm run clean` lalu build lagi

## 📝 Notes

- Build process **tidak mengubah** source files
- Build output di `dist/` folder
- Source files tetap utuh untuk development
- Untuk development, tetap gunakan source files langsung

---

**Sekarang jalankan: `setup-and-build.bat` atau `npm install` lalu `npm run build`**

