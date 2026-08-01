import React, { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation as useRouterLocation } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import { useProducts } from "./hooks/useProducts";
import { useLocation as useGPSLocation } from "./hooks/useLocation";
import { CATEGORIES, matchCategory } from "./models/Categories";
import { SeasonalOverlay, getSeasonalGradientClass } from "./components/SeasonalOverlay";
import { Sidebar } from "./components/Sidebar";

// Import Screens
import { LoginScreen } from "./screens/LoginScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { CategoryScreen } from "./screens/CategoryScreen";
import { ProductsScreen } from "./screens/ProductsScreen";
import { CartScreen } from "./screens/CartScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import { ProfileScreen } from "./screens/ProfileScreen";

// Import Icons
import { MapPin, ChevronDown, User, Search, X, Moon, Sun, ArrowLeft, Loader2, LogOut } from "lucide-react";

// Route Protection wrappers
function ProtectedRoute({ children }) {
  const { user, isGuestSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        <p className="text-sm mt-4 text-slate-400 dark:text-slate-550 font-bold">Verifying session...</p>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (user || isGuestSession) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppShell() {
  const { user, logout } = useAuth();
  const { cartItems, showPaymentScreen } = useCart();
  const { products, isLoading: productsLoading, isError: productsError } = useProducts();
  const { locationText, requestLocation } = useGPSLocation();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkTheme]);

  const handleCategoryClick = useCallback((category) => {
    navigate(`/categories/${encodeURIComponent(category.name)}`);
    setSearchQuery("");
  }, [navigate]);

  const handleNavigateBack = useCallback(() => {
    if (routerLocation.pathname.startsWith("/categories/")) {
      navigate("/categories");
    } else {
      navigate("/home");
    }
  }, [routerLocation.pathname, navigate]);

  const activeCategory = useMemo(() => {
    const match = routerLocation.pathname.match(/\/categories\/(.+)/);
    if (!match) return null;
    const catIdOrName = decodeURIComponent(match[1]);
    return CATEGORIES.find(c => String(c.id) === catIdOrName || c.name.toLowerCase() === catIdOrName.toLowerCase()) || { name: catIdOrName, nameDisplay: catIdOrName };
  }, [routerLocation.pathname]);

  // Search filter
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    let list = products;
    if (activeCategory) {
      list = list.filter(item => matchCategory(item.itemCategory, activeCategory.name));
    }
    return list.filter(item => 
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, products, activeCategory]);

  const handleSearchResultClick = useCallback((item) => {
    const matched = CATEGORIES.find(cat => 
      cat.name.toLowerCase().includes(item.itemCategory.toLowerCase()) ||
      item.itemCategory.toLowerCase().includes(cat.name.toLowerCase())
    );

    const catName = matched ? matched.name : item.itemCategory;
    navigate(`/categories/${encodeURIComponent(catName)}`);
    setSearchQuery("");
  }, [navigate]);

  const handleSearchSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (searchResults.length > 0) {
      handleSearchResultClick(searchResults[0]);
    }
  }, [searchResults, handleSearchResultClick]);

  const activeScreenTitle = useMemo(() => {
    const path = routerLocation.pathname;
    if (path.startsWith("/home")) return "Home";
    if (path === "/categories") return "Categories";
    if (path.startsWith("/categories/")) {
      return activeCategory?.nameDisplay || activeCategory?.name || "Items";
    }
    if (path === "/cart") return "Cart";
    if (path === "/orders") return "My Orders";
    if (path === "/profile") return "Edit Profile";
    return "GroCart";
  }, [routerLocation.pathname, activeCategory]);

  // Render home screen loader or screen itself
  const renderHomeScreen = () => {
    if (productsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
          <p className="text-sm text-gray-500 font-bold">Loading groceries...</p>
        </div>
      );
    }
    if (productsError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <img src="/error.webp" alt="Error" className="w-40 h-40 object-contain" />
          <p className="text-sm text-red-500 font-bold">Failed to load items.</p>
        </div>
      );
    }
    return <HomeScreen products={products} onCategoryClick={handleCategoryClick} />;
  };

  // Render categories content (Products list or Categories grid)
  const renderProductsScreen = () => {
    return <ProductsScreen products={products} />;
  };

  const isHome = routerLocation.pathname === "/home";
  const isSearchableScreen = isHome || routerLocation.pathname.startsWith("/categories/");

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans overflow-x-hidden select-none">
      {/* Ambient Glow Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.1),transparent_45%)] pointer-events-none z-0" />

      {/* Seasonal overlay animation */}
      <SeasonalOverlay categoryName={activeCategory?.name || ""} />

      {/* Responsive Navigation Sidebar/Bottombar */}
      {!showPaymentScreen && (
        <Sidebar 
          onRequestLogin={() => setShowLoginRequired(true)}
          onLogoutClick={() => setShowLogoutConfirm(true)}
          isDarkTheme={isDarkTheme}
          onThemeToggle={() => setIsDarkTheme(prev => !prev)}
        />
      )}

      {/* Main Content Container Offset on Desktop */}
      <div className="flex-1 flex flex-col md:pl-64 w-full">
        {/* Top Header Bar */}
        {!showPaymentScreen && (
          <header className="sticky top-0 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700/40 px-6 py-4.5 z-40 w-full transition-colors duration-300">
            <div className="flex items-center justify-between">
              {/* Back button or Location icon */}
              <div className="flex items-center space-x-3">
                {!isHome ? (
                  <button 
                    onClick={handleNavigateBack}
                    className="w-10 h-10 rounded-full hover:bg-gray-150 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={20} className="text-slate-800 dark:text-slate-200" />
                  </button>
                ) : (
                  <div 
                    onClick={requestLocation}
                    className="w-10 h-10 rounded-full bg-slate-750 dark:bg-slate-950/30 flex items-center justify-center cursor-pointer hover:bg-slate-650 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <MapPin size={20} className="text-amber-300 dark:text-amber-400" />
                  </div>
                )}

                {/* Title & Location details */}
                <div className="text-left">
                  <div className="flex items-center space-x-1 cursor-pointer" onClick={requestLocation}>
                    <h1 className="text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {isHome ? "Grocery in 10 minutes" : activeScreenTitle}
                    </h1>
                    <ChevronDown size={14} className="text-slate-900 dark:text-slate-150 mt-0.5" />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-400 font-semibold line-clamp-1 max-w-[280px]">
                    Home - {locationText}
                  </p>
                </div>
              </div>

              {/* Top bar right menu (Mobile only) */}
              <div className="flex items-center space-x-2 md:hidden relative">
                {/* Dark mode toggle */}
                <button
                  onClick={() => setIsDarkTheme(prev => !prev)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-355 transition-colors cursor-pointer"
                >
                  {isDarkTheme ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
                </button>

                {/* User Avatar Circle */}
                <button
                  onClick={() => setMenuExpanded(prev => !prev)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <User size={20} className="text-gray-500 dark:text-gray-400" />
                </button>

                {/* Account Dropdown Menu */}
                {menuExpanded && (
                  <div className="absolute right-0 top-12 bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800 rounded-2xl p-2 w-40 shadow-xl z-50 animate-fade-in text-left">
                    <button
                      onClick={() => {
                        setMenuExpanded(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setMenuExpanded(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            {/* Search Bar */}
            {isSearchableScreen && (
              <div className="relative mt-4 flex flex-col sm:flex-row items-stretch gap-2.5">
                {/* Category Dropdown */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown(prev => !prev)}
                    className="h-full w-full sm:w-auto flex items-center justify-between space-x-2 px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800 rounded-2xl text-sm font-black text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all cursor-pointer min-w-[150px]"
                  >
                    <span className="truncate">
                      {activeCategory ? (activeCategory.nameDisplay || activeCategory.name) : "All Categories"}
                    </span>
                    <ChevronDown size={16} className={`transition-transform duration-200 text-slate-500 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-[#111724] border border-gray-150 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60 animate-fade-in">
                      <div
                        onClick={() => {
                          navigate("/home");
                          setShowCategoryDropdown(false);
                        }}
                        className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-left text-xs font-bold text-slate-700 dark:text-slate-355"
                      >
                        All Categories
                      </div>
                      {CATEGORIES.map(cat => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            handleCategoryClick(cat);
                            setShowCategoryDropdown(false);
                          }}
                          className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-left text-xs font-bold text-slate-700 dark:text-slate-355"
                        >
                          {cat.nameDisplay || cat.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input and Action Buttons Container */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-stretch gap-2.5">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400 dark:text-slate-550" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={activeCategory ? `Search in ${activeCategory.nameDisplay || activeCategory.name}...` : 'Search "milk", "bread"...'}
                      className="w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800 rounded-2xl focus:outline-none focus:bg-white dark:focus:bg-[#111724] focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm transition-all shadow-inner text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 h-full"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>

                  {/* Search Button */}
                  <button
                    type="submit"
                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5 flex-shrink-0"
                  >
                    <Search size={16} />
                    <span>Search</span>
                  </button>
                </form>

                {/* Predictive results dropdown list */}
                {searchQuery && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#111724] border border-gray-150 dark:border-slate-800 rounded-3xl shadow-2xl z-50 max-h-60 overflow-y-auto animate-fade-in divide-y divide-gray-50 dark:divide-slate-800/60">
                    {searchResults.length > 0 ? (
                      searchResults.map(item => (
                        <div
                          key={item.id}
                          onClick={() => handleSearchResultClick(item)}
                          className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer flex justify-between items-center text-left"
                        >
                          <div>
                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{item.itemName}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-450 font-semibold mt-0.5">Category: {item.itemCategory}</p>
                          </div>
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-500">
                            ₹{Math.floor(item.itemPrice * 75 / 100)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-slate-500 font-medium py-6 text-center">No results found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </header>
        )}

        {/* Main Route Content Area */}
        <main className="flex-1 w-full relative z-20 pointer-events-auto px-6 py-4 pb-28 md:pb-4">
          <Outlet />
        </main>
      </div>

      {/* Payment Screen Modal Overlay */}
      {showPaymentScreen && (
        <PaymentScreen onPaymentConfirmed={() => navigate("/orders")} />
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-xs flex flex-col items-center text-center space-y-4 shadow-xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Logout?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">Are you sure you want to logout?</p>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm rounded-xl transition-colors cursor-pointer border border-transparent dark:border-slate-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Required Prompt Dialog for Guest Users */}
      {showLoginRequired && (
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-xs flex flex-col items-center text-center space-y-4 shadow-xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-850 dark:text-slate-200">Login Required</h3>
            <p className="text-sm text-gray-400 dark:text-slate-400 font-semibold leading-relaxed">
              Please login to access this feature.
            </p>
            <div className="flex space-x-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowLoginRequired(false);
                  logout();
                }}
                className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginRequired(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-250 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-sm rounded-xl transition-colors cursor-pointer border border-transparent dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
              <Route path="home" element={<HomeScreen products={[]} />} /> {/* Will be dynamically replaced in router renders */}
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

// In order to correctly pass dynamic dependencies down to child screen elements, 
// let's define an intermediary AppWrapper inside App that handles hook-based state
// and renders the configured Routes using current AppShell state values.
function AppShellWrapper() {
  const { products, isLoading: productsLoading, isError: productsError } = useProducts();
  const navigate = useNavigate();
  const handleCategoryClick = useCallback((category) => {
    navigate(`/categories/${encodeURIComponent(category.name)}`);
  }, [navigate]);

  const renderHome = () => {
    if (productsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
          <p className="text-sm text-gray-500 font-bold">Loading groceries...</p>
        </div>
      );
    }
    if (productsError) {
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
          <AppShell />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="home" element={renderHome()} />
        <Route path="categories" element={<Outlet />}>
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

function MainApp() {
  const basename = window.location.hostname.includes("github.io") ? "/grocart-webapp" : "/";

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <CartProvider>
          <AppShellWrapper />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default MainApp;
