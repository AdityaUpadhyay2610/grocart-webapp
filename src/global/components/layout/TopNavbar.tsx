import React from 'react';
import { useAuthRole } from '@global/context/AuthContext';
import { ShieldCheck, Store, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export const TopNavbar: React.FC = () => {
  const { activeRole, setActiveRole, userProfile } = useAuthRole();
  const navigate = useNavigate();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as 'admin' | 'retailer' | 'customer';
    setActiveRole(newRole);
    if (newRole === 'admin') navigate('/admin');
    if (newRole === 'retailer') navigate('/retailer');
    if (newRole === 'customer') navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-emerald-900/10 dark:border-[#262626] px-4 py-3 md:px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex items-center justify-between transition-colors">
      <div className="flex items-center gap-4">
        {/* Logo Area */}
        <div className="font-extrabold text-xl text-primary flex items-center gap-2.5 cursor-pointer select-none" onClick={() => navigate('/')}>
          <img 
            src="/log.jpg" 
            alt="GroCart Logo" 
            className="w-10 h-10 rounded-xl object-cover shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform" 
          />
          <span className="text-2xl font-bold tracking-tight text-primary">GroCart</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-surface-container-low dark:bg-[#171717] rounded-full px-3.5 py-1.5 border border-surface-variant/50 dark:border-[#262626] shadow-inner">
          <span className="text-[11px] font-bold text-slate-text mr-2 uppercase tracking-wider hidden sm:inline">Role View:</span>
          <select 
            value={activeRole} 
            onChange={handleRoleChange}
            aria-label="Select role view"
            className="bg-transparent text-xs font-bold text-on-surface outline-none cursor-pointer pr-4 appearance-none dark:bg-[#171717] dark:text-white"
          >
            <option value="customer" className="dark:bg-[#171717] dark:text-white">Customer View</option>
            <option value="retailer" className="dark:bg-[#171717] dark:text-white">Retailer Dashboard</option>
            <option value="admin" className="dark:bg-[#171717] dark:text-white">Admin Portal</option>
          </select>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-3 border-l border-surface-variant/40 dark:border-[#262626]">
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
            {userProfile?.name?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block leading-tight text-left">
            <div className="text-xs font-bold text-on-surface dark:text-white">{userProfile?.name || 'User'}</div>
            <div className="text-[9px] font-bold text-slate-text uppercase tracking-wider">{userProfile?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
