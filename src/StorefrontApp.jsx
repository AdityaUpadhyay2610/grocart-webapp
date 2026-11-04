import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate, useOutletContext } from "react-router";
import { store as legacyStore } from "@global/store/legacyStore";
import { Provider as LegacyProvider } from "react-redux";
import { AuthProvider, useAuth } from "@global/context/AuthContext";
import { CartProvider, useCart } from "./modules/customer/state/CartContext";
import { useProducts } from "./modules/customer/hooks/useProducts";
import { useCategories } from "./modules/customer/hooks/useCategories";
import { useLocation as useGPSLocation } from "@global/hooks/useLocation";

import { LoginScreen } from "./modules/customer/pages/LoginScreen";
import { HomeScreen } from "./modules/customer/pages/HomeScreen";
import { CategoryScreen } from "./modules/customer/pages/CategoryScreen";
import { ProductsScreen } from "./modules/customer/pages/ProductsScreen";
import { CartScreen } from "./modules/customer/pages/CartScreen";
import { PaymentScreen } from "./modules/customer/pages/PaymentScreen";
import { OrdersScreen } from "./modules/customer/pages/OrdersScreen";
import { ProfileScreen } from "./modules/customer/pages/ProfileScreen";

import { Navbar } from "./modules/customer/components/Navbar";
import { Footer } from "./modules/customer/components/Footer";
import { LocationModal } from "./modules/customer/components/LocationModal";
import { ProductDetailModal } from "./modules/customer/components/ProductDetailModal";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }) {
  const { user, isGuestSession, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-100">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm mt-4 text-slate-400 font-bold">Verifying session...</p>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#090D16]">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (user || isGuestSession) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppShell({ categories = [] }) {
  const { user, logout } = useAuth();
  const { cartItems, showPaymentScreen } = useCart();
  const { products } = useProducts();
  const { locationText, requestLocation, selectLocation, presetLocations } = useGPSLocation();
  const navigate = useNavigate();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);

  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cartItems]);

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkTheme]);

  const displayLocation = useMemo(() => {
    if (!locationText || locationText.includes("Fetching") || locationText.includes("Disabled") || locationText.includes("Unable") || locationText.includes("Permission") || locationText.includes("Required")) {
      return "Connaught Place, New Delhi 110001";
    }
    return locationText;
  }, [locationText]);

  return (
    <div className="relative min-h-screen bg-background text-on-surface transition-colors duration-300 flex flex-col font-sans overflow-x-hidden select-none">
      {!showPaymentScreen && (
        <Navbar
          categories={categories}
          products={products}
          displayLocation={displayLocation}
          onOpenLocation={() => setShowLocationModal(true)}
          isDarkTheme={isDarkTheme}
          onToggleTheme={() => setIsDarkTheme(prev => !prev)}
          cartCount={cartCount}
          user={user}
          onLogout={() => setShowLogoutConfirm(true)}
        />
      )}

      <main className="flex-1 w-full pt-24 min-h-[calc(100vh-280px)]">
        <Outlet context={{ setSelectedProduct: setSelectedProductDetail, requestLocation, locationText, categories }} />
      </main>

      <Footer />

      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestLocation={requestLocation}
        presetLocations={presetLocations}
        onSelectLocation={selectLocation}
      />

      {showPaymentScreen && (
        <PaymentScreen onPaymentConfirmed={() => navigate("/orders")} />
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-xs flex flex-col items-center text-center space-y-4 shadow-xl border border-slate-100 dark:border-[#262626]">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Logout?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Are you sure you want to logout?</p>
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
                className="flex-1 py-3 bg-slate-100 dark:bg-[#262626] hover:bg-slate-200 dark:hover:bg-[#353534] text-slate-700 dark:text-slate-200 font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProductDetail && (
        <ProductDetailModal 
          product={selectedProductDetail} 
          onClose={() => setSelectedProductDetail(null)} 
        />
      )}
    </div>
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
  const { user } = useAuth();
  const { loadCart } = useCart();

  useEffect(() => {
    loadCart();
  }, [user?.uid, user?.id, loadCart]);

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
