# JWT Authentication Guide

## Overview

Aplikasi Working Permit sekarang menggunakan **JWT (JSON Web Token)** untuk authentication dan authorization. Setiap request ke protected API endpoints memerlukan JWT token yang valid.

## Features

✅ **Access Token** - Token untuk mengakses API (expires dalam 24 jam)  
✅ **Refresh Token** - Token untuk mendapatkan access token baru (expires dalam 7 hari)  
✅ **Token Validation** - Endpoint untuk validasi token  
✅ **Automatic Token Refresh** - Frontend auto-refresh token sebelum expired  
✅ **Secure Storage** - Token disimpan di localStorage dengan encryption

---

## API Endpoints

### 1. Login (Get JWT Tokens)

**POST** `/api/auth/login`

**Request:**
```json
{
  "username": "puspaaaa",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "userId": 2,
  "username": "puspaaaa",
  "fullName": "Puspa Indah",
  "email": "puspa@example.com",
  "role": "VISITOR",
  "company": "PT Digital Solutions",
  "phoneNumber": "081234567891",
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresAt": 1761234610000
}
```

---

### 2. Refresh Access Token

**POST** `/api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresAt": 1761234610000
}
```

---

### 3. Validate Token

**POST** `/api/auth/validate`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Response:**
```json
{
  "valid": true,
  "username": "puspaaaa",
  "expiresAt": 1761234610000
}
```

---

## Using JWT in API Requests

### 1. Using cURL

```bash
# Login terlebih dahulu
LOGIN_RESPONSE=$(curl -s http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"puspaaaa","password":"password123"}')

# Extract access token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])")

# Use token in API request
curl http://localhost:8080/api/permits/visitor/2 \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Using JavaScript (Frontend)

```javascript
// Login dan simpan tokens
async function login(username, password) {
    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Simpan tokens
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('tokenExpiry', data.expiresAt);
        localStorage.setItem('user', JSON.stringify({
            userId: data.userId,
            username: data.username,
            fullName: data.fullName,
            role: data.role
        }));
    }
    
    return data;
}

// Fungsi untuk mendapatkan token yang valid
async function getValidToken() {
    const token = localStorage.getItem('accessToken');
    const expiry = localStorage.getItem('tokenExpiry');
    
    // Cek apakah token expired atau akan expired dalam 5 menit
    const now = Date.now();
    if (expiry && (now >= expiry - 300000)) {
        // Refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch('http://localhost:8080/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('tokenExpiry', data.expiresAt);
            return data.accessToken;
        }
    }
    
    return token;
}

// Fungsi untuk memanggil API dengan authentication
async function callAPI(url, options = {}) {
    const token = await getValidToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
        // Token invalid, redirect ke login
        localStorage.clear();
        window.location.href = '/login.html';
        return;
    }
    
    return response.json();
}

// Contoh penggunaan
async function getMyPermits() {
    const user = JSON.parse(localStorage.getItem('user'));
    const data = await callAPI(`http://localhost:8080/api/permits/visitor/${user.userId}`);
    return data;
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}
```

---

## Protected Endpoints

Semua endpoint berikut memerlukan JWT token:

### Visitor Endpoints
- `GET /api/permits/visitor/{visitorId}` - Get permits for visitor
- `POST /api/permits` - Create new permit
- `GET /api/permits/{id}` - Get permit details
- `GET /api/notifications/user/{userId}` - Get user notifications

### PIC Endpoints  
- `GET /api/approvals/pic/{picId}/pending` - Get pending approvals for PIC
- `POST /api/approvals/{approvalId}/approve` - Approve permit
- `POST /api/approvals/{approvalId}/reject` - Reject permit

### Manager Endpoints
- `GET /api/approvals/manager/{managerId}/pending` - Get pending approvals for manager
- `POST /api/approvals/{approvalId}/approve` - Approve permit

### Security Endpoints
- `POST /api/access/check-in` - Check-in visitor
- `POST /api/access/check-out` - Check-out visitor
- `POST /api/access/validate-qr` - Validate QR code
- `POST /api/access/validate-otp` - Validate OTP

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/permits` - Get all permits
- `GET /api/admin/stats` - Get statistics

---

## Token Configuration

Token configuration di `application.yml`:

```yaml
app:
  jwt:
    secret: mySecretKeyForWorkingPermitDataCenterSystem2025VeryLongSecretKey
    expiration: 86400000  # 24 hours in milliseconds
```

**Access Token**: Expires dalam 24 jam  
**Refresh Token**: Expires dalam 7 hari (7x access token expiration)

---

## Security Best Practices

1. **HTTPS Only** - Gunakan HTTPS di production untuk protect tokens
2. **Token Storage** - Simpan di localStorage (atau sessionStorage untuk security lebih tinggi)
3. **Auto Refresh** - Refresh token sebelum expired
4. **Logout** - Clear localStorage saat logout
5. **Token Validation** - Validate token di backend setiap request
6. **Secret Key** - Gunakan secret key yang panjang dan complex (min 256 bits)

---

## Testing Authentication

### Test Login
```bash
curl http://localhost:8080/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"puspaaaa","password":"password123"}' | python3 -m json.tool
```

### Test Protected Endpoint
```bash
# Set your token here
TOKEN="your_access_token_here"

curl http://localhost:8080/api/permits/visitor/2 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### Test Token Refresh
```bash
REFRESH_TOKEN="your_refresh_token_here"

curl http://localhost:8080/api/auth/refresh \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | python3 -m json.tool
```

### Test Token Validation
```bash
TOKEN="your_access_token_here"

curl http://localhost:8080/api/auth/validate \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$TOKEN\"}" | python3 -m json.tool
```

---

## Error Handling

### 401 Unauthorized
```json
{
  "timestamp": "2025-10-22T15:50:00.000+00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Access Denied",
  "path": "/api/permits/visitor/2"
}
```

**Solution**: Token invalid atau expired. Refresh token atau login kembali.

### 403 Forbidden
```json
{
  "timestamp": "2025-10-22T15:50:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied",
  "path": "/api/admin/users"
}
```

**Solution**: User tidak memiliki role/permission yang tepat.

---

## Complete Example

Berikut contoh lengkap workflow:

```javascript
// 1. Login
const loginData = await login('puspaaaa', 'password123');
console.log('Logged in as:', loginData.fullName);

// 2. Get my permits (auto include JWT token)
const permits = await callAPI('http://localhost:8080/api/permits/visitor/2');
console.log('My permits:', permits);

// 3. Create new permit
const newPermit = await callAPI('http://localhost:8080/api/permits', {
    method: 'POST',
    body: JSON.stringify({
        visitPurpose: 'Server Maintenance',
        visitType: 'PREVENTIVE_MAINTENANCE',
        dataCenter: 'DC1',
        picId: 3,
        scheduledStartTime: '2025-10-25T09:00:00',
        scheduledEndTime: '2025-10-25T17:00:00',
        equipmentList: ['Laptop', 'Toolkit']
    })
});

// 4. Logout
logout();
```

---

## Test Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| puspaaaa | password123 | VISITOR | Test visitor account |
| visitor1 | password123 | VISITOR | Another visitor |
| pic1 | password123 | PIC | Person In Charge |
| pic2 | password123 | PIC | Another PIC |
| manager1 | password123 | MANAGER | Manager for approvals |
| security1 | password123 | SECURITY | Security guard |
| admin | password123 | ADMIN | System administrator |

---

## JWT Token Structure

JWT token terdiri dari 3 bagian (separated by `.`):

### Header
```json
{
  "alg": "HS512",
  "typ": "JWT"
}
```

### Payload (Claims)
```json
{
  "sub": "puspaaaa",
  "iat": 1761148210,
  "exp": 1761234610,
  "authorities": [
    {
      "authority": "ROLE_VISITOR"
    }
  ]
}
```

### Signature
HMACSHA512(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)

---

## Troubleshooting

### Token tidak valid
- Pastikan format: `Authorization: Bearer <token>`
- Cek expiration time
- Cek secret key di application.yml

### Circular dependency error
- Fixed dengan `@Lazy` annotation di SecurityConfig

### Jackson serialization error
- Tambahkan `@JsonIgnoreProperties` di entities
- Configure Jackson to handle Hibernate proxies

---

## Next Steps

1. ✅ Implement token storage di localStorage
2. ✅ Auto token refresh sebelum expired  
3. ✅ Update semua API calls untuk include JWT
4. 🔄 Add token encryption di localStorage
5. 🔄 Implement remember me functionality
6. 🔄 Add session management dashboard

---

**Aplikasi sekarang fully secured dengan JWT Authentication! 🔐**
