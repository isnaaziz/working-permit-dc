import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Provider
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/auth';

// Landing Pages
import { Home, About, Services, Contact } from './pages/landing';

// Auth Pages
import { Login, Register } from './pages/auth';

// Dashboard
import DashboardLayout from './components/dashboard/DashboardLayout';
import { Dashboard } from './pages/dashboard';

// Permits
import { PermitList, PermitForm, PermitDetail } from './pages/permits';

// Approvals
import { ApprovalList } from './pages/approvals';

// Access
import { AccessControl, AccessLogs } from './pages/access';

// Mutasi Barang
import MutasiBarangPage from './pages/mutasi';
import MutasiBarangList from './pages/mutasi/MutasiBarangList.jsx';
import MutasiBarangEdit from './pages/mutasi/MutasiBarangEdit.jsx';
import MutasiBarangPDF from './pages/mutasi/MutasiBarangPDF.jsx';

// Placeholder for pages under construction
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-6">
      <i className="ri-tools-line text-4xl text-primary-600"></i>
    </div>
    <h2 className="text-2xl font-bold text-dark-600 mb-2">{title}</h2>
    <p className="text-gray-500">This module is under construction.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes - Landing */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Permits - All authenticated users can view, visitors can create */}
            <Route path="permits" element={<PermitList />} />
            <Route path="permits/new" element={<PermitForm />} />
            <Route path="permits/:id" element={<PermitDetail />} />

            {/* Mutasi Barang - All authenticated users */}
            <Route path="mutasi-barang" element={<MutasiBarangPage />} />
            <Route path="mutasi-barang/list" element={<MutasiBarangList />} />
            <Route path="mutasi-barang/:id" element={<MutasiBarangEdit />} />
            <Route path="mutasi-barang/:id/pdf" element={<MutasiBarangPDF />} />
            
            {/* Approvals - Only PIC, Manager, and Admin */}
            <Route
              path="approvals"
              element={
                <PrivateRoute allowedRoles={['PIC', 'MANAGER', 'ADMIN']}>
                  <ApprovalList />
                </PrivateRoute>
              }
            />
            <Route path="approvals/history" element={<PlaceholderPage title="Approval History" />} />
            
            {/* Access Control - Only Security and Admin */}
            <Route
              path="access"
              element={
                <PrivateRoute allowedRoles={['SECURITY', 'ADMIN']}>
                  <AccessControl />
                </PrivateRoute>
              }
            />
            <Route
              path="logs"
              element={
                <PrivateRoute allowedRoles={['SECURITY', 'ADMIN', 'MANAGER']}>
                  <AccessLogs />
                </PrivateRoute>
              }
            />
            
            {/* Settings */}
            <Route path="profile" element={<PlaceholderPage title="Profile Settings" />} />
            <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
          </Route>

          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
