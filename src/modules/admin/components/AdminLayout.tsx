import React from 'react';
import { ShieldCheck, LogOut, Menu, X, Bell, User, Store, Users, Box, Settings, Sun, Moon, Tags } from 'lucide-react';
import { useTheme } from '@global/context/ThemeContext';

const navItems = [
  { id: 'overview', label: 'Platform Overview', icon: ShieldCheck },
  { id: 'retailers', label: 'Retailer Management', icon: Store },
  { id: 'users', label: 'Customer Directory', icon: Users },
  { id: 'catalog', label: 'Master Catalog', icon: Box },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'settings', label: 'Admin Settings', icon: Settings }
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  handleLogout: () => void;
  adminName: string;
}

export function AdminLayout({ children, activeTab, setActiveTab, handleLogout, adminName }: AdminLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const { theme, setTheme, isDark } = useTheme();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div 
      className="min-h-screen flex transition-colors selection:bg-emerald-500/30 relative text-slate-800 dark:text-slate-100"
      style={{ 
        backgroundImage: isDark 
          ? `linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.98)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`
          : `linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-[#1E293B]/70 backdrop-blur-2xl border-r border-white/50 dark:border-slate-700/50 fixed h-full z-40 transition-colors">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-850 dark:text-white tracking-tight">GroMart<span className="text-emerald-500"> Admin</span></h2>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Superuser Access</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-full transition-all cursor-pointer ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : ''} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all font-bold cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen relative w-full">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-2xl border-b border-white/50 dark:border-slate-700/50 px-4 sm:px-8 py-4 z-30 flex justify-between items-center transition-colors">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-white tracking-tight hidden sm:block">
              {navItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer relative"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white mb-3">System Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">New Retailer Sign-up</p>
                        <p className="text-[10px] text-slate-500">FreshMart requested approval.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-700/50">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">{adminName || 'Admin'}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Ops</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black border border-emerald-200/50 dark:border-emerald-800/30">
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 sm:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 h-full bg-white dark:bg-[#111724] flex flex-col shadow-2xl animate-fade-in">
            <div className="p-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                  <ShieldCheck size={18} />
                </div>
                <h2 className="text-base font-black text-slate-850 dark:text-white">GroMart<span className="text-emerald-500"> Admin</span></h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-full transition-all cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all font-bold cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
