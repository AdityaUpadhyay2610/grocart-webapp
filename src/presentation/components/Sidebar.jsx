import React, { useMemo } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router";
import { Home, LayoutGrid, ShoppingCart, ShoppingBag, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../application/context/AuthContext";
import { useCart } from "../../application/context/CartContext";

export const Sidebar = React.memo(({ onRequestLogin, onLogoutClick, isDarkTheme, onThemeToggle }) => {
  const { isGuestSession, user } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const currentPath = location.pathname;

  const menuItems = useMemo(() => [
    { path: "/home", label: "Home", icon: Home, number: "01" },
    { path: "/categories", label: "Categories", icon: LayoutGrid, number: "02" },
    { path: "/cart", label: "Cart", icon: ShoppingCart, badge: true, number: "03" },
    { path: "/orders", label: "My Orders", icon: ShoppingBag, authRequired: true, number: "04" },
    { path: "/profile", label: "Profile", icon: User, authRequired: true, number: "05" }
  ], []);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const isSelected = (itemPath) => {
    if (itemPath === "/home") {
      return currentPath === "/home" || currentPath === "/";
    }
    if (itemPath === "/categories") {
      return currentPath.startsWith("/categories");
    }
    return currentPath === itemPath;
  };

  const handleItemClick = (item) => {
    if (isGuestSession && item.authRequired) {
      onRequestLogin();
    } else {
      navigate(item.path);
    }
  };

  const activeIndex = useMemo(() => {
    const idx = menuItems.findIndex(item => isSelected(item.path));
    return idx >= 0 ? idx : 0;
  }, [currentPath, menuItems]);

  return (
    <>
      {/* ── Desktop / Tablet Sidebar (Left side, visible on md and up) ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#fbf8f3] dark:bg-[#171512] text-amber-955 dark:text-slate-200 border-r border-amber-900/10 dark:border-slate-800/50 h-screen fixed top-0 left-0 z-30 justify-between select-none shadow-[4px_0_24px_rgba(44,37,25,0.06)] transition-colors duration-300">
        <div className="flex flex-col">
          {/* Brand Header */}
          <div className="flex items-center space-x-3 px-6 py-6 border-b border-amber-900/10 dark:border-slate-800/60">
            <div className="w-10 h-10 bg-amber-600 dark:bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-amber-600/25">
              <ShoppingCart size={20} className="animate-float" />
            </div>
            <span className="text-xl font-black text-amber-900 dark:text-amber-550 tracking-tight">GroCart</span>
          </div>

          {/* User Profile Info Card */}
          {user && (
            <div className="mx-4 my-4 p-4 bg-[#f5eedc] dark:bg-[#1e1b15] border border-amber-900/10 dark:border-slate-800/60 rounded-2xl flex items-center space-x-3 text-left">
              <div className="w-10 h-10 rounded-full bg-[#e6dec9] dark:bg-[#2e2a20] flex items-center justify-center text-amber-700 dark:text-amber-400 font-extrabold uppercase">
                {user.username.substring(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-amber-950 dark:text-slate-250 truncate">{user.username}</p>
                <p className="text-[10px] text-amber-800/60 dark:text-slate-450 font-semibold truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="mt-2 flex flex-col text-left">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isSelected(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item)}
                  className={`w-full relative flex items-center justify-between px-6 py-3.5 text-sm font-bold transition-all border-b border-amber-900/5 dark:border-slate-800/30 text-left cursor-pointer group ${
                    active
                      ? "text-amber-600 dark:text-amber-450 bg-amber-500/[0.03] dark:bg-amber-400/[0.02]"
                      : "text-amber-900/60 dark:text-slate-450 hover:text-amber-955 dark:hover:text-slate-200 hover:bg-amber-500/[0.01] dark:hover:bg-slate-800/10"
                  }`}
                >
                  {/* Left active accent vertical bar */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-600 dark:bg-amber-450" />
                  )}
                  
                  <div className="flex items-center space-x-3.5">
                    <Icon 
                      size={18} 
                      className={`transition-colors ${
                        active ? "text-amber-600 dark:text-amber-455" : "text-amber-900/40 dark:text-slate-500 group-hover:text-amber-800 dark:group-hover:text-slate-350"
                      }`}
                    />
                    <span className="font-extrabold tracking-tight">{item.label}</span>
                    
                    {/* Cart count badge */}
                    {item.badge && cartCount > 0 && (
                      <span className={`ml-2 min-w-4.5 h-4.5 text-[9px] font-black rounded-full flex items-center justify-center px-1.5 ${
                        active ? "bg-amber-600 text-white" : "bg-red-500 text-white"
                      }`}>
                        {cartCount}
                      </span>
                    )}
                  </div>

                  {/* Aesthetic Serial Number */}
                  <span className={`text-[10px] font-bold font-mono tracking-wider ${
                    active ? "text-amber-600 dark:text-amber-455" : "text-amber-900/30 dark:text-slate-600"
                  }`}>
                    {item.number}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Options inside Sidebar */}
        <div className="p-4 border-t border-amber-900/10 dark:border-slate-800/60 space-y-2">
          {/* Theme toggler */}
          <button
            onClick={onThemeToggle}
            className="w-full flex items-center justify-between px-4 py-3 text-amber-900/60 dark:text-slate-450 hover:bg-amber-500/[0.03] dark:hover:bg-slate-800/20 hover:text-amber-950 dark:hover:text-slate-200 rounded-2xl text-sm font-bold transition-all cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              {isDarkTheme ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
              <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
            </div>
          </button>

          {/* Logout button */}
          {user && (
            <button
              onClick={onLogoutClick}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-500/[0.04] dark:hover:bg-red-950/20 rounded-2xl text-sm font-bold transition-all cursor-pointer"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Mobile Navigation Bar (Bottom tab, visible on mobile / max-md) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[80px] bg-transparent pointer-events-auto select-none z-40">
        {/* Background container */}
        <div className="absolute bottom-0 left-0 right-0 h-[65px] bg-[#fbf8f3] dark:bg-[#171512] rounded-t-2xl shadow-[0_-8px_24px_rgba(44,37,25,0.08)] border-t border-amber-900/10 dark:border-slate-800/40 flex justify-around items-center px-4 z-20 transition-colors duration-300">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const active = activeIndex === idx;

            return (
              <button
                key={item.path}
                onClick={() => handleItemClick(item)}
                className="relative w-12 h-12 flex items-center justify-center focus:outline-none transition-colors duration-200 cursor-pointer"
              >
                <Icon
                  size={24}
                  className={`transition-all duration-300 ${
                    active ? "opacity-0 scale-50" : "text-amber-900/40 dark:text-slate-500 hover:text-amber-955 dark:hover:text-slate-355"
                  }`}
                />

                {/* Cart Badge */}
                {item.badge && cartCount > 0 && !active && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Floating Action Button */}
        <div
          className="absolute top-[3px] w-14 h-14 bg-amber-600 dark:bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-600/20 dark:shadow-amber-550/20 z-30 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
          style={{
            left: `calc(${(activeIndex * 100) / menuItems.length}% + ${(100 / menuItems.length) / 2}% - 28px)`
          }}
        >
          {React.createElement(menuItems[activeIndex].icon, {
            size: 26,
            className: "text-white animate-float"
          })}

          {/* Cart count badge on active floating button */}
          {menuItems[activeIndex].badge && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#fbf8f3] dark:border-[#171512] flex items-center justify-center px-1">
              {cartCount}
            </span>
          )}
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = "Sidebar";
