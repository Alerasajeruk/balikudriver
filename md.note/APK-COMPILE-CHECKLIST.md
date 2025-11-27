# ✅ Checklist: Persiapan Compile PWA ke APK

Gunakan checklist ini untuk memastikan aplikasi siap di-compile menjadi APK.

## 📋 Pre-Compile Checklist

### 1. Manifest File ✅
- [x] File `manifest.webmanifest` ada
- [x] JSON valid (tidak ada syntax error)
- [x] `name` dan `short_name` sudah diisi
- [x] `start_url` benar (`/`)
- [x] `display` set ke `standalone`
- [x] `theme_color` dan `background_color` sudah diisi
- [x] Icons paths sudah benar

### 2. Icons ⚠️ **PERLU DIPERBAIKI**
- [ ] Folder `icons/` ada
- [ ] File `icon-192.png` ada (192x192 pixels)
- [ ] File `icon-512.png` ada (512x512 pixels)
- [ ] Icons quality bagus (tidak blur)
- [ ] Icons format PNG dengan transparansi

**Cara Generate Icons:**
1. Buka https://www.pwabuilder.com/imageGenerator
2. Upload logo dari `images/logo.png`
3. Download dan extract ke folder `icons/`

### 3. Service Worker ✅
- [x] File `sw.js` ada
- [x] Service worker registration code ada di `app.js`
- [x] Service worker bisa register (cek di browser DevTools)

### 4. Meta Tags ✅
- [x] `<meta name="viewport">` ada
- [x] `<meta name="theme-color">` ada
- [x] `<link rel="manifest">` ada

### 5. HTTPS/SSL ⚠️ **PENTING**
- [ ] Aplikasi accessible via HTTPS (untuk production)
- [ ] Localhost OK untuk development/testing
- [ ] SSL certificate valid (jika production)

**Catatan**: PWA Builder memerlukan HTTPS untuk generate APK (kecuali localhost).

### 6. Backend URL Configuration ⚠️ **PENTING**
- [ ] Backend URL di-hardcode atau menggunakan environment variable
- [ ] Untuk production, update `API_BASE` di `app.js`
- [ ] CORS enabled di backend
- [ ] Backend accessible dari Android device

**Update di `app.js`:**
```javascript
// Development
const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
  ? 'http://localhost:4000' 
  : '';

// Production - UPDATE INI!
const API_BASE = 'https://your-backend-api.com';
```

### 7. Testing
- [ ] Aplikasi berjalan normal di browser
- [ ] Login berfungsi
- [ ] Semua fitur utama berfungsi
- [ ] Tidak ada console errors
- [ ] Service worker registered (cek di DevTools → Application → Service Workers)

### 8. PWA Features
- [ ] Aplikasi bisa di-install sebagai PWA di browser
- [ ] Icon muncul saat install
- [ ] Splash screen muncul saat launch
- [ ] Offline fallback berfungsi (jika ada)

---

## 🚀 Quick Compile Steps (PWA Builder)

Setelah semua checklist di atas selesai:

1. **Deploy aplikasi** ke server atau gunakan ngrok
2. **Buka** https://www.pwabuilder.com/
3. **Masukkan URL** aplikasi
4. **Klik "Start"** dan tunggu scan selesai
5. **Klik "Build My PWA"** → **Android**
6. **Download APK**

**Total waktu: 10-15 menit** ⚡

---

## 📝 Notes

- Icons adalah **WAJIB** untuk compile APK
- HTTPS diperlukan untuk production (localhost OK untuk testing)
- Backend URL harus accessible dari Android device
- Test aplikasi di browser dulu sebelum compile

---

**Status**: 
- ✅ Manifest: Ready
- ✅ Service Worker: Ready  
- ⚠️ Icons: **PERLU DIBUAT**
- ⚠️ Backend URL: **PERLU DIUPDATE untuk production**

