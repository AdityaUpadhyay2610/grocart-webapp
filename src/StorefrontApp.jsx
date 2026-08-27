import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation as useRouterLocation, useOutletContext } from "react-router";
import { store as legacyStore } from "@global/store/legacyStore";
import { Provider as LegacyProvider } from "react-redux";
import { AuthProvider, useAuth } from "@global/context/AuthContext";
import { CartProvider, useCart } from './modules/customer/state/CartContext';
import { useProducts } from './modules/customer/hooks/useProducts';
import { useLocation as useGPSLocation } from "@global/hooks/useLocation";
import { matchCategory } from "@global/models/Categories";
import { useCategories } from './modules/customer/hooks/useCategories';
import { SeasonalOverlay, getSeasonalGradientClass, getSeasonFromWeather } from './modules/customer/components/SeasonalOverlay';
import { Sidebar } from '@global/components/layout/Sidebar';
import { ProductDetailModal } from './modules/customer/components/ProductDetailModal';
import { useDispatch } from "react-redux";
import { onAuthStateChange } from "@global/services/firebaseAuth";
import { setUserState, setAuthLoading } from "@global/store/legacyAuthSlice";

// Import Screens
import { LoginScreen } from './modules/customer/pages/LoginScreen';
import { HomeScreen } from './modules/customer/pages/HomeScreen';
import { CategoryScreen } from './modules/customer/pages/CategoryScreen';
import { ProductsScreen } from "./modules/customer/pages/ProductsScreen";
import { CartScreen } from "./modules/customer/pages/CartScreen";
import { PaymentScreen } from './modules/customer/pages/PaymentScreen';
import { OrdersScreen } from './modules/customer/pages/OrdersScreen';
import { ProfileScreen } from './modules/customer/pages/ProfileScreen';

// Import Icons
import { MapPin, ChevronDown, Search, X, Moon, Sun, ArrowLeft, Loader2, LogOut, Cloud, CloudRain, CloudSnow } from "lucide-react";

const getWeatherIcon = (weather) => {
  if (!weather || weather.temperature === null) return null;
  if (weather.isRaining) return <CloudRain size={13} className="text-blue-500 dark:text-blue-400 animate-bounce" />;
  if (weather.isSnowing) return <CloudSnow size={13} className="text-sky-300 dark:text-sky-200 animate-spin" style={{ animationDuration: '8s' }} />;
  if (weather.temperature >= 28) return <Sun size={13} className="text-amber-500 dark:text-amber-400 animate-pulse" />;
  return <Cloud size={13} className="text-slate-400 dark:text-slate-500" />;
};

// Route Protection wrappers
function ProtectedRoute({ children }) {
  const { user, isGuestSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm mt-4 text-slate-400 dark:text-slate-500 font-bold">Verifying session...</p>
      </div>
    );
  }

  if (!user && !isGuestSession) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, isGuestSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (user || isGuestSession) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

const getThemeClassFromEmoji = (emoji) => {
  switch (emoji) {
    case "🍎": return "theme-apple";
    case "🥑": return "theme-avocado";
    case "🍪": return "theme-cookie";
    case "🥛": return "theme-milk";
    case "☕": return "theme-coffee";
    case "🍉": return "theme-watermelon";
    case "🧁": return "theme-cupcake";
    case "🍕": return "theme-pizza";
    default: return "theme-avocado";
  }
};

function AppShell({ categories = [] }) {
  const { user, logout } = useAuth();
  const { cartItems, showPaymentScreen } = useCart();
  const { products } = useProducts();
  const { locationText, weather, requestLocation, selectLocation, presetLocations } = useGPSLocation();
  const season = useMemo(() => getSeasonFromWeather(weather), [weather]);
  const bgGradientClass = useMemo(() => getSeasonalGradientClass(season), [season]);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [avatarEmoji, setAvatarEmoji] = useState(() => {
    return localStorage.getItem("grocart_avatar") || "🍎";
  });

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  useEffect(() => {
    const handleStorageChange = () => {
      setAvatarEmoji(localStorage.getItem("grocart_avatar") || "🍎");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sync avatar theme class
  useEffect(() => {
    const themeClasses = [
      "theme-apple", "theme-avocado", "theme-cookie", "theme-milk",
      "theme-coffee", "theme-watermelon", "theme-cupcake", "theme-pizza"
    ];
    document.documentElement.classList.remove(...themeClasses);
    const newThemeClass = getThemeClassFromEmoji(avatarEmoji);
    document.documentElement.classList.add(newThemeClass);
  }, [avatarEmoji]);

  // Sync dark mode class and localStorage
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkTheme]);

  const handleCategoryClick = useCallback((category) => {
    navigate(`/categories/${encodeURIComponent(category.name)}`);
    setSearchQuery("");
  }, [navigate]);

  const activeCategory = useMemo(() => {
    const match = routerLocation.pathname.match(/\/categories\/(.+)/);
    if (!match) return null;
    const catIdOrName = decodeURIComponent(match[1]);
    return categories.find(c => String(c.id) === catIdOrName || c.name.toLowerCase() === catIdOrName.toLowerCase()) || { name: catIdOrName, nameDisplay: catIdOrName };
  }, [routerLocation.pathname, categories]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    let list = products || [];
    if (activeCategory) {
      list = list.filter(item => matchCategory(item.itemCategory, activeCategory.name));
    }
    return list.filter(item => 
      (item.itemName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.itemCategory || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products, activeCategory]);

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

  const isHome = routerLocation.pathname === "/home" || routerLocation.pathname === "/";
  const isCategories = routerLocation.pathname.startsWith("/categories");
  const isOrders = routerLocation.pathname === "/orders";
  const isCart = routerLocation.pathname === "/cart";

  // Gracefully handle loading and fallback geolocation text
  const displayLocation = useMemo(() => {
    if (!locationText || locationText.includes("Fetching") || locationText.includes("Disabled") || locationText.includes("Unable") || locationText.includes("Permission") || locationText.includes("Required")) {
      return "Connaught Place, New Delhi 110001";
    }
    return locationText;
  }, [locationText]);

  return (
    <div className={`relative min-h-screen bg-background text-on-surface transition-colors duration-300 flex flex-col font-sans overflow-x-hidden select-none`}>
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-primary-container/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Seasonal overlay animation */}
      <SeasonalOverlay categoryName={activeCategory?.name || ""} weather={weather} />

      {/* ── Top Header Navigation Bar (Full Width Canvas) ── */}
      {!showPaymentScreen && (
        <header className="fixed top-0 w-full z-50 bg-glass-fill dark:bg-[#0a0a0a]/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-surface-variant/40 dark:border-[#262626]">
          <div className="h-20 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-between gap-4 md:gap-8">
            
            {/* Left: Brand Logo & Location Picker */}
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

              {/* Location Picker Button */}
              <button 
                onClick={() => setShowLocationModal(true)}
                className="hidden md:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors px-3.5 py-2 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] max-w-[280px] text-left cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[20px] text-primary shrink-0">location_on</span>
                <span className="font-label-md truncate text-xs font-semibold">{displayLocation}</span>
                <span className="material-symbols-outlined text-[18px] shrink-0">expand_more</span>
              </button>
            </div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-2xl relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant text-[20px] pointer-events-none">search</span>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 27+ categories and thousands of fresh groceries..."
                  className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] h-12 pl-12 pr-10 rounded-xl shadow-inner focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all font-body-md text-sm text-on-surface dark:text-white placeholder:text-slate-text/70"
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

              {/* Live Search Suggestions Dropdown */}
              {searchQuery && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/50 dark:border-[#262626] rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto animate-fade-in divide-y divide-surface-variant/30 dark:divide-[#262626] text-left">
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

            {/* Right: Navigation Links, Theme Toggle, Cart, Profile */}
            <nav className="flex items-center gap-3 sm:gap-5">
              <button 
                onClick={() => navigate("/home")}
                className={`font-label-md text-sm transition-colors cursor-pointer hidden sm:block ${isHome ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
              >
                Home
              </button>

              <button 
                onClick={() => navigate("/categories")}
                className={`font-label-md text-sm transition-colors cursor-pointer hidden sm:block ${isCategories ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
              >
                Categories
              </button>

              <button 
                onClick={() => navigate("/orders")}
                className={`font-label-md text-sm transition-colors cursor-pointer hidden sm:block ${isOrders ? 'text-primary font-extrabold' : 'text-on-surface-variant hover:text-white'}`}
              >
                Orders
              </button>

              {/* One-Click Dark / Light Mode Toggle Button */}
              <button 
                onClick={() => setIsDarkTheme(prev => !prev)}
                className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] hover:border-primary text-on-surface flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title={isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {isDarkTheme ? 'light_mode' : 'dark_mode'}
                </span>
              </button>

              {/* Cart Icon with Synced Counter */}
              <div 
                onClick={() => navigate("/cart")}
                className="relative cursor-pointer hover:scale-105 transition-transform flex items-center justify-center p-1.5 rounded-xl bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626]"
                title="View Cart"
              >
                <span className="material-symbols-outlined text-on-surface-variant hover:text-white text-[24px]">shopping_cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-primary text-on-primary text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#0a0a0a] px-1 shadow-sm animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </div>

              {/* User Avatar & Menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuExpanded(prev => !prev)}
                  className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center cursor-pointer hover:scale-105 transition-all shadow-sm"
                  title="Profile Menu"
                >
                  <span className="material-symbols-outlined text-[22px]">person</span>
                </button>

                {menuExpanded && (
                  <div className="absolute right-0 top-12 bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] rounded-2xl p-2 w-52 shadow-2xl z-50 animate-fade-in text-left">
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
                      <span className="material-symbols-outlined text-[16px]">account_circle</span>
                      <span>Account Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuExpanded(false);
                        setIsDarkTheme(prev => !prev);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-on-surface dark:text-white hover:bg-surface-container-low dark:hover:bg-[#171717] rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">{isDarkTheme ? 'light_mode' : 'dark_mode'}</span>
                      <span>{isDarkTheme ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuExpanded(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-error hover:bg-error-container/30 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden px-4 pb-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh groceries..."
                className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/40 dark:border-[#262626] h-10 pl-10 pr-8 rounded-xl text-xs text-on-surface dark:text-white"
              />
            </form>
          </div>
        </header>
      )}

      {/* ── Main Content Container ── */}
      <main className="flex-1 w-full pt-24 md:pt-24 min-h-[calc(100vh-280px)]">
        <Outlet context={{ setSelectedProduct: setSelectedProductDetail, requestLocation, locationText, categories }} />
      </main>

      {/* ── Global Footer matching Mockup ── */}
      <footer className="w-full bg-surface-container-lowest dark:bg-[#0e0e0e] border-t border-surface-variant/30 dark:border-[#262626] py-16 mt-16 text-left">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img 
                src="/log.jpg" 
                alt="GroCart Logo" 
                className="w-8 h-8 rounded-lg object-cover shadow-sm shadow-emerald-500/20" 
              />
              <span className="font-headline-md text-primary text-xl font-black">GroCart</span>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed max-w-xs">
              Bringing the organic freshness of the market to your digital doorstep in minutes.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Company</h4>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">About Us</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Careers</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Press</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Support</h4>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Contact Support</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Terms of Service</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-xs">Privacy Policy</a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-label-md text-on-surface dark:text-white uppercase tracking-wider text-xs font-bold">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">public</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">chat</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center hover:bg-primary hover:text-white transition-all text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </a>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 mt-12 pt-6 border-t border-surface-variant/20 dark:border-[#262626] flex flex-col sm:flex-row justify-between items-center gap-4 text-on-surface-variant text-xs">
          <p>© 2024 GroCart Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6 font-semibold">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[16px]">eco</span> Sustainably Packed</span>
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-primary text-[16px]">bolt</span> Quick-Commerce Ready</span>
          </div>
        </div>
      </footer>


      {/* ── Location Selector Modal ── */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-surface-variant/50 dark:border-[#262626] text-left">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant/30 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <h3 className="font-headline-md text-lg font-black text-on-surface dark:text-white">Select Delivery Location</h3>
              </div>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* GPS Trigger Button */}
            <button
              onClick={() => {
                requestLocation();
                setShowLocationModal(false);
              }}
              className="mt-4 w-full py-3 px-4 bg-primary text-on-primary font-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">my_location</span>
              <span>Detect My Current Location (GPS)</span>
            </button>

            {/* Indian Preset Cities List */}
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-xs font-bold text-slate-text uppercase tracking-wider">Popular Metro Areas</p>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {(presetLocations || []).map((preset) => (
                  <button
                    key={preset.city}
                    onClick={() => {
                      selectLocation(preset);
                      setShowLocationModal(false);
                    }}
                    className="flex flex-col text-left p-3 rounded-xl border border-surface-variant/40 dark:border-[#262626] hover:border-primary hover:bg-primary-50/20 dark:hover:bg-primary/10 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-on-surface dark:text-white">{preset.city}</span>
                    <span className="text-[11px] text-on-surface-variant truncate">{preset.address}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Screen Modal Overlay */}
      {showPaymentScreen && (
        <PaymentScreen onPaymentConfirmed={() => navigate("/orders")} />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-xs flex flex-col items-center text-center space-y-4 shadow-xl border border-slate-100 dark:border-[#262626]">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Logout?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to logout?</p>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-650 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-[#262626] hover:bg-slate-200 dark:hover:bg-[#353534] text-slate-700 dark:text-slate-200 font-extrabold text-sm rounded-xl transition-colors cursor-pointer border border-transparent dark:border-[#262626]"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Prompt Dialog for Guest Users */}
      {showLoginRequired && (
        <div className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-xs flex flex-col items-center text-center space-y-4 shadow-xl border border-slate-100 dark:border-[#262626]">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Login Required</h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
              Please login to access this feature.
            </p>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowLoginRequired(false);
                  logout();
                }}
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginRequired(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-[#262626] hover:bg-slate-250 dark:hover:bg-[#353534] text-slate-700 dark:text-slate-200 font-extrabold text-sm rounded-xl transition-colors cursor-pointer border border-transparent dark:border-[#262626]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductDetail && (
        <ProductDetailModal 
          product={selectedProductDetail} 
          onClose={() => setSelectedProductDetail(null)} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <LoginScreen />
              </PublicRoute>
            } />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/home" replace />} />
              <Route path="home" element={<HomeScreen products={[]} />} />
              <Route path="categories" element={<Outlet />}>
                <Route index element={<CategoryScreen />} />
                <Route path=":categoryId" element={<ProductsScreen />} />
              </Route>
              <Route path="cart" element={<CartScreen />} />
              <Route path="orders" element={<OrdersScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function CategoriesLayout() {
  const context = useOutletContext();
  return <Outlet context={context} />;
}

function AppShellWrapper() {
  const { products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { loadCart } = useCart();

  // Firebase auth state subscription
  useEffect(() => {
    dispatch(setAuthLoading(true));
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUserState({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          emailVerified: firebaseUser.emailVerified
        }));
      } else {
        dispatch(setUserState(null));
      }
    });
    return unsubscribe;
  }, [dispatch]);

  // Load cart when user changes
  useEffect(() => {
    loadCart();
  }, [user?.id, loadCart]);

  const handleCategoryClick = useCallback((category) => {
    navigate(`/categories/${encodeURIComponent(category.name)}`);
  }, [navigate]);

  const renderHome = () => {
    if (productsLoading || categoriesLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          <p className="text-sm text-slate-500 font-bold">Loading groceries...</p>
        </div>
      );
    }
    if (productsError || categoriesError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <img src="/error.webp" alt="Error" className="w-40 h-40 object-contain" />
          <p className="text-sm text-red-500 font-bold">Failed to load items.</p>
        </div>
      );
    }
    return <HomeScreen products={products} onCategoryClick={handleCategoryClick} />;
  };

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginScreen />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <AppShell categories={categories} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={renderHome()} />
        <Route path="categories" element={<CategoriesLayout />}>
          <Route index element={<CategoryScreen onCategoryClick={handleCategoryClick} />} />
          <Route path=":categoryId" element={<ProductsScreen products={products} />} />
        </Route>
        <Route path="cart" element={<CartScreen onBrowseProducts={() => navigate("/home")} />} />
        <Route path="orders" element={<OrdersScreen />} />
        <Route path="profile" element={<ProfileScreen onNavigateBack={() => navigate(-1)} />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}

// Legacy store imports moved to top
function StorefrontApp() {
  return (
    <LegacyProvider store={legacyStore}>
      <AuthProvider>
        <CartProvider>
          <AppShellWrapper />
        </CartProvider>
      </AuthProvider>
    </LegacyProvider>
  );
}

export default StorefrontApp;
