# 🔧 Fix: Auto-Login on Page Refresh

## Problem
Setiap refresh browser, login page selalu muncul sehingga harus login terus menerus.

## Root Cause
Kode untuk auto-login sudah di-comment out di `startApp()` function, sehingga aplikasi selalu menampilkan login screen meskipun user sudah login sebelumnya.

## Solution
1. **Uncomment dan perbaiki auto-login logic**
2. **Tambahkan token validation dengan backend** sebelum auto-login
3. **Clear invalid tokens** dan redirect ke login jika token expired

## Changes Made

### 1. Driver Client (`apps/baliku-driver-client/scripts/app.js`)

**Added `validateToken()` function**:
```javascript
async function validateToken(token){
  try{
    const res = await fetch(API_BASE + '/api/tables', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.ok;
  }catch(err){
    return false;
  }
}
```

**Updated `startApp()` function**:
- Load auth from localStorage
- Validate token with backend
- Auto-login if token valid
- Clear storage and show login if token invalid

### 2. Admin Client (`apps/baliku-admin-client/scripts/app.js`)

**Same changes as driver client**:
- Added `validateToken()` function
- Updated `startApp()` function with auto-login logic

## How It Works

1. **On Page Load**:
   - `startApp()` is called
   - Load auth data from localStorage (`balikuAuth` for driver/guide, `balikuAuthAdmin` for admin)
   
2. **Token Validation**:
   - If token exists, validate with backend using `/api/tables` endpoint
   - This endpoint requires authentication, so if it returns 200 OK, token is valid
   
3. **Auto-Login**:
   - If token is valid: Hide login screen, initialize app, apply role-based visibility
   - If token is invalid/expired: Clear storage, show login screen
   
4. **Session Expiry**:
   - Backend sessions expire after 24 hours
   - If token expired, validation will fail and user will be redirected to login

## Benefits

✅ **User Experience**: No need to login every time page is refreshed
✅ **Security**: Token is validated with backend before auto-login
✅ **Session Management**: Invalid/expired tokens are automatically cleared
✅ **Consistent**: Works for both driver/guide and admin clients

## Testing

1. **Login** → Token saved to localStorage
2. **Refresh page** → Should auto-login (no login screen)
3. **Wait 24 hours** → Token expires, should show login screen
4. **Invalid token** → Should clear storage and show login screen

## Notes

- Token validation uses `/api/tables` endpoint which requires authentication
- If validation fails (401/403), token is considered invalid
- Rate limiting still applies (100 requests per 15 minutes per IP)
- Session expiry is 24 hours (configurable in backend)

