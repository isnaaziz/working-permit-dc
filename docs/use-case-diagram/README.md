# 📊 Use Case & Sequence Diagrams - Working Permit System

Dokumentasi lengkap Use Case Diagram dan Sequence Diagram untuk sistem Working Permit Data Center.

## 📋 Daftar Diagram

### Use Case Diagram
- **[usecase-diagram.plantuml](usecase-diagram.plantuml)** - Use Case Diagram lengkap semua role

### Sequence Diagrams

#### Autentikasi
- **[01-sequence-login.plantuml](01-sequence-login.plantuml)** - Proses Login
- **[02-sequence-register.plantuml](02-sequence-register.plantuml)** - Proses Registrasi

#### Visitor Flow
- **[03-sequence-visitor-buat-permit.plantuml](03-sequence-visitor-buat-permit.plantuml)** - Buat Permohonan Izin Kerja

#### PIC Flow
- **[04-sequence-pic-review.plantuml](04-sequence-pic-review.plantuml)** - PIC Review & Approve/Reject

#### Manager Flow
- **[05-sequence-manager-approval.plantuml](05-sequence-manager-approval.plantuml)** - Manager Final Approval

#### Security Flow
- **[06-sequence-security-checkin.plantuml](06-sequence-security-checkin.plantuml)** - Check-In Visitor
- **[07-sequence-security-checkout.plantuml](07-sequence-security-checkout.plantuml)** - Check-Out Visitor
- **[08-sequence-mutasi-barang-masuk.plantuml](08-sequence-mutasi-barang-masuk.plantuml)** - Catat Barang Masuk
- **[09-sequence-mutasi-barang-keluar.plantuml](09-sequence-mutasi-barang-keluar.plantuml)** - Verifikasi Barang Keluar

#### Sistem
- **[10-sequence-notifikasi.plantuml](10-sequence-notifikasi.plantuml)** - Sistem Notifikasi (Email, SMS, In-App)

---

## 🎯 Use Case Diagram Summary

### Total Use Cases: **47**

#### Breakdown by Role:

**VISITOR (10 use cases)**
- UC-01: Login
- UC-02: Register
- UC-03: Logout
- UC-04: Buat Permohonan Izin Kerja
- UC-05: Lihat Status Permit
- UC-06: Edit Permit (Pending)
- UC-07: Batalkan Permit
- UC-08: Download PDF Permit
- UC-09: Lihat Riwayat Kunjungan
- UC-10: Lihat QR Code & OTP

**PIC (8 use cases)**
- UC-01: Login
- UC-03: Logout
- UC-11: Review Permohonan Permit
- UC-12: Approve/Reject Permit (PIC)
- UC-13: Lihat Jadwal Kunjungan
- UC-14: Monitor Visitor di Lokasi
- UC-15: Generate Laporan PIC

**MANAGER (11 use cases)**
- UC-01: Login
- UC-03: Logout
- UC-16: Final Approval Permit
- UC-17: Reject Permit (Manager)
- UC-18: Monitor Real-Time
- UC-19: Kelola User
- UC-20: Lihat Analytics & Dashboard
- UC-21: Konfigurasi Sistem
- UC-22: Audit Trail
- UC-23: Review Incident Report

**SECURITY (15 use cases)**
- UC-01: Login
- UC-03: Logout
- UC-24: Check-In Visitor
- UC-25: Verifikasi QR Code & OTP
- UC-26: Catat Barang Masuk
- UC-27: Generate Label Barang
- UC-28: Terbitkan ID Card Temporary
- UC-29: Check-Out Visitor
- UC-30: Verifikasi Barang Keluar
- UC-31: Lihat Visitor Aktif
- UC-32: Lihat Access Log
- UC-33: Buat Incident Report
- UC-34: Lost & Found
- UC-35: Emergency Protocol

**ADMIN (9 use cases)**
- UC-01: Login
- UC-03: Logout
- UC-19: Kelola User (CRUD)
- UC-36: User Management
- UC-37: System Configuration
- UC-38: Database Management
- UC-39: System Logs & Monitoring
- UC-40: Backup & Restore
- UC-41: Maintenance Mode

**SISTEM (6 use cases)**
- UC-42: Kirim Notifikasi Email
- UC-43: Kirim Notifikasi SMS
- UC-44: Notifikasi In-App
- UC-45: Generate QR Code
- UC-46: Generate OTP
- UC-47: Generate PDF Permit

---

## 🔄 Sequence Diagram Details

### 1. Login (01-sequence-login.plantuml)
**Actors:** Pengguna  
**Participants:** UI, AuthController, AuthService, UserRepository, JwtTokenProvider, Database  
**Flow:**
- User input username & password
- Validasi kredensial
- Generate JWT token
- Redirect sesuai role

### 2. Register (02-sequence-register.plantuml)
**Actors:** Visitor  
**Participants:** UI, AuthController, UserService, UserRepository, EmailService, Database  
**Flow:**
- User isi form registrasi
- Validasi email & username (duplikat check)
- Enkripsi password
- Set role = VISITOR
- Kirim welcome email
- Auto redirect ke login

### 3. Buat Permit (03-sequence-visitor-buat-permit.plantuml)
**Actors:** Visitor  
**Participants:** UI, PermitController, PermitService, PermitRepository, NotificationService, Database  
**Flow:**
- Visitor isi form permit
- Validasi tanggal & data
- Generate permit ID
- Set status = PENDING
- Save dokumen (opsional)
- Kirim notifikasi ke PIC

### 4. PIC Review (04-sequence-pic-review.plantuml)
**Actors:** PIC  
**Participants:** UI, ApprovalController, ApprovalService, PermitRepository, ApprovalRepository, NotificationService, Database  
**Flow:**
- PIC lihat daftar pending permits
- Review detail permit
- Approve → status = PIC_APPROVED → notif ke Manager
- Reject → status = REJECTED → notif ke Visitor

### 5. Manager Approval (05-sequence-manager-approval.plantuml)
**Actors:** Manager  
**Participants:** UI, ApprovalController, ApprovalService, PermitRepository, QRCodeService, OTPService, PDFService, NotificationService, Database  
**Flow:**
- Manager review permit PIC_APPROVED
- Approve:
  - Status = APPROVED
  - Generate QR Code
  - Generate OTP (24h expiry)
  - Generate PDF permit
  - Kirim email ke Visitor (PDF + QR + OTP)
  - Kirim SMS OTP (opsional)
  - Notif ke PIC & Security
- Reject:
  - Status = REJECTED
  - Notif ke Visitor & PIC

### 6. Security Check-In (06-sequence-security-checkin.plantuml)
**Actors:** Visitor, Security  
**Participants:** UI, AccessController, AccessService, PermitRepository, OTPService, TempIdCardService, AccessLogRepository, NotificationService, Database  
**Flow:**
- Visitor datang, tunjukkan email permit
- Security scan QR Code
- Validasi QR → load permit data
- Visitor input OTP
- Verifikasi OTP (valid & not expired)
- Verifikasi identitas manual
- Generate Temporary ID Card (dengan RFID)
- Update status = CHECKED_IN
- Catat access log
- Kirim notifikasi ke Visitor, PIC, Manager

### 7. Security Check-Out (07-sequence-checkout.plantuml)
**Actors:** Visitor, Security  
**Participants:** UI, AccessController, AccessService, PermitRepository, TempIdCardRepository, AccessLogRepository, ReportService, NotificationService, Database  
**Flow:**
- Visitor selesai kerja, kembalikan ID Card
- Security scan ID Card
- Validasi status = CHECKED_IN
- Periksa barang bawaan
- Update status = CHECKED_OUT
- Nonaktifkan ID Card
- Hitung durasi kunjungan
- Generate laporan kunjungan (PDF)
- Catat access log
- Kirim notifikasi + laporan ke Visitor, PIC, Manager

### 8. Mutasi Barang Masuk (08-sequence-mutasi-barang-masuk.plantuml)
**Actors:** Visitor, Security  
**Participants:** UI, MutasiController, MutasiService, MutasiRepository, QRCodeService, NotificationService, Database  
**Flow:**
- Saat check-in, security tanya barang
- Untuk setiap barang:
  - Input data (kategori, merk, serial, kondisi)
  - Foto barang (3 angles)
  - Generate QR label
- Save ke database (status = MASUK)
- Cetak label sticker
- Tempel label ke barang
- Notif ke Visitor, PIC, Manager

### 9. Mutasi Barang Keluar (09-sequence-mutasi-barang-keluar.plantuml)
**Actors:** Visitor, Security  
**Participants:** UI, MutasiController, MutasiService, MutasiRepository, IncidentService, NotificationService, Database  
**Flow:**
- Saat check-out, verifikasi barang
- Scan label, cocokkan dengan fisik
- Cek kondisi setiap barang:
  - OK → status = KELUAR
  - Rusak → status = KELUAR_RUSAK, foto kerusakan
  - Hilang → status = HILANG
- Jika ada masalah:
  - Buat incident report
  - Print Berita Acara
  - Visitor tanda tangan
  - Notifikasi URGENT ke Manager
- Jika semua OK:
  - Generate laporan mutasi
  - Lanjut check-out

### 10. Notifikasi (10-sequence-notifikasi.plantuml)
**Actors:** User  
**Participants:** Event Source, NotificationService, EmailService, SMSService, NotificationRepository, WebSocketHandler, Database, SMTP, Twilio  
**Flow:**
- Event triggered dari service
- NotificationService identify event type
- Load template & build content
- Parallel processing:
  - **Email**: Build HTML, attach files, send via SMTP
  - **SMS**: Format 160 chars, send via Twilio
  - **In-App**: Save to DB, push via WebSocket (if online)
- Log all notifications
- Handle retries (max 3x) if failed
- User dapat:
  - Lihat unread notifications
  - Mark as read
  - Navigate ke related page

---

## 🎨 Diagram Conventions

### Actors
- 👤 **User roles**: Visitor, PIC, Manager, Security, Admin
- 🌐 **External systems**: Email Server, SMS Gateway

### Participants
- 🎨 **UI Layer**: User interface components
- 🎮 **Controller**: REST API controllers
- 💼 **Service**: Business logic layer
- 📦 **Repository**: Data access layer
- 🗄️ **Database**: Data persistence

### Message Types
- **→** : Synchronous call
- **-->** : Response/Return
- **->>** : Asynchronous call

### Fragments
- **alt/else**: Alternative paths (if/else)
- **opt**: Optional behavior
- **loop**: Iteration
- **par/and**: Parallel processing

---

## 📖 Cara Menggunakan

### 1. **Preview di VS Code**
```bash
# Install PlantUML extension
# Buka file .plantuml
# Tekan Alt+D untuk preview
```

### 2. **Export Gambar**
```bash
# Export ke PNG
plantuml -tpng *.plantuml

# Export ke SVG (recommended)
plantuml -tsvg *.plantuml
```

### 3. **Online Viewer**
- http://www.plantuml.com/plantuml/uml/
- Copy-paste kode diagram

---

## 🔗 Relasi dengan Diagram Lain

| Sequence Diagram | Activity Diagram | Use Case |
|------------------|------------------|----------|
| 01-sequence-login | 01-login-register | UC-01 |
| 02-sequence-register | 01-login-register | UC-02 |
| 03-sequence-visitor-buat-permit | 02-visitor-buat-permit | UC-04 |
| 04-sequence-pic-review | 03-pic-review-permit | UC-11, UC-12 |
| 05-sequence-manager-approval | 04-manager-approval-permit | UC-16, UC-17 |
| 06-sequence-security-checkin | 05-security-checkin | UC-24, UC-25, UC-28 |
| 07-sequence-security-checkout | 06-security-checkout | UC-29 |
| 08-sequence-mutasi-barang-masuk | 13-mutasi-barang-masuk | UC-26, UC-27 |
| 09-sequence-mutasi-barang-keluar | 14-checkout-barang | UC-30 |
| 10-sequence-notifikasi | 12-notifikasi-sistem | UC-42, UC-43, UC-44 |

---

## 📝 Notes

- ✅ Semua diagram dalam **Bahasa Indonesia**
- ✅ Sesuai dengan **Activity Diagram** yang sudah dibuat
- ✅ Include **error handling** & **alternative flows**
- ✅ Show **parallel processing** dimana perlu
- ✅ Lengkap dengan **database operations**
- ✅ Cover **notification system** (Email, SMS, In-App)
- ✅ Detail **tracking barang** (masuk & keluar)
- ✅ Handle **incident cases** (barang rusak/hilang)

---

**Version:** 1.0  
**Last Updated:** 5 Februari 2026  
**Created by:** GitHub Copilot
