/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'admin' | 'retailer' | 'customer';

interface AuthContextType {
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load role from localStorage, default to customer
  const [activeRole, setActiveRole] = useState<Role>(() => {
    return (localStorage.getItem('activeRole') as Role) || 'customer';
  });

  // Mock user profile based on active role
  const userProfile = {
    name: activeRole === 'admin' ? 'Super Admin' : activeRole === 'retailer' ? 'Green Ray Store' : 'John Doe',
    email: `${activeRole}@example.com`,
    role: activeRole
  };

  useEffect(() => {
    localStorage.setItem('activeRole', activeRole);
  }, [activeRole]);

  return (
    <AuthContext.Provider value={{ activeRole, setActiveRole, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthRole must be used within an AuthProvider');
  }
  return context;
};
