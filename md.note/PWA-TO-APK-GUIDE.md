# 📱 PWA to APK - Compilation Guide

## 🎯 Overview

Aplikasi PWA Baliku dapat dikompilasi menjadi APK Android menggunakan beberapa metode. Dokumen ini menjelaskan **3 metode** dari yang paling mudah hingga yang paling advanced.

---

## ⚡ Metode 1: PWA Builder (PALING MUDAH) ⭐ Recommended

**PWA Builder** adalah tool online dari Microsoft yang sangat mudah digunakan, **TIDAK PERLU INSTALL APAPUN**.

### Keuntungan:
- ✅ **Paling mudah** - Hanya perlu URL aplikasi
- ✅ **Tidak perlu install software**
- ✅ **Gratis**
- ✅ **Generate APK langsung**
- ✅ **Auto-detect PWA features**

### Langkah-langkah:

#### 1. Pastikan Aplikasi Berjalan

Jalankan aplikasi di localhost atau deploy ke server:

```bash
# Start aplikasi
start-all.bat  # Windows
# atau
./MAC-startup/start-all.sh  # Mac/Linux
```

Aplikasi harus bisa diakses via URL:
- Driver/Guide: http://localhost:3001
- Admin: http://localhost:3002

**Catatan**: Untuk PWA Builder, aplikasi harus bisa diakses dari internet. Ada 2 opsi:

**Opsi A: Deploy ke Server** (Recommended)
- Deploy ke hosting (Vercel, Netlify, atau server sendiri)
- Pastikan URL bisa diakses publik

**Opsi B: Gunakan ngrok** (Untuk testing)
```bash
# Install ngrok
npm install -g ngrok

# Expose localhost
ngrok http 3001  # Untuk driver/guide
ngrok http 3002  # Untuk admin
```

#### 2. Buka PWA Builder

1. Buka browser
2. Kunjungi: https://www.pwabuilder.com/
3. Masukkan URL aplikasi Anda (misal: https://your-app.com atau ngrok URL)
4. Klik "Start"

#### 3. Generate APK

1. PWA Builder akan scan aplikasi Anda
2. Jika semua requirements terpenuhi, klik "Build My PWA"
3. Pilih "Android"
4. Klik "Generate Package"
5. Download APK file

#### 4. Install APK

1. Transfer APK ke Android device
2. Enable "Install from Unknown Sources" di Android settings
3. Install APK

---

## 🔧 Metode 2: Capacitor (Advanced, Lebih Powerful)

**Capacitor** adalah framework modern untuk membuat native apps dari web apps. Lebih powerful tapi perlu setup.

### Keuntungan:
- ✅ **Full native access** (camera, GPS, notifications, dll)
- ✅ **Custom native code** jika diperlukan
- ✅ **Update app via web** (over-the-air updates)
- ✅ **Support iOS & Android**

### Prerequisites:
- Node.js (sudah ada)
- Android Studio (untuk build APK)
- Java JDK 8 atau lebih baru

### Langkah-langkah:

#### 1. Install Capacitor

```bash
cd apps/baliku-driver-client  # atau baliku-admin-client
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

#### 2. Initialize Capacitor

```bash
npx cap init
```

Isi informasi:
- **App name**: Baliku Driver (atau Baliku Admin)
- **App ID**: com.baliku.driver (atau com.baliku.admin)
- **Web dir**: . (current directory)

#### 3. Add Android Platform

```bash
npx cap add android
```

#### 4. Build Web App

Pastikan aplikasi sudah di-build (jika ada build process) atau siapkan static files.

#### 5. Sync Files

```bash
npx cap sync
```

#### 6. Open in Android Studio

```bash
npx cap open android
```

#### 7. Build APK di Android Studio

1. Android Studio akan terbuka
2. Tunggu Gradle sync selesai
3. Klik **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
4. Tunggu build selesai
5. APK akan ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 8. Generate Signed APK (Untuk Production)

1. **Build** → **Generate Signed Bundle / APK**
2. Pilih **APK**
3. Buat atau pilih keystore
4. Isi informasi signing
5. Build release APK

---

## 🚀 Metode 3: TWA (Trusted Web Activity) dengan Bubblewrap

**TWA** adalah cara Google untuk wrap PWA menjadi Android app. Menggunakan **Bubblewrap** CLI tool.

### Keuntungan:
- ✅ **Official Google solution**
- ✅ **Lightweight** - Hanya wrapper, tidak ada native code
- ✅ **Fast build time**
- ✅ **Auto-update** dari web

### Prerequisites:
- Node.js (sudah ada)
- Java JDK 8 atau lebih baru
- Android SDK

### Langkah-langkah:

#### 1. Install Bubblewrap

```bash
npm install -g @bubblewrap/cli
```

#### 2. Initialize TWA Project

```bash
bubblewrap init --manifest=https://your-app.com/manifest.webmanifest
```

Atau jika local:
```bash
# Buat manifest URL yang accessible
bubblewrap init --manifest=http://localhost:3001/manifest.webmanifest
```

#### 3. Configure TWA

Edit `twa-manifest.json`:
```json
{
  "packageId": "com.baliku.driver",
  "name": "Baliku Driver",
  "launcherName": "Baliku",
  "display": "standalone",
  "themeColor": "#0ea5e9",
  "navigationColor": "#0ea5e9",
  "backgroundColor": "#0b1020",
  "startUrl": "/",
  "iconUrl": "https://your-app.com/icons/icon-512.png",
  "maskableIconUrl": "https://your-app.com/icons/icon-512.png",
  "splashScreenFadeOutDuration": 300,
  "signingKey": {
    "path": "./android.keystore",
    "alias": "android"
  }
}
```

#### 4. Build APK

```bash
bubblewrap build
```

#### 5. Install APK

APK akan ada di folder `./app-release.apk`

---

## 🔍 Persiapan Aplikasi untuk Compile

Sebelum compile, pastikan aplikasi sudah siap:

### ✅ Checklist:

1. **Manifest File** ✅
   - File: `manifest.webmanifest`
   - Sudah ada dan valid

2. **Service Worker** ✅
   - File: `sw.js`
   - Sudah ada di driver client
   - Sudah ditambahkan ke admin client

3. **Icons** ⚠️ **PERLU DIPERBAIKI**
   - Manifest reference: `/icons/icon-192.png` dan `/icons/icon-512.png`
   - Folder `icons/` mungkin belum ada

4. **HTTPS/SSL** ⚠️ **PENTING**
   - PWA Builder butuh HTTPS untuk generate APK
   - Localhost OK untuk development
   - Production harus HTTPS

5. **Meta Tags** ✅
   - `viewport` sudah ada
   - `theme-color` sudah ada

### 🔧 Perbaikan yang Diperlukan:

#### 1. Buat Icons Folder dan Icons

Icons diperlukan untuk APK. Buat folder dan generate icons:

**Opsi A: Generate Icons Online**
1. Kunjungi: https://www.pwabuilder.com/imageGenerator
2. Upload logo (dari `images/logo.png`)
3. Download generated icons
4. Extract ke folder `icons/`

**Opsi B: Buat Manual**
- Buat folder `icons/` di root client
- Buat icon 192x192 dan 512x512 pixels
- Simpan sebagai PNG

#### 2. Update Manifest (jika perlu)

Pastikan icon paths benar di `manifest.webmanifest`:

```json
{
  "icons": [
    { 
      "src": "/icons/icon-192.png", 
      "sizes": "192x192", 
      "type": "image/png",
      "purpose": "any maskable"
    },
    { 
      "src": "/icons/icon-512.png", 
      "sizes": "512x512", 
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

---

## 📋 Perbandingan Metode

| Fitur | PWA Builder | Capacitor | TWA/Bubblewrap |
|-------|-------------|-----------|----------------|
| **Kemudahan** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Setup Time** | 5 menit | 30-60 menit | 15-30 menit |
| **Native Features** | ❌ | ✅ | ❌ |
| **Custom Code** | ❌ | ✅ | ❌ |
| **Update via Web** | ✅ | ✅ | ✅ |
| **File Size** | Kecil | Sedang | Kecil |
| **Build Tools** | Online | Android Studio | CLI |
| **Best For** | Quick APK | Full native | Simple wrapper |

---

## 🎯 Rekomendasi

### Untuk Quick APK (Testing/Development):
→ **Gunakan PWA Builder** (Metode 1)

### Untuk Production dengan Native Features:
→ **Gunakan Capacitor** (Metode 2)

### Untuk Simple Wrapper (Official Google Way):
→ **Gunakan TWA/Bubblewrap** (Metode 3)

---

## 🐛 Troubleshooting

### Problem: PWA Builder tidak detect manifest

**Solution**:
1. Pastikan manifest accessible via URL
2. Cek browser console untuk errors
3. Pastikan manifest.json valid (gunakan JSON validator)
4. Pastikan `manifest` link ada di `<head>`

### Problem: Icons tidak muncul

**Solution**:
1. Pastikan folder `icons/` ada
2. Pastikan icon files ada (192x192 dan 512x512)
3. Pastikan paths di manifest benar
4. Cek browser Network tab untuk 404 errors

### Problem: Service Worker tidak register

**Solution**:
1. Pastikan file `sw.js` ada
2. Pastikan service worker registration code ada
3. Cek browser Application tab → Service Workers
4. Pastikan HTTPS (atau localhost untuk development)

### Problem: APK tidak install di Android

**Solution**:
1. Enable "Install from Unknown Sources"
2. Pastikan APK tidak corrupted (download ulang)
3. Pastikan Android version compatible (min Android 5.0)
4. Cek APK signature (untuk signed APK)

### Problem: App tidak connect ke backend

**Solution**:
1. Pastikan backend URL benar di app
2. Untuk production, update `API_BASE` di `app.js`
3. Pastikan CORS enabled di backend
4. Untuk localhost, gunakan IP address bukan localhost

---

## 📝 Catatan Penting

### 1. Backend URL untuk Production

Saat compile APK, pastikan backend URL di-hardcode atau menggunakan environment variable:

**Di `app.js`:**
```javascript
// Development
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
  ? 'http://localhost:4000' 
  : '';

// Production - Update ini!
const API_BASE = 'https://your-backend-api.com';
```

### 2. HTTPS Requirement

- PWA Builder memerlukan HTTPS untuk generate APK
- Localhost OK untuk development
- Production harus HTTPS
- Gunakan Let's Encrypt untuk free SSL

### 3. App Permissions

Jika menggunakan Capacitor, tambahkan permissions di `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<!-- Untuk GPS -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 4. App Icons & Splash Screen

- Icons: 192x192 dan 512x512 (PNG)
- Splash screen: 1284x2778 untuk Android
- Maskable icons untuk Android adaptive icons

---

## 🚀 Quick Start (PWA Builder)

**Langkah tercepat untuk generate APK:**

1. **Deploy aplikasi** ke server (atau gunakan ngrok)
2. **Buka** https://www.pwabuilder.com/
3. **Masukkan URL** aplikasi
4. **Klik Build** → Android → Download APK
5. **Install** di Android device

**Total waktu: 10-15 menit** ⚡

---

## 📚 Resources

- **PWA Builder**: https://www.pwabuilder.com/
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Bubblewrap Docs**: https://github.com/GoogleChromeLabs/bubblewrap
- **TWA Guide**: https://developer.chrome.com/docs/android/trusted-web-activity/

---

**Last Updated**: 2025-01-26

