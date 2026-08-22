import React from 'react';
import { NavLink } from 'react-router';
import { ShieldCheck, BarChart2, Store, Users, Box, Settings, List, PackageCheck } from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'retailer';
}

export const SidebarNavigation: React.FC<SidebarProps> = ({ role }) => {
  const adminLinks = [
    { to: '/admin', icon: <BarChart2 size={22} />, label: 'Analytics' },
    { to: '/admin/retailers', icon: <Store size={22} />, label: 'Retailers' },
    { to: '/admin/users', icon: <Users size={22} />, label: 'Users' },
    { to: '/admin/catalog', icon: <Box size={22} />, label: 'Catalog' },
  ];

  const retailerLinks = [
    { to: '/retailer', icon: <BarChart2 size={22} />, label: 'Dashboard' },
    { to: '/retailer/orders', icon: <List size={22} />, label: 'Orders' },
    { to: '/retailer/inventory', icon: <PackageCheck size={22} />, label: 'Inventory' },
  ];

  const links = role === 'admin' ? adminLinks : retailerLinks;
  const bgColor = role === 'admin' ? 'bg-blue-600 border-blue-700' : 'bg-blue-600 border-blue-700'; // Could be different for retailer

  return (
    <aside className={`hidden md:flex flex-col w-20 ${bgColor} border-r z-30 py-6 items-center shadow-lg transition-colors duration-300`}>
      <div className="bg-white p-2 rounded-xl text-blue-600 mb-8 shadow-sm">
        <ShieldCheck size={24} />
      </div>
      <nav className="flex-1 flex flex-col gap-6 items-center w-full">
        {links.map((link) => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            end={link.to === '/admin' || link.to === '/retailer'}
            className={({ isActive }) => `relative p-3 rounded-xl cursor-pointer transition-all group ${isActive ? 'text-white bg-blue-700/50 scale-110' : 'text-blue-200 hover:text-white hover:bg-blue-700/50'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-400 rounded-r-full"></div>}
                {link.icon}
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md z-50 transition-opacity">
                  {link.label}
                </div>
              </>
            )}
          </NavLink>
        ))}
        <div className="mt-auto relative p-3 rounded-xl cursor-pointer transition-all group text-blue-200 hover:text-white hover:bg-blue-700/50">
          <Settings size={22} />
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md z-50 transition-opacity">
            Settings
          </div>
        </div>
      </nav>
    </aside>
  );
};
