import React, { useMemo, useCallback } from "react";
import { CATEGORIES } from "../models/Categories";
import { useCart } from "../context/CartContext";

export const HomeScreen = React.memo(({ products, onCategoryClick }) => {
  const { addToCart, triggerAddToCartAnimation } = useCart();

  // Shuffled recommended items (take 8 on larger screens, 6 on mobile, memoized)
  const recommendedItems = useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  }, [products]);

  const handleAddToCart = useCallback((e, item) => {
    e.stopPropagation();
    triggerAddToCartAnimation(item);
    addToCart(item);
  }, [addToCart, triggerAddToCartAnimation]);

  return (
    <div className="flex flex-col space-y-8 pb-28 select-none w-full max-w-7xl mx-auto">
      {/* Banner Section */}
      <div className="relative w-full h-44 rounded-3xl bg-gradient-to-r from-amber-200 to-amber-400 p-8 flex justify-between items-center shadow-sm overflow-hidden">
        <div className="flex flex-col items-start z-10">
          <span className="bg-white/40 backdrop-blur-sm text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-md">
            LIMITED OFFER
          </span>
          <h3 className="text-3xl md:text-4xl font-black text-amber-950 mt-2 tracking-tight">Mega Sale</h3>
          <p className="text-sm md:text-base font-bold text-amber-900 mt-1">Up to 50% OFF</p>
          <button 
            onClick={() => onCategoryClick(CATEGORIES[0])}
            className="mt-4 px-6 py-2 bg-amber-950 text-white text-xs font-black rounded-xl shadow hover:bg-amber-900 transition-colors"
          >
            Shop Now
          </button>
        </div>
        <img 
          src="/munchies.webp" 
          alt="Sale banner item" 
          className="w-32 h-32 md:w-36 md:h-36 object-contain opacity-90 animate-float"
          onError={(e) => { e.target.src = "https://placehold.co/100x100/fcd34d/78350f?text=Sale"; }}
        />
      </div>

      {/* Recommended Section */}
      {recommendedItems.length > 0 && (
        <div className="flex flex-col space-y-4 text-left">
          <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Recommended for you</h2>
          <div className="flex space-x-4 overflow-x-auto no-scrollbar py-2 px-1">
            {recommendedItems.map(item => (
              <div 
                key={item.id}
                className="w-40 flex-shrink-0 bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800/80 rounded-3xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all relative"
              >
                <div className="flex justify-center mb-3">
                  <img 
                    src={item.imageUrl} 
                    alt={item.itemName} 
                    className="w-24 h-24 object-cover rounded-2xl"
                    onError={(e) => { e.target.src = "https://placehold.co/80x80/f1f5f9/7c3aed?text=Groceries"; }}
                  />
                </div>
                <div className="flex flex-col flex-1 justify-between">
                  <div className="text-left">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 line-clamp-2 min-h-[32px] leading-tight">
                      {item.itemName}
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-1 font-semibold">{item.itemQuantity}</p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50 dark:border-slate-800/60">
                    <span className="text-sm font-black text-violet-600 dark:text-violet-400">
                      ₹{Math.floor(item.itemPrice * 75 / 100)}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="px-3.5 py-1.5 bg-cyan-50 dark:bg-cyan-950/40 text-violet-600 dark:text-violet-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 font-extrabold text-[10px] rounded-lg border border-cyan-100 dark:border-violet-900/40 transition-colors cursor-pointer"
                    >
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shop By Category */}
      <div className="flex flex-col space-y-4 text-left">
        <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Shop By Category</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9 xl:grid-cols-10 gap-6 py-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => onCategoryClick(cat)}
              className="flex flex-col items-center focus:outline-none group active:scale-95 transition-transform"
            >
              <div 
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800/80 transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: cat.bgColor }}
              >
                <img 
                  src={cat.image} 
                  alt={cat.nameDisplay || cat.name} 
                  className="w-14 h-14 object-contain"
                  onError={(e) => { e.target.src = "https://placehold.co/48x48/f1f5f9/7c3aed?text=Category"; }}
                />
              </div>
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 text-center mt-2.5 line-clamp-2 w-20 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
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


