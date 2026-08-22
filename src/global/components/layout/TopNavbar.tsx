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
    // Redirect to the default page for the role
    if (newRole === 'admin') navigate('/admin');
    if (newRole === 'retailer') navigate('/retailer');
    if (newRole === 'customer') navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-4 py-3 md:px-8 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Logo Area */}
        <div className="font-black text-xl text-blue-600 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Store size={20} /></div>
          GroCart
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Switcher Pill */}
        <div className="flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
          <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wide hidden sm:inline">Persona:</span>
          <select 
            value={activeRole} 
            onChange={handleRoleChange}
            className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer appearance-none pr-6 relative z-10"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
          >
            <option value="customer">Customer View</option>
            <option value="retailer">Retailer View</option>
            <option value="admin">Admin View</option>
          </select>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
            {userProfile.name.charAt(0)}
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-bold text-slate-800">{userProfile.name}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{userProfile.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
