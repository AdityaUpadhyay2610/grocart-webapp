import React from 'react';
import { Store, LogOut, Menu, X, Bell, PackageSearch, TrendingUp, PackageCheck, AlertCircle, Sun, Moon, Settings } from 'lucide-react';
import { useTheme } from '@global/context/ThemeContext';

const navItems = [
  { id: 'dashboard', label: 'Overview', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory Manager', icon: PackageSearch },
  { id: 'orders', label: 'Active Orders', icon: PackageCheck },
  { id: 'analytics', label: 'Sales Reports', icon: AlertCircle },
  { id: 'settings', label: 'Store Settings', icon: Settings }
];

interface RetailerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  handleLogout: () => void;
  storeName: string;
}

export function RetailerLayout({ children, activeTab, setActiveTab, handleLogout, storeName }: RetailerLayoutProps) {
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
      className="flex h-screen text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors selection:bg-emerald-500/30"
      style={{
        backgroundImage: isDark 
          ? `linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`
          : `linear-gradient(to bottom right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-r border-white/50 dark:border-slate-700/50 fixed h-full z-40 transition-colors shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Store size={22} />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-tight">Partner<span className="text-emerald-500">Hub</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{storeName}</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer font-bold ${
                activeTab === item.id || activeTab === 'all'
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id || activeTab === 'all' ? 'text-emerald-500 dark:text-emerald-400' : ''} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors font-bold cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-white/50 dark:border-slate-700/50 px-4 sm:px-8 py-3 z-30 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors -ml-2"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                {activeTab === 'all' ? 'Overview' : navItems.find(i => i.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
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
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white mb-3">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">New Order #1042</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Just now - Pending confirmation</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 h-full bg-white dark:bg-slate-800 flex flex-col shadow-2xl animate-fade-in-right">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white shrink-0">
                  <Store size={16} />
                </div>
                <h2 className="text-base font-black text-slate-800">Partner<span className="text-emerald-500">Hub</span></h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all cursor-pointer font-bold ${
                    activeTab === item.id || activeTab === 'all'
                      ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id || activeTab === 'all' ? 'text-emerald-500' : ''} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold cursor-pointer"
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
