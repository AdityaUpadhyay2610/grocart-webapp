import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { MapPin, ChevronDown, Search, X, Sun, Moon, ShoppingCart, User, LogOut } from "lucide-react";
import { matchCategory } from "@global/models/Categories";

export function Navbar({
  categories = [],
  products = [],
  displayLocation = "Select Location",
  onOpenLocation,
  isDarkTheme,
  onToggleTheme,
  cartCount = 0,
  user,
  onLogout
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [menuExpanded, setMenuExpanded] = useState(false);

  const isHome = location.pathname === "/home" || location.pathname === "/";
  const isCategories = location.pathname.startsWith("/categories");
  const isOrders = location.pathname === "/orders";

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return (products || []).filter(item =>
      (item.itemName || "").toLowerCase().includes(query) ||
      (item.itemCategory || "").toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  const handleSearchResultClick = useCallback((item) => {
    const matched = categories.find(cat => matchCategory(item.itemCategory, cat.name));
    const catName = matched ? matched.name : item.itemCategory;
    navigate(`/categories/${encodeURIComponent(catName)}`);
    setSearchQuery("");
  }, [navigate, categories]);

  const handleSearchSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  }, [searchResults, handleSearchResultClick]);

  return (
    <header className="fixed top-0 w-full z-50 bg-glass-fill dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-xs dark:shadow-md border-b border-surface-variant/40 dark:border-[#262626]">
      <div className="h-20 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between gap-4 md:gap-8">
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div 
            onClick={() => navigate("/home")} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <img 
              src="/log.jpg" 
              alt="GroCart Logo" 
              className="w-11 h-11 rounded-xl object-cover shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform" 
            />
            <span className="font-headline-md text-primary tracking-tight font-extrabold text-2xl sm:text-3xl">GroCart</span>
          </div>

          <button 
            onClick={onOpenLocation}
            className="hidden md:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors px-3.5 py-2 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] max-w-[280px] text-left cursor-pointer"
          >
            <MapPin size={18} className="text-primary shrink-0" />
            <span className="truncate text-xs font-semibold">{displayLocation}</span>
            <ChevronDown size={15} className="shrink-0 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 max-w-2xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-on-surface-variant pointer-events-none" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 27+ categories and thousands of fresh groceries..."
              className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] h-12 pl-12 pr-10 rounded-xl shadow-inner focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all text-sm text-on-surface dark:text-white placeholder:text-slate-text/70"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-slate-400 hover:text-slate-200"
              >
                <X size={16} />
              </button>
            )}
          </form>

          {searchQuery && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/50 dark:border-[#262626] rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-surface-variant/30 dark:divide-[#262626] text-left">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 8).map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSearchResultClick(item)}
                    className="px-4 py-3 hover:bg-surface-container-low dark:hover:bg-[#171717] cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.itemName} className="w-9 h-9 rounded-lg object-cover bg-surface-container-low dark:bg-[#171717]" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-on-surface dark:text-white">{item.itemName}</p>
                        <p className="text-xs text-on-surface-variant">{item.itemCategory}</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-primary">₹{item.itemPrice}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-on-surface-variant p-4 text-center">No groceries found</p>
              )}
            </div>
          )}
        </div>

        <nav className="flex items-center gap-3 sm:gap-5">
          <button 
            onClick={() => navigate("/home")}
            className={`text-sm transition-colors cursor-pointer hidden sm:block ${isHome ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
          >
            Home
          </button>

          <button 
            onClick={() => navigate("/categories")}
            className={`text-sm transition-colors cursor-pointer hidden sm:block ${isCategories ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
          >
            Categories
          </button>

          <button 
            onClick={() => navigate("/orders")}
            className={`text-sm transition-colors cursor-pointer hidden sm:block ${isOrders ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
          >
            Orders
          </button>

          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] hover:border-primary text-on-surface flex items-center justify-center transition-all cursor-pointer"
            title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkTheme ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-primary" />}
          </button>

          <div 
            onClick={() => navigate("/cart")}
            className="relative cursor-pointer hover:scale-105 transition-transform flex items-center justify-center p-1.5 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626]"
            title="View Cart"
          >
            <ShoppingCart size={22} className="text-on-surface-variant hover:text-white" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] px-1 shadow-sm">
                {cartCount}
              </span>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuExpanded(prev => !prev)}
              className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm"
              title="Profile Menu"
            >
              <User size={20} className="text-white" />
            </button>

            {menuExpanded && (
              <div className="absolute right-0 top-12 bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] rounded-2xl p-2 w-52 shadow-2xl z-50 text-left">
                <div className="px-3 py-2 border-b border-surface-variant/30 dark:border-[#262626] mb-1">
                  <p className="text-xs font-bold text-on-surface dark:text-white truncate">{user?.username || "Guest User"}</p>
                  <p className="text-[10px] text-slate-text truncate">{user?.email || "guest@grocart.com"}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuExpanded(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-[#171717] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <User size={15} />
                  <span>Account Profile</span>
                </button>
                <button
                  onClick={() => {
                    setMenuExpanded(false);
                    onToggleTheme();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-[#171717] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isDarkTheme ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-primary" />}
                  <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
                </button>
                <button
                  onClick={() => {
                    setMenuExpanded(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-error hover:bg-error-container/30 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search size={16} className="absolute left-3 text-on-surface-variant pointer-events-none" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fresh groceries..."
            className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] h-10 pl-10 pr-8 rounded-xl text-xs text-on-surface dark:text-white"
          />
        </form>
      </div>
    </header>
  );
}
