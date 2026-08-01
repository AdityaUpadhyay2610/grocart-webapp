import React, { useMemo, useState, useCallback } from "react";
import { useParams } from "react-router";
import { useCart } from "../context/CartContext";
import { matchCategory, CATEGORIES } from "../models/Categories";
import { Minus, Plus } from "lucide-react";

export const ProductsScreen = React.memo(({ category: propCategory, products }) => {
  const { cartItems, addToCart, decreaseCartItem, triggerAddToCartAnimation } = useCart();
  const [flyingItems, setFlyingItems] = useState([]);
  const { categoryId } = useParams();

  const category = useMemo(() => {
    if (propCategory) return propCategory;
    if (!categoryId) return null;
    const decoded = decodeURIComponent(categoryId);
    return CATEGORIES.find(c => 
      String(c.id) === decoded || 
      c.name.toLowerCase() === decoded.toLowerCase()
    ) || { name: decoded, nameDisplay: decoded };
  }, [propCategory, categoryId]);

  const categoryName = useMemo(() => {
    return category?.nameDisplay || category?.name || "Products";
  }, [category]);

  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter(product => matchCategory(product.itemCategory, category.name));
  }, [category, products]);

  const handleAddClick = useCallback((e, item) => {
    e.stopPropagation();
    
    // Trigger Context animation
    triggerAddToCartAnimation(item);
    addToCart(item);

    // Local screen flying animation
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    
    setFlyingItems(prev => [...prev, {
      id,
      imageUrl: item.imageUrl,
      startX: rect.left,
      startY: rect.top
    }]);

    setTimeout(() => {
      setFlyingItems(prev => prev.filter(f => f.id !== id));
    }, 850);
  }, [addToCart, triggerAddToCartAnimation]);

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent relative px-4">
      {/* Category Header */}
      <div className="flex justify-between items-center py-5 border-b border-gray-150 dark:border-slate-800/80">
        <h2 className="text-2xl font-black text-slate-850 dark:text-slate-100 tracking-tight">
          {categoryName}
        </h2>
        <span className="text-sm font-bold text-gray-400 dark:text-slate-400">
          {filteredProducts.length} items available
        </span>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-6">
          {filteredProducts.map(item => {
            const originalPrice = item.itemPrice;
            const discountedPrice = Math.floor(originalPrice * 75 / 100);
            const cartItem = cartItems.find(i => i.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div 
                key={item.id}
                className="bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all relative"
              >
                <div className="flex justify-center mb-3">
                  <img 
                    src={item.imageUrl} 
                    alt={item.itemName} 
                    className="w-32 h-32 object-cover rounded-2xl"
                    onError={(e) => { e.target.src = "https://placehold.co/100x100/f1f5f9/7c3aed?text=Product"; }}
                  />
                </div>
                <div className="flex flex-col flex-1 justify-between text-center">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight min-h-[40px]">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-slate-450 mt-1 font-semibold">{item.itemQuantity}</p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/60">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 line-through">
                        ₹{originalPrice}
                      </span>
                      <span className="text-base font-black text-violet-600 dark:text-violet-400">
                        ₹{discountedPrice}
                      </span>
                    </div>
                    
                    {quantity > 0 ? (
                      <div className="flex items-center space-x-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-150 dark:border-slate-800 rounded-xl px-2 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseCartItem(cartItem);
                          }}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-[#151C2C] flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 min-w-[12px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="w-6 h-6 rounded-lg bg-white dark:bg-[#151C2C] flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleAddClick(e, item)}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-violet-200 transition-all active:scale-95 cursor-pointer"
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

      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img src="/empty_box.webp" alt="No items" className="w-40 h-40 object-contain opacity-50" />
          <p className="text-gray-400 font-medium mt-4">No items available in this category</p>
        </div>
      )}

      {/* Fly-to-cart animations overlay */}
      {flyingItems.map(fly => (
        <div 
          key={fly.id}
          className="fixed pointer-events-none z-50 animate-fly-to-cart"
          style={{
            "--start-x": `${fly.startX}px`,
            "--start-y": `${fly.startY}px`,
            left: fly.startX,
            top: fly.startY
          }}
        >
          <img 
            src={fly.imageUrl} 
            alt="flying" 
            className="w-12 h-12 object-cover rounded-full border border-cyan-200 shadow-lg bg-white"
          />
        </div>
      ))}

      {/* Embedded CSS animation for flying items */}
      <style>{`
        @keyframes flyToCart {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(50vw - var(--start-x) - 24px), calc(100vh - var(--start-y) - 150px)) scale(0.6);
            opacity: 0.8;
          }
          100% {
            transform: translate(calc(50vw - var(--start-x) - 24px), calc(100vh - var(--start-y) - 80px)) scale(0.1);
            opacity: 0;
          }
        }
        .animate-fly-to-cart {
          animation: flyToCart 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
});

ProductsScreen.displayName = "ProductsScreen";

