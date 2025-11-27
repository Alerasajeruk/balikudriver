# 📚 Baliku Driver & Admin Application - Documentation

## 📋 Daftar Isi

1. [Overview](#overview)
2. [Struktur Aplikasi](#struktur-aplikasi)
3. [Prerequisites](#prerequisites)
4. [Instalasi](#instalasi)
5. [Konfigurasi](#konfigurasi)
6. [Menjalankan Aplikasi](#menjalankan-aplikasi)
7. [Akses Aplikasi](#akses-aplikasi)
8. [Login Credentials](#login-credentials)
9. [Fitur & Role-Based Access](#fitur--role-based-access)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Aplikasi Baliku adalah sistem manajemen driver dan guide dengan 3 komponen utama:

- **Backend API Server** - Menyediakan REST API untuk akses database dan autentikasi
- **Driver/Guide Client** - Aplikasi web untuk driver dan guide (PWA)
- **Admin Client** - Aplikasi web untuk administrator (PWA)

### Teknologi yang Digunakan

- **Backend**: Node.js, Express.js, MySQL2
- **Frontend**: Vanilla JavaScript, Tailwind CSS, Preline UI
- **Database**: MySQL

---

## 📁 Struktur Aplikasi

```
DRIVER AND GUIDE/
│
├── apps/
│   ├── baliku-driver-server/          # Backend API Server
│   │   ├── src/
│   │   │   └── index.js               # Main server file
│   │   ├── data/
│   │   │   └── holiday-taxis-config.json
│   │   ├── package.json
│   │   └── update-int-columns.js
│   │
│   ├── baliku-driver-client/           # Driver/Guide Frontend
│   │   ├── scripts/
│   │   │   └── app.js                 # Main application logic
│   │   ├── styles/
│   │   │   └── main.css               # Custom styles
│   │   ├── images/
│   │   ├── index.html                 # Main HTML file
│   │   ├── server.js                  # Static file server
│   │   ├── manifest.webmanifest       # PWA manifest
│   │   └── package.json
│   │
│   └── baliku-admin-client/            # Admin Frontend
│       ├── scripts/
│       │   └── app.js                 # Main application logic
│       ├── styles/
│       │   └── main.css               # Custom styles
│       ├── images/
│       ├── index.html                 # Main HTML file
│       ├── server.js                  # Static file server
│       ├── manifest.webmanifest       # PWA manifest
│       └── package.json
│
├── MAC-startup/                        # Startup scripts untuk Mac/Linux
│   ├── start-all.sh                    # Start semua aplikasi
│   ├── start-server.sh                 # Start backend only
│   └── start-client.sh                 # Start client only
│
├── start-all.bat                       # Startup script untuk Windows
├── start-server.bat
├── start-client.bat
├── package.json                        # Root package.json (workspaces)
└── documentation.md                    # File ini

```

---

## 🔧 Prerequisites

Sebelum menginstall aplikasi, pastikan sistem Anda memiliki:

### Required Software

1. **Node.js** (versi 14 atau lebih baru)
   - Download: https://nodejs.org/
   - Verifikasi: `node --version`
   - Akan otomatis menginstall npm

2. **MySQL Database**
   - Database server harus sudah berjalan
   - Akses ke database `balikunewdb`
   - User dengan privileges untuk read/write

3. **Git** (opsional, untuk clone repository)
   - Download: https://git-scm.com/

### System Requirements

- **RAM**: Minimum 2GB
- **Storage**: Minimum 500MB free space
- **Network**: Akses ke database server (jika remote)

---

## 📦 Instalasi

### Metode 1: Menggunakan Startup Script (Recommended)

#### Windows

1. Buka Command Prompt atau PowerShell
2. Navigate ke folder project:
   ```bash
   cd "D:\AJSTUDIO\BACKUP CURSOR\DRIVER AND GUIDE\v2 - stable app, login, with Htx API, Win-Mac startup\DRIVER AND GUIDE"
   ```
3. Jalankan script:
   ```bash
   start-all.bat
   ```
   Script akan otomatis:
   - Install dependencies untuk semua aplikasi
   - Start backend server
   - Start driver/guide client
   - Start admin client
   - Membuka browser

#### Mac / Linux

1. Buka Terminal
2. Navigate ke folder project:
   ```bash
   cd "/path/to/DRIVER AND GUIDE"
   ```
3. Berikan permission execute (jika perlu):
   ```bash
   chmod +x MAC-startup/start-all.sh
   ```
4. Jalankan script:
   ```bash
   ./MAC-startup/start-all.sh
   ```
   
   **Catatan**: Script akan otomatis install dependencies dan start semua aplikasi.

### Metode 2: Manual Installation

Jika Anda ingin install secara manual:

#### 1. Install Backend Dependencies

```bash
cd apps/baliku-driver-server
npm install
```

#### 2. Install Driver/Guide Client Dependencies

```bash
cd apps/baliku-driver-client
npm install
```

#### 3. Install Admin Client Dependencies

```bash
cd apps/baliku-admin-client
npm install
```

---

## ⚙️ Konfigurasi

### Backend Configuration

File konfigurasi backend menggunakan environment variables. Buat file `.env` di folder `apps/baliku-driver-server/`:

```env
# Database Configuration
DB_HOST=103.150.116.213
DB_PORT=3306
DB_NAME=balikunewdb
DB_USER=baliku
DB_PASSWORD=Jakarta@1945

# Server Port (default: 4000)
PORT=4000

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=4dm1n

# Holiday Taxis API (optional)
HOLIDAY_TAXIS_ENDPOINT=https://suppliers.htxstaging.com
HOLIDAY_TAXIS_API_KEY=your_api_key_here
HOLIDAY_TAXIS_API_VERSION=2025-01
```

**Catatan**: Jika file `.env` tidak ada, aplikasi akan menggunakan default values yang sudah di-hardcode di `src/index.js`.

### Database Setup

Pastikan database MySQL sudah dikonfigurasi dengan:

- Database name: `balikunewdb`
- Tables yang diperlukan:
  - `driver` - Data driver
  - `guide` - Data guide
  - `operasional services` - Data operasional
  - `services` - Data services
  - `car` - Data mobil
  - `places` - Data tempat
  - `agency` - Data agensi
  - `pricelist` - Data harga
  - `pendings` - Data pending orders
  - Dan table lainnya sesuai kebutuhan

---

## 🚀 Menjalankan Aplikasi

### Opsi 1: Start Semua Aplikasi Sekaligus

#### Windows
```bash
start-all.bat
```

#### Mac / Linux
```bash
./MAC-startup/start-all.sh
```

### Opsi 2: Start Masing-Masing Aplikasi

#### Start Backend Server

**Windows:**
```bash
start-server.bat
```

**Mac / Linux:**
```bash
./MAC-startup/start-server.sh
```

**Manual:**
```bash
cd apps/baliku-driver-server
npm run dev
```

#### Start Driver/Guide Client

**Windows:**
```bash
start-client.bat
```

**Mac / Linux:**
```bash
./MAC-startup/start-client.sh
```

**Manual:**
```bash
cd apps/baliku-driver-client
npm start
```

#### Start Admin Client

**Manual:**
```bash
cd apps/baliku-admin-client
npm start
```

### Verifikasi Aplikasi Berjalan

Setelah semua aplikasi di-start, Anda akan melihat:

1. **Backend API Server**
   ```
   Baliku Driver API running on http://localhost:4000
   ```

2. **Driver/Guide Client**
   ```
   Baliku Driver PWA running on http://localhost:3001
   ```

3. **Admin Client**
   ```
   Baliku Admin PWA running on http://localhost:3002
   ```

---

## 🌐 Akses Aplikasi

### URL & Port

| Aplikasi | URL | Port | Deskripsi |
|----------|-----|------|-----------|
| **Backend API** | http://localhost:4000 | 4000 | REST API Server |
| **Driver/Guide Client** | http://localhost:3001 | 3001 | Aplikasi untuk Driver & Guide |
| **Admin Client** | http://localhost:3002 | 3002 | Aplikasi untuk Administrator |

### Browser Access

1. Buka browser (Chrome, Firefox, Edge, Safari)
2. Akses URL sesuai kebutuhan:
   - **Driver/Guide**: http://localhost:3001
   - **Admin**: http://localhost:3002

### API Endpoints

Backend menyediakan REST API di http://localhost:4000:

- `GET /api/tables` - List semua tables
- `GET /api/tables/:name` - Get rows dari table
- `GET /api/tables/:name/meta` - Get metadata table
- `POST /api/tables/:name` - Create new row
- `PUT /api/tables/:name` - Update row
- `DELETE /api/tables/:name` - Delete row
- `POST /api/login` - Login authentication
- `GET /api/login/options?type=driver|guide|admin` - Get login options

**Catatan**: Semua endpoint (kecuali login) memerlukan authentication token.

---

## 🔐 Login Credentials

### Admin Login

- **URL**: http://localhost:3002
- **Username**: `admin`
- **Password**: `4dm1n`
- **Role**: Administrator (full access)

**Catatan**: Admin credentials disimpan di environment variables, bukan di database.

### Driver Login

- **URL**: http://localhost:3001
- **Role Selection**: Pilih "Driver"
- **Username**: Sesuai dengan "Driver Name" di database table `driver`
- **Password**: Sesuai dengan "Password" di database table `driver`
- **Role**: Driver (limited access)

### Guide Login

- **URL**: http://localhost:3001
- **Role Selection**: Pilih "Guide"
- **Username**: Sesuai dengan "Guide Name" di database table `guide`
- **Password**: Sesuai dengan "Password" di database table `guide`
- **Role**: Guide (limited access)

### Contoh Data Driver/Guide di Database

```sql
-- Driver Example
INSERT INTO driver (`Driver Name`, `Password`) VALUES ('EKO', 'password123');

-- Guide Example
INSERT INTO guide (`Guide Name`, `Password`) VALUES ('BUDI', 'password456');
```

---

## 🎭 Fitur & Role-Based Access

### Admin (Full Access)

Admin memiliki akses penuh ke semua fitur:

✅ **Menu Access:**
- Order Schedule
- Services
- Driver List
- Guide List
- Car List
- Places
- Agency
- Pricelist
- Pending Order

✅ **Settings:**
- Database Configuration
- API Connection Configuration

✅ **Actions:**
- View all data (no filtering)
- Add new rows
- Edit existing rows
- Delete rows
- Send to HTX
- Change Car
- Reset Timer
- All status toggles

✅ **Data Visibility:**
- All fields visible
- All tables accessible
- No data filtering

### Driver (Limited Access)

Driver memiliki akses terbatas:

✅ **Menu Access:**
- Order Schedule (filtered by driver name)
- Driver List (only own data)

❌ **Hidden Menus:**
- Services
- Guide List
- Car List
- Places
- Agency
- Pricelist
- Pending Order
- Settings

❌ **Restricted Actions:**
- Cannot add rows
- Cannot edit rows
- Cannot delete rows
- Cannot access settings

✅ **Data Visibility:**
- Only sees data related to their name
- Some fields hidden (financial, internal data)

### Guide (Limited Access)

Guide memiliki akses terbatas:

✅ **Menu Access:**
- Order Schedule (filtered by guide name)
- Guide List (only own data)

❌ **Hidden Menus:**
- Services
- Driver List
- Car List
- Places
- Agency
- Pricelist
- Pending Order
- Settings

❌ **Restricted Actions:**
- Cannot add rows
- Cannot edit rows
- Cannot delete rows
- Cannot access settings

✅ **Data Visibility:**
- Only sees data related to their name
- Some fields hidden (financial, internal data)

---

## 🔍 Troubleshooting

### Problem: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::4000`

**Solution**:
1. Cek aplikasi yang menggunakan port tersebut
2. Stop aplikasi yang menggunakan port
3. Atau ubah port di konfigurasi

**Windows:**
```bash
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -i :4000
kill -9 <PID>
```

### Problem: Database Connection Failed

**Error**: `Error: connect ECONNREFUSED` atau `Access denied`

**Solution**:
1. Pastikan MySQL server berjalan
2. Cek credentials di `.env` atau `src/index.js`
3. Pastikan database `balikunewdb` sudah ada
4. Pastikan user memiliki privileges

**Test Connection:**
```bash
mysql -h 103.150.116.213 -u baliku -p balikunewdb
```

### Problem: Dependencies Installation Failed

**Error**: `npm ERR!` saat install

**Solution**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` dan `package-lock.json`
3. Install ulang:
   ```bash
   npm install
   ```

### Problem: Login Failed

**Error**: "Invalid name or password"

**Solution**:
1. **Untuk Admin:**
   - Pastikan `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di `.env` benar
   - Default: username=`admin`, password=`4dm1n`

2. **Untuk Driver/Guide:**
   - Pastikan data ada di database
   - Pastikan "Driver Name" / "Guide Name" sesuai (case-insensitive tapi harus exact match)
   - Pastikan password sesuai dengan di database

### Problem: CORS Error

**Error**: `Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3001' has been blocked by CORS policy`

**Solution**:
- Backend sudah dikonfigurasi dengan CORS enabled
- Pastikan backend server berjalan di port 4000
- Pastikan frontend mengakses backend yang benar

### Problem: Module Not Found

**Error**: `Cannot find module 'express'` atau module lainnya

**Solution**:
1. Pastikan sudah install dependencies:
   ```bash
   cd apps/baliku-driver-server
   npm install
   ```
2. Pastikan menggunakan Node.js versi 14+

### Problem: Browser Tidak Buka Otomatis

**Solution**:
- Buka browser manual
- Akses URL:
  - Driver/Guide: http://localhost:3001
  - Admin: http://localhost:3002

---

## 📝 Catatan Penting

### Security Notes

1. **Password Storage**: 
   - Driver/Guide passwords disimpan sebagai plain text di database
   - Admin password disimpan di environment variables
   - **Rekomendasi**: Implement password hashing untuk production

2. **Session Management**:
   - Session tokens disimpan di memory (akan hilang saat server restart)
   - Session expiry: 24 jam
   - **Rekomendasi**: Gunakan persistent session storage untuk production

3. **Environment Variables**:
   - Jangan commit file `.env` ke repository
   - Gunakan secure storage untuk production credentials

### Development vs Production

**Development (Current Setup)**:
- Localhost only
- Plain text passwords
- In-memory sessions
- HTTP (not HTTPS)

**Production Recommendations**:
- Use HTTPS
- Implement password hashing (bcrypt)
- Use secure session storage (Redis, database)
- Add rate limiting
- Add request validation
- Use environment variables for all secrets
- Implement proper error logging

---

## 📞 Support

Jika mengalami masalah yang tidak tercantum di dokumentasi ini:

1. Cek console logs di terminal
2. Cek browser console (F12)
3. Verifikasi semua prerequisites terpenuhi
4. Pastikan database connection berfungsi
5. Pastikan semua port tidak conflict

---

## 📄 License

Internal use only - Baliku Application

---

**Last Updated**: 2025-01-26
**Version**: 2.0 (Stable with Admin Portal)

