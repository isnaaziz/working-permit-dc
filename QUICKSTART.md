# Quick Start Guide - Working Permit Data Center

## 🚀 Cara Cepat Menjalankan Aplikasi

### Step 1: Pastikan Java 17 Terinstall

```bash
java --version
```

Jika belum ada, download dari: https://adoptium.net/

### Step 2: Masuk ke Folder Project

```bash
cd /Users/macbookairm3/Downloads/working-permit-dc/working-permit-springboot
```

### Step 3: Jalankan Aplikasi

**Opsi A - Menggunakan Maven Wrapper (Recommended):**

```bash
./mvnw spring-boot:run
```

**Opsi B - Jika Maven sudah terinstall:**

```bash
mvn spring-boot:run
```

**Opsi C - Build dulu, lalu jalankan JAR:**

```bash
mvn clean package
java -jar target/working-permit-1.0.0.jar
```

### Step 4: Akses Aplikasi

Buka browser dan akses:

- **Aplikasi Web**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console

### Step 5: Login dengan Default User

```
Username: admin
Password: admin123
```

atau

```
Username: visitor1
Password: visitor123
```

## 🔧 Troubleshooting

### Port 8080 sudah digunakan?

Edit file `src/main/resources/application.yml`:

```yaml
server:
  port: 8081 # ganti ke port lain
```

### Build error?

```bash
mvn clean install -DskipTests
```

### Database error?

Cek H2 console di http://localhost:8080/h2-console dengan:

- JDBC URL: `jdbc:h2:mem:workingpermitdb`
- Username: `sa`
- Password: (kosong)

## 📋 Fitur yang Bisa Dicoba

1. **Registrasi User Baru** → http://localhost:8080/register
2. **Buat Permohonan Izin** → Login sebagai VISITOR
3. **Review Permohonan** → Login sebagai PIC
4. **Approve Izin** → Login sebagai MANAGER
5. **Check-in dengan QR + OTP** → Login sebagai SECURITY
6. **Lihat Access Log** → Dashboard

## 🎯 Alur Lengkap Testing

### 1. Registrasi Visitor Baru

```
POST http://localhost:8080/api/auth/register
Body:
{
  "username": "john_doe",
  "password": "password123",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+6281234567890",
  "company": "PT ABC",
  "idCardNumber": "1234567890",
  "role": "VISITOR"
}
```

### 2. Login

```
POST http://localhost:8080/api/auth/login
Body:
{
  "username": "john_doe",
  "password": "password123"
}
```

### 3. Buat Permohonan Izin

```
POST http://localhost:8080/api/permits
Headers: Authorization: Bearer <token_dari_login>
Body:
{
  "visitPurpose": "Preventive Maintenance Server",
  "visitType": "PREVENTIVE_MAINTENANCE",
  "dataCenter": "DC1",
  "picId": 2,
  "scheduledStartTime": "2025-10-25T09:00:00",
  "scheduledEndTime": "2025-10-25T17:00:00",
  "equipmentList": ["Laptop", "Toolbox", "Multimeter"]
}
```

### 4. PIC Review (Login sebagai PIC)

```
POST http://localhost:8080/api/approvals/{permitId}/review
Headers: Authorization: Bearer <pic_token>
Body:
{
  "approved": true,
  "comments": "Dokumen lengkap, disetujui"
}
```

### 5. Manager Approval (Login sebagai MANAGER)

```
POST http://localhost:8080/api/approvals/{permitId}/approve
Headers: Authorization: Bearer <manager_token>
Body:
{
  "approved": true,
  "comments": "Final approval granted"
}
```

### 6. Cek QR Code & OTP yang Digenerate

```
GET http://localhost:8080/api/qrcode/{permitId}
```

OTP akan dikirim otomatis ke email/SMS visitor.

### 7. Check-in di Data Center

```
POST http://localhost:8080/api/access/checkin
Body:
{
  "qrCodeData": "<qr_code_data_dari_permit>",
  "otpCode": "123456",
  "location": "Main Lobby"
}
```

### 8. Check-out

```
POST http://localhost:8080/api/access/checkout
Body:
{
  "permitId": 1,
  "location": "Main Exit"
}
```

## 📱 Testing dengan Postman

Import collection ini ke Postman untuk testing lengkap:

1. Download Postman: https://www.postman.com/downloads/
2. Import file `postman_collection.json` (akan dibuat)
3. Set environment variable `baseUrl` = `http://localhost:8080`
4. Jalankan requests secara berurutan

## 🎨 Frontend Testing

1. Buka http://localhost:8080
2. Klik "Register" untuk buat akun baru
3. Login dengan akun yang dibuat
4. Navigasi ke "Submit Permit Request"
5. Isi form dan submit
6. Logout, lalu login sebagai PIC untuk review
7. Logout, login sebagai MANAGER untuk approve
8. Lihat QR Code dan OTP di email/dashboard
9. Test check-in dengan scan QR + input OTP

## ⚠️ Catatan Penting

- Database menggunakan **H2 in-memory**, data akan **hilang** saat aplikasi di-restart
- Untuk production, ganti ke PostgreSQL (lihat README.md)
- Email/SMS notification memerlukan konfigurasi SMTP/Twilio
- Default users sudah dibuat otomatis saat aplikasi pertama kali jalan

## 📞 Bantuan

Jika ada error atau pertanyaan:

1. Cek logs di terminal
2. Cek H2 console untuk lihat data di database
3. Baca README.md lengkap untuk detail lebih lanjut

---

**Selamat mencoba! 🎉**
