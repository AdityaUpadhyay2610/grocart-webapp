import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../application/store';
import { UserRole } from '../../domain/models';

export const RoleGuard: React.FC<{ allowedRoles: UserRole[] }> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center font-medium text-gray-600">Verifying session permissions...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
