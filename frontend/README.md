# Working Permit Frontend (React)

A React single-page app for the Data Center Working Permit System backend.

## Features

- Authentication: login, register (JWT with refresh)
- Role-based navigation (VISITOR, PIC, MANAGER, SECURITY, ADMIN)
- Permits:
  - VISITOR: create and view own permits
  - PIC/MANAGER/ADMIN: view permits; PIC/MANAGER approve via Approvals page
  - Permit detail: QR code display, OTP, actions (activate, cancel, regenerate OTP)
- Approvals: PIC review, Manager approval
- Access Control: verify QR+OTP, check-in/check-out, view logs (SECURITY/ADMIN)
- Notifications: list, mark as read, mark all
- Users: list users (ADMIN)

## Prerequisites

- Node.js 18+ and npm
- Backend running locally on http://localhost:8080 (default). Adjust with VITE_API_BASE_URL.

## Setup

$ cd frontend
$ npm install
$ npm run dev

Open the app at the URL shown (default http://localhost:5173).

## Configuration

- .env contains VITE_API_BASE_URL (defaults to http://localhost:8080).
- JWT tokens are stored in localStorage and attached to requests automatically. 401 responses trigger refresh.

## Folder Structure

- src/api/client.js — Axios instance with auth & refresh interceptors
- src/state/AuthContext.jsx — Auth state provider
- src/components/ProtectedRoute.jsx — Guarded routes, optional roles
- src/components/Navbar.jsx — Top navigation (role-aware)
- src/pages/* — App pages

## Notes

- Date/time fields use <input type="datetime-local"> and are sent as local YYYY-MM-DDTHH:mm strings.
- QR Code shown on Permit Detail is generated client-side from qrCodeData using qrcode.react.
- Some admin-only actions are hidden based on user.role.