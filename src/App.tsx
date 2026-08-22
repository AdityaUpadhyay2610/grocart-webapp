import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setUserProfile, clearSession } from '@global/store';
import { RoleGuard } from '@global/routes/ProtectedRoute';
import LoginPage from './modules/customer/pages/LoginPage';
import RetailerDashboard from './modules/retailer/pages/RetailerOperationsPage';
import AdminDashboard from './modules/admin/pages/AdminDashboardPage';
import StorefrontApp from './StorefrontApp.jsx';
import { onAuthStateChange } from '@global/services/firebaseAuth';
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
  const { isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await authApi.fetchUserProfile(firebaseUser.uid);
          dispatch(setUserProfile(profile));
        } catch (error) {
          console.error("Error fetching user profile", error);
          dispatch(clearSession());
        }
      } else {
        dispatch(clearSession());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  // Optionally wait for initial auth loading
  // if (isLoading) {
  //  return <div className="flex h-screen items-center justify-center">Loading...</div>;
  // }

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
