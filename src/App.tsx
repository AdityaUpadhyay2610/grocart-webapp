import React from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from './application/store';
import { RoleGuard } from './presentation/components/RoleGuard';
import LoginPage from './presentation/pages/LoginPage';
import RetailerDashboard from './presentation/pages/RetailerDashboard';
import AdminDashboard from './presentation/pages/AdminDashboard';
import StorefrontApp from './StorefrontApp.jsx';

const StorefrontGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'retailer') return <Navigate to="/retailer/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      {/* 1. Public Multi-Role Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Retailer Protected Routes */}
      <Route element={<RoleGuard allowedRoles={['retailer']} />}>
        <Route path="/retailer/dashboard" element={<RetailerDashboard />} />
      </Route>

      {/* 3. Admin Protected Routes */}
      <Route element={<RoleGuard allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* 1. Public & Customer Routes (Original UI) */}
      <Route path="/*" element={
        <StorefrontGuard>
          <StorefrontApp />
        </StorefrontGuard>
      } />
    </Routes>
  );
}
