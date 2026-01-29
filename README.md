# Data Center Working Permit System

Sistem Working Permit (Izin Kerja) untuk Data Center dengan Autentikasi 2-Faktor (2FA)

## 📋 Deskripsi

Aplikasi web berbasis Spring Boot untuk mengelola izin kerja pengunjung ke Data Center. Sistem ini mengimplementasikan workflow approval bertingkat, QR Code generation, OTP 2-Factor Authentication, dan tracking akses real-time.

### Fitur Utama

- ✅ **Permohonan Izin Kerja** - Pengunjung mengajukan permohonan dengan upload dokumen
- ✅ **Workflow Approval Bertingkat** - Review oleh PIC dan Approval oleh Manager
- ✅ **QR Code Generation** - QR Code unik untuk setiap izin yang disetujui
- ✅ **2-Factor Authentication** - OTP via Email/SMS untuk verifikasi kedatangan
- ✅ **Biometric Verification** - Verifikasi KTP dan Face Recognition
- ✅ **Temporary ID Card** - Penerbitan kartu akses sementara dengan RFID
- ✅ **Access Control** - Tracking masuk/keluar area dengan access log
- ✅ **Real-time Notifications** - Email, SMS, dan in-app notifications
- ✅ **Audit Trail** - Log lengkap semua aktivitas
- ✅ **Dashboard & Reports** - Dashboard untuk berbagai role

## 🏗️ Arsitektur Sistem

### Alur Proses Bisnis

#### Fase 1: Permohonan Izin Kerja (Sebelum Kedatangan)

```
Pengunjung → Ajukan Permohonan (Web App)
           ↓
     Sistem Validasi
           ↓
     PIC Review → Approve/Reject
           ↓
     Manager Approval → Approve/Reject
           ↓
     Generate QR Code + OTP
           ↓
     Kirim ke Pengunjung (Email/SMS)
```

#### Fase 2: Kedatangan & Verifikasi (Di Data Center)

```
Pengunjung → Scan QR Code
          ↓
     Input OTP Code
          ↓
     Verifikasi Biometrik (KTP/Face)
          ↓
     Terbitkan Temporary ID Card
          ↓
     Akses ke Area Kerja
```

#### Fase 3: Akses & Keberangkatan

```
Pengunjung → Tap ID Card (Entry)
          ↓
     Sistem Akses Kontrol
          ↓
     Bekerja di Area (dengan PIC)
          ↓
     Tap ID Card (Exit)
          ↓
     Generate Laporan
```

## 🛠️ Teknologi Stack

- **Backend Framework**: Spring Boot 3.2.0
- **Security**: Spring Security + JWT
- **Database**: H2 (Development) / PostgreSQL (Production)
- **ORM**: Spring Data JPA / Hibernate
- **Template Engine**: Thymeleaf
- **QR Code**: ZXing (Google)
- **Email**: Spring Mail
- **Build Tool**: Maven
- **Java Version**: 17

## 📦 Struktur Project

```
working-permit-springboot/
├── src/
│   ├── main/
│   │   ├── java/com/datacenter/workingpermit/
│   │   │   ├── model/              # Entity classes
│   │   │   │   ├── User.java
│   │   │   │   ├── WorkingPermit.java
│   │   │   │   ├── Approval.java
│   │   │   │   ├── AccessLog.java
│   │   │   │   ├── Notification.java
│   │   │   │   └── TempIdCard.java
│   │   │   ├── repository/          # JPA Repositories
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── WorkingPermitRepository.java
│   │   │   │   ├── ApprovalRepository.java
│   │   │   │   ├── AccessLogRepository.java
│   │   │   │   ├── NotificationRepository.java
│   │   │   │   └── TempIdCardRepository.java
│   │   │   ├── service/             # Business Logic
│   │   │   │   ├── UserService.java
│   │   │   │   ├── WorkingPermitService.java
│   │   │   │   ├── ApprovalService.java
│   │   │   │   ├── QRCodeService.java
│   │   │   │   ├── OTPService.java
│   │   │   │   ├── NotificationService.java
│   │   │   │   ├── AccessControlService.java
│   │   │   │   └── TempIdCardService.java
│   │   │   ├── controller/          # REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── WorkingPermitController.java
│   │   │   │   ├── ApprovalController.java
│   │   │   │   ├── AccessControlController.java
│   │   │   │   └── DashboardController.java
│   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   ├── WorkingPermitRequest.java
│   │   │   │   ├── UserRegistrationRequest.java
│   │   │   │   ├── CheckInRequest.java
│   │   │   │   └── ApprovalRequest.java
│   │   │   ├── security/            # Security Configuration
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── JwtAuthenticationFilter.java
│   │   │   ├── exception/           # Exception Handling
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── WorkingPermitApplication.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── templates/           # Thymeleaf HTML Templates
│   │       │   ├── login.html
│   │       │   ├── register.html
│   │       │   ├── permit-form.html
│   │       │   ├── dashboard.html
│   │       │   ├── approval-list.html
│   │       │   └── checkin.html
│   │       └── static/              # CSS, JS, Images
│   │           ├── css/
│   │           ├── js/
│   │           └── images/
│   └── test/
│       └── java/
└── pom.xml
```

## 🚀 Cara Menjalankan

### Prerequisites

- Java 17 atau lebih tinggi
- Maven 3.6+ (atau gunakan Maven wrapper yang sudah included)
- (Optional) PostgreSQL untuk production

### 1. Clone atau Download Project

```bash
cd /Users/macbookairm3/Downloads/working-permit-dc/working-permit-springboot
```

### 2. Konfigurasi Environment Variables (Optional)

Buat file `.env` atau set di terminal:

```bash
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
export JWT_SECRET=your-super-secret-key
export TWILIO_ACCOUNT_SID=your-twilio-sid  # untuk SMS
export TWILIO_AUTH_TOKEN=your-twilio-token
export TWILIO_FROM_NUMBER=+1234567890
```

### 3. Build Project

```bash
mvn clean install
```

### 4. Jalankan Aplikasi

```bash
mvn spring-boot:run
```

Atau langsung dengan Java:

```bash
java -jar target/working-permit-1.0.0.jar
```

### 5. Akses Aplikasi

- **Web Application**: http://localhost:8080
- **H2 Database Console**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:workingpermitdb`
  - Username: `sa`
  - Password: (kosong)

## 📱 API Endpoints

### Authentication

```
POST   /api/auth/register          - Registrasi user baru
POST   /api/auth/login             - Login dan dapatkan JWT token
POST   /api/auth/logout            - Logout user
```

### Working Permit Management

```
POST   /api/permits                - Buat permohonan izin baru
GET    /api/permits                - List semua izin (sesuai role)
GET    /api/permits/{id}           - Detail izin tertentu
PUT    /api/permits/{id}           - Update izin
DELETE /api/permits/{id}           - Cancel izin
GET    /api/permits/me             - Izin milik user yang login
```

### Approval Workflow

```
GET    /api/approvals/pending      - List approval yang pending
POST   /api/approvals/{id}/review  - PIC review permohonan
POST   /api/approvals/{id}/approve - Manager approve/reject
```

### Access Control

```
POST   /api/access/checkin         - Check-in dengan QR Code + OTP
POST   /api/access/checkout        - Check-out visitor
POST   /api/access/verify-rfid     - Verifikasi RFID card untuk akses pintu
GET    /api/access/logs/{permitId} - Access log untuk permit tertentu
```

### QR Code & OTP

```
GET    /api/qrcode/{permitId}      - Generate/get QR Code image
POST   /api/otp/generate           - Generate OTP baru
POST   /api/otp/verify             - Verify OTP code
```

### Notifications

```
GET    /api/notifications          - List notifikasi user
PUT    /api/notifications/{id}/read - Tandai sudah dibaca
GET    /api/notifications/unread/count - Jumlah notifikasi belum dibaca
```

## 👥 User Roles

1. **VISITOR** - Pengunjung dari luar yang mengajukan izin
2. **PIC** - Person In Charge (karyawan internal yang menjadi pendamping)
3. **MANAGER** - Manajer/Approver yang memberikan approval akhir
4. **SECURITY** - Petugas keamanan yang verifikasi di lobby
5. **ADMIN** - Administrator sistem

## 🔐 Security Features

- JWT-based authentication
- Password encryption dengan BCrypt
- Role-based access control (RBAC)
- 2-Factor Authentication dengan OTP
- QR Code validation dengan timestamp expiry
- CORS protection
- CSRF protection

## 📧 Email & SMS Configuration

### Gmail SMTP (untuk Email)

1. Enable 2-Step Verification di akun Google
2. Generate App Password
3. Set environment variables:
   - `MAIL_USERNAME=your-email@gmail.com`
   - `MAIL_PASSWORD=your-app-password`

### Twilio (untuk SMS)

1. Daftar akun di https://www.twilio.com
2. Dapatkan Account SID, Auth Token, dan Phone Number
3. Set environment variables seperti di atas

## 🗄️ Database Configuration

### Development (H2 In-Memory)

Sudah dikonfigurasi di `application.yml`. Tidak perlu setup tambahan.

### Production (PostgreSQL)

1. Install PostgreSQL
2. Buat database:

```sql
CREATE DATABASE workingpermitdb;
```

3. Update `application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/workingpermitdb
    username: your_username
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

## 📊 Sample Data

Aplikasi akan otomatis membuat sample data saat pertama kali dijalankan (jika menggunakan profile `dev`).

### Default Users

```
Admin:
  Username: admin
  Password: admin123
  Role: ADMIN

Manager:
  Username: manager1
  Password: manager123
  Role: MANAGER

PIC:
  Username: pic1
  Password: pic123
  Role: PIC

Visitor:
  Username: visitor1
  Password: visitor123
  Role: VISITOR
```

## 🧪 Testing

Jalankan unit tests:

```bash
mvn test
```

Jalankan integration tests:

```bash
mvn verify
```

## 📈 Monitoring & Logging

Aplikasi menggunakan Spring Boot Actuator untuk monitoring.

Endpoint monitoring:

```
GET /actuator/health         - Health check
GET /actuator/metrics        - Metrics
GET /actuator/info           - Application info
```

## 🔧 Development Tips

### Hot Reload dengan Spring Boot DevTools

Tambahkan dependency (sudah included):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Debug Mode

```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

## 📝 TODO / Roadmap

- [ ] Implementasi biometric face recognition dengan OpenCV
- [ ] Integration dengan physical access control system
- [ ] Mobile app (Android/iOS) untuk visitor
- [ ] Real-time dashboard dengan WebSocket
- [ ] Export laporan ke PDF/Excel
- [ ] Multi-language support (Bahasa Indonesia & English)
- [ ] Integration dengan Active Directory/LDAP
- [ ] Batch processing untuk expired permits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@datacenter.com or create an issue in this repository.

---

**Dibuat dengan ❤️ untuk Data Center Working Permit Management**
