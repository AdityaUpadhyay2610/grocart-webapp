import React, { useMemo } from "react";
import { Home, LayoutGrid, ShoppingCart, ShoppingBag, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export const BottomNavBar = React.memo(({ currentScreen, onNavigate, onRequestLogin }) => {
  const { isGuestSession } = useAuth();
  const { cartItems } = useCart();

  const tabs = useMemo(() => [
    { name: "Start", label: "Home", icon: Home },
    { name: "Category", label: "Categories", icon: LayoutGrid },
    { name: "Cart", label: "Cart", icon: ShoppingCart, badge: true },
    { name: "Orders", label: "Orders", icon: ShoppingBag, authRequired: true },
    { name: "Profile", label: "Profile", icon: User, authRequired: true }
  ], []);

  const selectedIndex = useMemo(() => {
    const idx = tabs.findIndex(tab => tab.name === currentScreen);
    return idx >= 0 ? idx : 0;
  }, [currentScreen, tabs]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const handleTabClick = (tab) => {
    if (isGuestSession && tab.authRequired) {
      onRequestLogin();
    } else {
      onNavigate(tab.name);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[80px] bg-transparent pointer-events-auto">
      {/* Background container with curved cutout representation */}
      <div className="absolute bottom-0 left-0 right-0 h-[65px] bg-slate-800 rounded-t-2xl shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.1)] border-t border-slate-700/40 flex justify-around items-center px-4 z-20">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isSelected = selectedIndex === idx;
          
          return (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab)}
              className="relative w-12 h-12 flex items-center justify-center focus:outline-none transition-colors duration-200"
            >
              <Icon 
                size={24} 
                className={`transition-all duration-300 ${
                  isSelected ? "opacity-0 scale-50" : "text-gray-400 hover:text-gray-600"
                }`}
              />
              
              {/* Cart Badge */}
              {tab.badge && cartCount > 0 && !isSelected && (
                <span className="absolute top-1.5 right-1.5 min-w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Action Button (Slides above active tab) */}
      <div 
        className="absolute top-[3px] w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-300 z-30 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        style={{
          left: `calc(${(selectedIndex * 100) / tabs.length}% + ${(100 / tabs.length) / 2}% - 28px)`
        }}
      >
        {React.createElement(tabs[selectedIndex].icon, { 
          size: 26, 
          className: "text-white animate-float" 
        })}
        
        {/* Cart count badge on active floating button */}
        {tabs[selectedIndex].badge && cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1">
            {cartCount}
          </span>
        )}
      </div>
    </div>
  );
});
BottomNavBar.displayName = "BottomNavBar";

