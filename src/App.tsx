import React, { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setUserProfile, clearSession } from '@global/store';
import { RoleGuard } from '@global/routes/ProtectedRoute';
import { store as legacyStore } from '@global/store/legacyStore';
import { setUserState } from '@global/store/legacyAuthSlice';
import LoginPage from './modules/customer/pages/LoginPage';
import RetailerDashboard from './modules/retailer/pages/RetailerOperationsPage';
import AdminDashboard from './modules/admin/pages/AdminDashboardPage';
import StorefrontApp from './StorefrontApp.jsx';
import { authApi } from '@global/services/api/authApi';

const StorefrontGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'retailer') return <Navigate to="/retailer/dashboard" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [sessionRestored, setSessionRestored] = useState(false);
  const didRestoreSession = useRef(false);

  useEffect(() => {
    legacyStore.dispatch(setUserState(user ? {
      id: user.uid,
      username: user.name,
      email: user.email,
      role: user.role
    } : null));
  }, [user]);

  useEffect(() => {
    if (didRestoreSession.current) return;
    didRestoreSession.current = true;

    // On mount, attempt to restore session via the httpOnly refresh-token cookie.
    // Restores user session without requiring external SDK subscriptions.
    authApi.restoreSession()
      .then((profile) => {
        if (profile) {
          dispatch(setUserProfile(profile));
        } else {
          dispatch(clearSession());
        }
      })
      .catch(() => {
        // Keep the persisted profile when refresh fails temporarily (for example, 429).
      })
      .finally(() => {
        setSessionRestored(true);
      });
  }, [dispatch]);

  if (!sessionRestored) {
    return <div className="flex h-screen items-center justify-center font-medium text-gray-600">Restoring session...</div>;
  }

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

      {/* 4. Public & Customer Routes (Original UI) */}
      <Route path="/*" element={
        <StorefrontGuard>
          <StorefrontApp />
        </StorefrontGuard>
      } />
    </Routes>
  );
}
