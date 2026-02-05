# Activity Diagrams - Working Permit System

Dokumen ini berisi activity diagram untuk setiap menu dan role dalam sistem Working Permit Data Center.

## 📋 Daftar Activity Diagram

### 1. Autentikasi

- **01-login-register.plantuml** - Login & Register (Semua Role)

### 2. Role: VISITOR

- **02-visitor-buat-permit.plantuml** - Pengajuan Izin Kerja Baru
- **07-visitor-lihat-permit.plantuml** - Kelola Permit Saya

### 3. Role: PIC (Person In Charge)

- **03-pic-review-permit.plantuml** - Review & Approve/Reject Permit
- **08-pic-dashboard.plantuml** - Dashboard & Menu PIC

### 4. Role: MANAGER

- **04-manager-approval-permit.plantuml** - Final Approval Permit
- **09-manager-dashboard.plantuml** - Dashboard & Menu Manager

### 5. Role: SECURITY

- **05-security-checkin.plantuml** - Check-In Visitor
- **06-security-checkout.plantuml** - Check-Out Visitor
- **10-security-dashboard.plantuml** - Dashboard & Menu Security

### 6. Role: ADMIN

- **11-admin-dashboard.plantuml** - Dashboard & Menu Admin (System Management)

### 7. Tracking Barang & Peralatan

- **13-mutasi-barang-masuk.plantuml** - Catat Barang Masuk (Check-In)
- **14-checkout-barang.plantuml** - Verifikasi Barang Keluar (Check-Out)
- **15-laporan-mutasi-barang.plantuml** - Laporan & Monitoring Barang

### 8. Approval Mutasi Barang Keluar dari Data Center

- **16-visitor-ajukan-mutasi-barang.plantuml** - Visitor Ajukan Izin Bawa Barang Keluar
- **17-pic-review-mutasi-barang.plantuml** - PIC Review Mutasi Barang
- **18-manager-approval-mutasi-barang.plantuml** - Manager Approval Mutasi Barang
- **19-security-verifikasi-mutasi-keluar.plantuml** - Security Verifikasi saat Barang Keluar
- **20-visitor-kelola-mutasi.plantuml** - Visitor Kelola & Track Mutasi

### 9. Sistem

- **12-notifikasi-sistem.plantuml** - Sistem Notifikasi (Email, SMS, In-App)

## 🎯 Cara Menggunakan

### Melihat Diagram dengan PlantUML

1. **Install PlantUML Extension di VS Code**
   - Buka VS Code
   - Install extension "PlantUML" by jebbs

2. **Preview Diagram**
   - Buka file `.plantuml`
   - Tekan `Alt + D` untuk preview
   - Atau klik kanan → "Preview Current Diagram"

3. **Export Diagram**
   - Klik kanan pada preview
   - Pilih format: PNG, SVG, atau PDF

### Online Viewer

Anda juga bisa menggunakan online viewer:

- http://www.plantuml.com/plantuml/uml/
- Copy-paste isi file `.plantuml` ke editor

## 📊 Ringkasan Fitur per Role

### VISITOR

- ✅ Register & Login
- ✅ Buat Permohonan Izin Kerja
- ✅ Lihat Status Permit
- ✅ Edit Permit (jika masih PENDING)
- ✅ Batalkan Permit
- ✅ Download PDF Permit
- ✅ Lihat Riwayat Kunjungan
- ✅ Ajukan Mutasi Barang Keluar
- ✅ Track Status Mutasi Barang
- ✅ Download Surat Izin Mutasi

### PIC (Person In Charge)

- ✅ Review Permohonan (Approve/Reject)
- ✅ Lihat Jadwal Kunjungan
- ✅ Monitor Visitor d
- ✅ Review Mutasi Barang Keluar
- ✅ Approve/Reject Mutasi Barangi Lokasi
- ✅ Lihat Riwayat Permit
- ✅ Generate Laporan
- ✅ Manage Notifikasi

### MANAGER

- ✅ Final Approval Permit
- ✅ Monitor Real-Time
- ✅ Monitor Mutasi Barang
- ✅ Review Incident Report
- ✅ Kelola User
- ✅ Analytics &
- ✅ Final Approval Mutasi Barang Keluar
- ✅ Generate Surat Izin Mutasi Reports
- ✅ Konfigurasi Sistem
- ✅ Audit Trail

### SECURITY

- ✅ Check-In Visitor (QR + OTP + Biometrik)
- ✅ Catat Barang Masuk (Label & Foto)
- ✅ Check-Out Visitor
- ✅ Verifikasi Barang Keluar
- ✅ Lihat Visitor Aktif
- ✅ Monitor Barang di Lokasi
- ✅ Lihat Jadwal Kedatangan
- ✅ Access Log Real-Ti
- ✅ Verifikasi Mutasi Barang Keluar (QR Code)me
- ✅ Scan RFID/QR Code
- ✅ Lost & Found (Visitor & Barang)
- ✅ Incident Report (Barang Rusak/Hilang)
- ✅ Emergency Protocol

### ADMIN

- ✅ User Management (CRUD)
- ✅ System Configuration
- ✅ Database Management
- ✅ System Logs & Monitoring
- ✅ Backup & Restore
- ✅ Reports & Analytics
- ✅ Maintenance Mode

## 🔄 Workflow Utama

### Alur Permohonan Izin Kerja

```
VISITOR → Buat Permit
    ↓
PIC → Review (Approve/Reject)
    ↓
MANAGER → Final Approval (Approve/Reject)
    ↓
Sistem → Generate QR Code + OTP
    ↓
Email/SMS → Kirim ke Visitor
```

### Alur Kedatangan

```
VISITOR → Datang ke Data Center
    ↓
SECURITY → Scan QR Code
    ↓
SECURITY → Verifikasi OTP
    ↓
SECURITY → Verifikasi Biometrik
    ↓Catat Barang/Peralatan yang Dibawa
    ↓
SECURITY → Generate Label/Tag Barang
    ↓
SECURITY →
SECURITY → Terbitkan ID Card Temporary
    ↓
VISITOR → Akses Area dengan RFID
```

Barang (Label & Kondisi)
↓
SECURITY → Verifikasi Check-Out
↓
SECURITY → Nonaktifkan ID Card & Label
↓
Sistem → Generate Laporan Kunjungan + Mutasi Barang
SECURITY → Verifikasi Check-Out
↓
SECURITY → Nonaktifkan ID Card
↓
Sistem → Generate Laporan Kunjungan
↓
Email → Kirim Laporan ke Semua Pihak

```

## 🎨 Konvensi Diagram

### Swimlane
- **User** - Kolom untuk actor (Visitor, PIC, Manager, Security, Admin)
- **Sistem** - Kolom untuk proses sistem otomatis
- **External Service** - Kolom untuk service eksternal (Email, SMS, dll)

### Bentuk
- **Oval** - Start/Stop
- **Rectangle** - Aktivitas/Proses
- **Diamond** - Keputusan (if/else)
- **Note** - Catatan tambahan

### Warna (di tool yang support)
- **Hijau** - Proses berhasil
- **Merah** - Error/Reject
- **Kuning** - Warning/Pending
- **Biru** - Info/Process

- **Tracking barang/peralatan** untuk keamanan dan audit trail
- **Incident handling** untuk barang rusak/hilang
- **Label & QR Code** untuk setiap barang yang masuk
## 📝 Notes

- Semua diagram menggunakan **Bahasa Indonesia** sesuai permintaan
- Diagram mencakup **happy path** dan **error handling**
- Setiap aksi disertai **validasi** dan **notifikasi**
- Terdapat **audit trail** untuk setiap operasi penting
- Support **role-based access control (RBAC)**

## 🔗 Referensi

- [ARCHITECTURE.md](../ARCHITECTURE.md) - Arsitektur sistem
- [README.md](../README.md) - Dokumentasi utama
- [PROJECT_STATUS.md](../PROJECT_STATUS.md) - Status project

## 📞 Support

Untuk pertanyaan atau saran terkait activity diagram, silakan hubungi tim development.

---

**Version:** 1.0
**Last Updated:** 5 Februari 2026
**Created by:** GitHub Copilot
```
