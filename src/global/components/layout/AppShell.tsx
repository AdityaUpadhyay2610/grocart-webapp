import React from 'react';
import { TopNavbar } from './TopNavbar';
import { SidebarNavigation } from './SidebarNavigation';
import { useAuthRole } from '@global/context/AuthContext';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeRole } = useAuthRole();
  const isCustomer = activeRole === 'customer';

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans overflow-hidden text-slate-900 transition-all duration-300">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Only show sidebar for Admin and Retailer */}
        {!isCustomer && <SidebarNavigation role={activeRole} />}
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};
