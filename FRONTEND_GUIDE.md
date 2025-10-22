# 📱 Frontend User Guide - Data Center Working Permit System

## 🚀 Cara Running Frontend

### **Metode 1: Akses Langsung via Browser (Recommended)**

Frontend sudah terintegrasi dengan backend Spring Boot. Cukup:

1. **Jalankan Backend:**

   ```bash
   cd /Users/macbookairm3/Downloads/working-permit-dc/working-permit-springboot
   java -jar target/working-permit-1.0.0.jar
   ```

2. **Buka Browser:**
   - **Homepage**: http://localhost:8080/
   - **Login**: http://localhost:8080/login.html
   - **Register**: http://localhost:8080/register.html
   - **Dashboard**: http://localhost:8080/dashboard.html

### **Metode 2: Background Process**

```bash
# Jalankan di background
nohup java -jar target/working-permit-1.0.0.jar > /tmp/app.log 2>&1 &

# Check status
tail -f /tmp/app.log

# Stop aplikasi
lsof -ti:8080 | xargs kill -9
```

---

## 📄 Halaman-Halaman Frontend

### **1. Landing Page** (`/` atau `/index.html`)

- **URL**: http://localhost:8080/
- **Fitur**:
  - Overview sistem
  - Deskripsi 3 fase workflow
  - Features showcase
  - Quick access ke Login/Register
  - Auto-redirect jika sudah login

### **2. Login Page** (`/login.html`)

- **URL**: http://localhost:8080/login.html
- **Fitur**:
  - Login form (username + password)
  - Quick-fill buttons untuk test accounts:
    - **Visitor**: `visitor1` / `password123`
    - **PIC**: `pic1` / `password123`
    - **Manager**: `manager1` / `password123`
    - **Security**: `security1` / `password123`
  - Remember me option
  - Link ke Register page
  - Error handling dengan alert messages

**Cara Login:**

```javascript
1. Masukkan username & password
   ATAU
   Klik salah satu quick-fill button

2. Klik "Login"

3. Jika sukses → redirect ke Dashboard
   Jika gagal → muncul error message
```

### **3. Registration Page** (`/register.html`)

- **URL**: http://localhost:8080/register.html
- **Fitur**:
  - Complete registration form
  - Real-time username/email availability check
  - Password confirmation validation
  - Role selection dropdown
  - Field validations:
    - Username: min 3 characters, unique
    - Email: valid format, unique
    - Password: min 6 characters
    - Phone: valid format
    - Required fields validation

**Cara Register:**

```javascript
1. Isi semua field yang required (*)
2. System akan auto-check:
   ✓ Username availability (saat blur)
   ✓ Email availability (saat blur)
   ✓ Password match
3. Pilih Role (VISITOR, PIC, MANAGER, etc)
4. Klik "Register"
5. Sukses → redirect ke Login
```

### **4. Dashboard** (`/dashboard.html`)

- **URL**: http://localhost:8080/dashboard.html
- **Fitur**:
  - User info display (nama, role, email)
  - Statistics cards:
    - Total Permits
    - Pending Permits
    - Approved Permits
    - Active Permits
  - Recent permits table dengan:
    - Permit Number
    - Purpose
    - Status badge
    - Scheduled time
    - View detail link
  - Role-based menu
  - Logout function
  - Auto-fetch data on load

**Dashboard Sections:**

```
┌─────────────────────────────────────┐
│ Navbar (User info, Role, Logout)   │
├─────────────────────────────────────┤
│ Statistics Cards (4 metrics)       │
├─────────────────────────────────────┤
│ Recent Permits Table                │
│ - Sortable columns                  │
│ - Status badges (colored)           │
│ - Action links                      │
└─────────────────────────────────────┘
```

---

## 🎨 Styling & Components

### **CSS Framework** (`/static/css/style.css`)

**Available Components:**

1. **Buttons**

   ```html
   <button class="btn btn-primary">Primary</button>
   <button class="btn btn-secondary">Secondary</button>
   <button class="btn btn-success">Success</button>
   <button class="btn btn-danger">Danger</button>
   ```

2. **Cards**

   ```html
   <div class="card">
     <div class="card-header">Header</div>
     <div class="card-body">Content</div>
   </div>
   ```

3. **Forms**

   ```html
   <div class="form-group">
     <label>Label</label>
     <input type="text" class="form-control" />
   </div>
   ```

4. **Tables**

   ```html
   <table class="table">
     <thead>
       ...
     </thead>
     <tbody>
       ...
     </tbody>
   </table>
   ```

5. **Badges**

   ```html
   <span class="badge badge-success">Approved</span>
   <span class="badge badge-warning">Pending</span>
   <span class="badge badge-danger">Rejected</span>
   ```

6. **Alerts**
   ```html
   <div class="alert alert-success">Success message</div>
   <div class="alert alert-danger">Error message</div>
   ```

---

## 🔧 JavaScript API Utilities (`/static/js/api.js`)

### **Available Functions:**

#### **1. Auth Module**

```javascript
// Login
Auth.login(username, password)
  .then((user) => console.log("Logged in:", user))
  .catch((err) => console.error("Login failed:", err));

// Register
Auth.register(userData)
  .then((result) => console.log("Registered:", result))
  .catch((err) => console.error("Registration failed:", err));

// Logout
Auth.logout();

// Check if logged in
const isLoggedIn = Auth.isLoggedIn();

// Get current user
const user = Auth.getCurrentUser();
```

#### **2. Permits Module**

```javascript
// Create permit
Permits.create(permitData).then((permit) => console.log("Created:", permit));

// Get all permits
Permits.getAll().then((permits) => console.log("All permits:", permits));

// Get by ID
Permits.getById(permitId).then((permit) => console.log("Permit:", permit));

// Get by visitor
Permits.getByVisitor(visitorId).then((permits) =>
  console.log("Visitor permits:", permits)
);

// Update permit
Permits.update(permitId, updateData).then((result) =>
  console.log("Updated:", result)
);

// Cancel permit
Permits.cancel(permitId, reason).then((result) =>
  console.log("Cancelled:", result)
);

// Regenerate OTP
Permits.regenerateOTP(permitId).then((result) =>
  console.log("New OTP:", result.otp)
);
```

#### **3. Approvals Module**

```javascript
// PIC Review
Approvals.picReview(approvalData).then((result) =>
  console.log("PIC review:", result)
);

// Manager Approval
Approvals.managerApprove(approvalData).then((result) =>
  console.log("Manager approval:", result)
);

// Get pending for PIC
Approvals.getPendingForPIC(picId).then((approvals) =>
  console.log("Pending:", approvals)
);

// Get pending for Manager
Approvals.getPendingForManager(managerId).then((approvals) =>
  console.log("Pending:", approvals)
);
```

#### **4. Access Module**

```javascript
// Verify access
Access.verify(qrCode, otp).then((result) =>
  console.log("Access granted:", result)
);

// Check-in
Access.checkIn(checkInData).then((result) =>
  console.log("Checked in:", result)
);

// Check-out
Access.checkOut(permitId, location).then((result) =>
  console.log("Checked out:", result)
);

// Get access logs
Access.getLogs(permitId).then((logs) => console.log("Access logs:", logs));
```

#### **5. Notifications Module**

```javascript
// Get all notifications
Notifications.getAll(userId).then((notifications) =>
  console.log("All:", notifications)
);

// Get unread
Notifications.getUnread(userId).then((notifications) =>
  console.log("Unread:", notifications)
);

// Mark as read
Notifications.markAsRead(notificationId).then((result) =>
  console.log("Marked as read:", result)
);
```

#### **6. Users Module**

```javascript
// Get by ID
Users.getById(userId).then((user) => console.log("User:", user));

// Get by role
Users.getByRole(role).then((users) => console.log("Users:", users));

// Update profile
Users.updateProfile(userId, updateData).then((result) =>
  console.log("Updated:", result)
);
```

---

## 🧪 Testing Frontend

### **Manual Testing Checklist:**

#### **1. Registration Flow**

```
☐ Buka /register.html
☐ Isi form dengan data valid
☐ Test username availability check
☐ Test email availability check
☐ Test password confirmation
☐ Submit form
☐ Verify redirect ke login page
```

#### **2. Login Flow**

```
☐ Buka /login.html
☐ Test dengan quick-fill buttons
☐ Test dengan manual input
☐ Test wrong credentials
☐ Verify redirect ke dashboard
☐ Check localStorage untuk token
```

#### **3. Dashboard**

```
☐ Verify user info displayed correctly
☐ Check statistics cards
☐ Verify permits table loads
☐ Test status badges colors
☐ Test logout button
```

### **Browser Console Testing:**

```javascript
// Test API calls
API.get("/api/users/1").then(console.log).catch(console.error);

// Test Auth
Auth.login("visitor1", "password123").then((user) => {
  console.log("Logged in:", user);
  console.log("Token:", localStorage.getItem("token"));
});

// Test Permits
Permits.getAll().then((permits) => console.table(permits));

// Check current user
console.log("Current user:", Auth.getCurrentUser());
```

---

## 🎯 Quick Start Guide

### **Scenario 1: Visitor Membuat Working Permit**

```javascript
1. Register sebagai VISITOR
   → /register.html
   → Isi data lengkap
   → Role: VISITOR

2. Login
   → /login.html
   → Username: [yang dibuat]
   → Password: [yang dibuat]

3. Create Permit (via API atau UI)
   → Isi purpose, visit type, schedule
   → Pilih PIC
   → Submit

4. Wait for approval
   → PIC review
   → Manager approval

5. Receive QR & OTP
   → Check notifications
   → Download QR code
   → Note OTP code

6. Check-in at gate
   → Show QR + OTP
   → Receive temp ID card
```

### **Scenario 2: PIC Review Permit**

```javascript
1. Login sebagai PIC
   → Quick-fill: pic1 / password123

2. Go to Approvals page
   → View pending permits

3. Review permit
   → Check details
   → Approve or Reject
   → Add comments

4. Submit decision
   → If approved → forward to Manager
   → If rejected → notify visitor
```

### **Scenario 3: Security Check-in Visitor**

```javascript
1. Login sebagai SECURITY
   → Quick-fill: security1 / password123

2. Scan QR Code
   → Get QR data from visitor

3. Verify OTP
   → Ask visitor for OTP
   → Enter both QR + OTP

4. Issue Temp ID Card
   → System generates RFID card
   → Hand card to visitor

5. Grant access
   → Visitor can enter DC
```

---

## 🔐 Security Features

1. **CSRF Protection**

   - Enabled by default
   - Token validation on POST/PUT/DELETE

2. **CORS Configuration**

   - Configured for local development
   - Adjust for production

3. **Authentication**

   - Token-based (localStorage)
   - Auto-redirect if not logged in
   - Token expiry handling

4. **Authorization**
   - Role-based access control
   - Menu visibility based on role
   - API endpoint protection

---

## 🎨 Customization

### **Mengubah Colors:**

Edit `/static/css/style.css`:

```css
:root {
  --primary-color: #3498db; /* Biru */
  --secondary-color: #2ecc71; /* Hijau */
  --danger-color: #e74c3c; /* Merah */
  --warning-color: #f39c12; /* Kuning */
  /* Ubah sesuai brand colors */
}
```

### **Menambah Pages Baru:**

1. Copy template dari existing page
2. Update navigation links
3. Add route di SecurityConfig jika perlu
4. Create corresponding API endpoints

### **Menambah Features:**

1. Tambahkan function di `/static/js/api.js`
2. Create UI components di HTML
3. Wire up event listeners
4. Test API integration

---

## 📱 Responsive Design

Frontend sudah responsive untuk:

- ✅ Desktop (>1200px)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (< 768px)

Test di berbagai device sizes via Browser DevTools.

---

## 🐛 Troubleshooting

### **Problem: "Access to localhost was denied" atau HTTP 403 Forbidden**

```
Cause: Spring Security memblokir akses ke static resources

Solution:
1. Cek SecurityConfig.java sudah mengizinkan static resources:
   - "/", "/index.html", "/login.html", "/register.html"
   - "/static/**", "/css/**", "/js/**"

2. Rebuild aplikasi:
   cd /Users/macbookairm3/Downloads/working-permit-dc/working-permit-springboot
   mvn clean package -DskipTests

3. Restart aplikasi:
   lsof -ti:8080 | xargs kill -9
   java -jar target/working-permit-1.0.0.jar

4. Test akses:
   curl -I http://localhost:8080/login.html
   # Should return: HTTP/1.1 200
```

### **Problem: Page tidak load**

```
Solution:
1. Check backend status: curl http://localhost:8080/
2. Check browser console for errors
3. Clear cache & reload (Cmd+Shift+R)
```

### **Problem: API calls failed**

```
Solution:
1. Check network tab di DevTools
2. Verify backend running on correct port
3. Check CORS configuration
4. Verify token in localStorage
```

### **Problem: Styles tidak apply**

```
Solution:
1. Hard reload: Cmd+Shift+R
2. Check CSS file path
3. Verify CSS loaded in Network tab
4. Check browser console for 404 errors
```

### **Problem: Login tidak redirect**

```
Solution:
1. Check browser console for errors
2. Verify API response in Network tab
3. Check localStorage for token
4. Verify Auth.isLoggedIn() returns true
```

---

## 📚 Resources

- **Backend API Docs**: http://localhost:8080/h2-console
- **Project Status**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)

---

## 🎉 Happy Coding!

Aplikasi sudah siap digunakan. Akses:

- 🏠 **Homepage**: http://localhost:8080/
- 🔐 **Login**: http://localhost:8080/login.html
- 📝 **Register**: http://localhost:8080/register.html
- 📊 **Dashboard**: http://localhost:8080/dashboard.html

Untuk pertanyaan atau issue, check console logs atau hubungi developer.
