import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { CATEGORIES } from "../models/Categories";
import { useCart } from "../context/CartContext";
import { Minus, Plus, ChevronLeft, ChevronRight, Percent, ShieldCheck } from "lucide-react";

// Mock promotional banners
const PROMO_BANNERS = [
  {
    id: 1,
    title: "Organic Fresh Veggies",
    tagline: "Directly from Local Farms",
    discount: "Up to 35% OFF",
    gradient: "from-emerald-500 to-teal-600",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60"
  },
  {
    id: 2,
    title: "Dairy & Morning Essentials",
    tagline: "Fresh milk, butter & breakfast bakes",
    discount: "Flat 20% cashback",
    gradient: "from-blue-500 to-indigo-600",
    image: "https://images.unsplash.com/photo-1635586506547-4dbe01d7ba5d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGRhaXJ5JTIwcHJvZHVjdHN8ZW58MHx8MHx8fDA%3D"
  },
  {
    id: 3,
    title: "Weekend Sweet Cravings",
    tagline: "Premium chocolates, cookies & ice creams",
    discount: "Buy 1 Get 1 FREE",
    gradient: "from-rose-500 to-pink-600",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60"
  }
];

export const HomeScreen = React.memo(({ products, onCategoryClick }) => {
  const { cartItems, addToCart, decreaseCartItem, triggerAddToCartAnimation } = useCart();
  const { setSelectedProduct } = useOutletContext();
  const [activeBanner, setActiveBanner] = useState(0);
  const navigate = useNavigate();

  // Auto scroll promo banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % PROMO_BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextBanner = useCallback(() => {
    setActiveBanner(prev => (prev + 1) % PROMO_BANNERS.length);
  }, []);

  const prevBanner = useCallback(() => {
    setActiveBanner(prev => (prev - 1 + PROMO_BANNERS.length) % PROMO_BANNERS.length);
  }, []);

  // Shuffled recommended items (take 10)
  const recommendedItems = useMemo(() => {
    if (products.length === 0) return [];
    const stableProducts = [...products];
    return stableProducts.slice(0, 10);
  }, [products]);

  const handleAddToCart = useCallback((e, item) => {
    e.stopPropagation();
    triggerAddToCartAnimation(item);
    addToCart(item);
  }, [addToCart, triggerAddToCartAnimation]);

  return (
    <div className="flex flex-col space-y-10 pb-28 select-none w-full max-w-7xl mx-auto mt-2">
      
      {/* ── SECTION: PROMOTIONAL CAROUSEL ── */}
      <div className="relative w-full aspect-[1.] sm:aspect-[2.5] md:aspect-[3.6] overflow-hidden rounded-3xl group shadow-sm border border-slate-100 dark:border-slate-800/40">
        <div 
          className="flex h-[150px] md:h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeBanner * 100}%)` }}
        >
          {PROMO_BANNERS.map(promo => (
            <div 
              key={promo.id}
              className={`w-full h-full flex-shrink-0 bg-gradient-to-r ${promo.gradient} text-white flex items-center justify-between p-5 sm:p-8 md:p-12 relative`}
            >
              {/* Overlay graphics */}
              <div className="absolute inset-0 bg-black/10 z-0" />
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              
              {/* Left Column Text */}
              <div className="text-left z-10 w-full sm:max-w-[60%] flex flex-col justify-center space-y-1.5 md:space-y-2">
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-xs font-black tracking-widest uppercase w-fit">
                  <Percent size={12} />
                  <span>{promo.discount}</span>
                </div>
                <h2 className="text-lg sm:text-2xl md:text-4xl font-black tracking-tight leading-tight">{promo.title}</h2>
                <p className="text-[11px] sm:text-sm text-white/80 font-bold leading-normal truncate">{promo.tagline}</p>
                <button 
                  onClick={() => navigate("/categories")}
                  className="mt-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-slate-900 hover:bg-slate-50 text-[9px] sm:text-xs font-black rounded-xl shadow transition-colors w-fit uppercase tracking-wider cursor-pointer"
                >
                  Shop Now
                </button>
              </div>

              {/* Right Column Image */}
              <div className="h-full w-[35%] relative z-10 hidden sm:flex items-center justify-center">
                <img 
                  src={promo.image} 
                  alt={promo.title} 
                  className="h-[85%] aspect-[1.3] object-cover rounded-2xl shadow-lg border border-white/10 hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Arrow Controls */}
        <button 
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        >
          <ChevronLeft size={18} />
        </button>
        <button 
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
        >
          <ChevronRight size={18} />
        </button>

        {/* Indicator dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {PROMO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeBanner ? "w-5 bg-white" : "w-1.5 bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      {/* ── SECTION: RECOMMENDED ITEMS ── */}
      {recommendedItems.length > 0 && (
        <div className="flex flex-col space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Best Deals for you</h2>
            <div className="flex items-center space-x-1.5 text-xs text-primary-500 font-bold">
              <ShieldCheck size={14} className="text-primary-500" />
              <span>Free delivery on first order</span>
            </div>
          </div>
          
          <div className="flex space-x-5 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth">
            {recommendedItems.map(item => {
              const cartItem = cartItems.find(i => i.id === item.id);
              const quantity = cartItem ? cartItem.quantity : 0;
              const discountedPrice = Math.floor(item.itemPrice * 75 / 100);

              return (
                <div 
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="w-44 flex-shrink-0 bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all cursor-pointer hover:scale-[1.02] active:scale-98 relative group"
                >
                  {/* Floating Off percentage tag */}
                  <div className="absolute top-2 left-2 bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-accent-100/10">
                    25% OFF
                  </div>

                  <div className="flex justify-center mb-3 mt-2 overflow-hidden rounded-2xl">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="w-28 h-28 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100/f1f5f9/10b981?text=Fresh+Cart"; }}
                    />
                  </div>
                  
                  <div className="flex flex-col flex-1 justify-between">
                    <div className="text-left">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[32px] leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.itemName}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-extrabold">{item.itemQuantity}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-50 dark:border-slate-800/40">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 line-through">₹{item.itemPrice}</span>
                        <span className="text-sm font-black text-slate-850 dark:text-white">
                          ₹{discountedPrice}
                        </span>
                      </div>

                      {quantity > 0 ? (
                        <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/10 dark:border-primary-900/30 rounded-xl px-1.5 py-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseCartItem(cartItem);
                            }}
                            className="w-5 h-5 rounded bg-white dark:bg-[#111724] flex items-center justify-center text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 min-w-[10px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="w-5 h-5 rounded bg-white dark:bg-[#111724] flex items-center justify-center text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          className="px-4 py-1.5 bg-primary-500 hover:bg-primary-650 text-white font-extrabold text-[10px] rounded-xl shadow-sm hover:shadow transition-colors cursor-pointer"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SECTION: SHOP BY CATEGORY ── */}
      <div className="flex flex-col space-y-4 text-left">
        <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Shop By Category</h2>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-5 py-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat)}
              className="flex flex-col bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-3.5 items-center justify-between text-center group transition-all duration-300 hover:shadow-md dark:hover:shadow-none hover:scale-105 active:scale-95 cursor-pointer aspect-auto min-h-[110px] sm:min-h-[125px]"
              style={{ backgroundColor: `${cat.bgColor}15` }}
            >
              {/* Image box */}
              <div 
                className="w-14 h-14 bg-white dark:bg-[#0c101a] rounded-2xl flex items-center justify-center shadow-sm border border-slate-100/50 dark:border-slate-800/40 group-hover:scale-105 transition-transform duration-300"
              >
                <img 
                  src={cat.image} 
                  alt={cat.nameDisplay || cat.name} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/48x48/e8fbf3/10b981?text=Cat"; }}
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-2.5 line-clamp-2 leading-tight transition-colors w-full">
                {cat.nameDisplay || cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

HomeScreen.displayName = "HomeScreen";
