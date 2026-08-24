import React, { useMemo, useState, useCallback } from "react";
import { useParams, useOutletContext } from "react-router";
import { useCart } from "../state/CartContext";
import { matchCategory } from "@global/models/Categories";
import { Minus, Plus, ShieldCheck } from "lucide-react";

const getUniqueImageUrl = (url, id, title) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((title || 'Product').trim())}&background=random&color=fff&size=400&font-size=0.33&length=2&bold=true`;
  if (!url) return fallback;
  if (typeof url === 'string' && (url.includes("loremflickr.com") || url.includes("pollinations.ai"))) {
    return fallback;
  }
  return url;
};

export const ProductsScreen = React.memo(({ category: propCategory, products }) => {
  const { cartItems, addToCart, decreaseCartItem, triggerAddToCartAnimation } = useCart();
  const { setSelectedProduct, categories = [] } = useOutletContext();
  const [flyingItems, setFlyingItems] = useState([]);
  const { categoryId } = useParams();

  const category = useMemo(() => {
    if (propCategory) return propCategory;
    if (!categoryId) return null;
    const decoded = decodeURIComponent(categoryId);
    return categories.find(c => 
      String(c.id) === decoded || 
      c.name.toLowerCase() === decoded.toLowerCase()
    ) || { name: decoded, nameDisplay: decoded };
  }, [propCategory, categoryId, categories]);

  const categoryName = useMemo(() => {
    return category?.nameDisplay || category?.name || "Products";
  }, [category]);

  const filteredProducts = useMemo(() => {
    if (!category) return products;
    return products.filter(product => matchCategory(product.itemCategory, category.name));
  }, [category, products]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage]);

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
      imageUrl: getUniqueImageUrl(item.imageUrl, item.id, item.itemName),
      startX: rect.left,
      startY: rect.top
    }]);

    setTimeout(() => {
      setFlyingItems(prev => prev.filter(f => f.id !== id));
    }, 850);
  }, [addToCart, triggerAddToCartAnimation]);

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent relative px-4 animate-fade-in">
      
      {/* Category Header */}
      <div className="flex justify-between items-end py-6 border-b border-slate-100 dark:border-slate-800/40">
        <div className="text-left">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {categoryName}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1">
            Carefully sourced premium {categoryName.toLowerCase()} products
          </p>
        </div>
        <span className="text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-xl border border-transparent dark:border-slate-850">
          {filteredProducts.length} items
        </span>
      </div>

      {/* Grid */}
      {paginatedProducts.length > 0 ? (
        <div className="flex flex-col space-y-6 pb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 py-6">
            {paginatedProducts.map(item => {
            const originalPrice = item.itemCost || item.itemPrice;
            const discountedPrice = item.itemPrice;
            const discountPercent = originalPrice > discountedPrice 
              ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
              : 0;
            const cartItem = cartItems.find(i => i.id === item.id);
            const quantity = cartItem ? cartItem.quantity : 0;

            return (
              <div 
                key={item.id}
                onClick={() => setSelectedProduct(item)}
                className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md dark:shadow-none transition-all cursor-pointer hover:scale-[1.02] active:scale-98 relative group"
              >
                {/* Floating Off percentage tag */}
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-accent-100/10">
                    {discountPercent}% OFF
                  </div>
                )}

                <div className="flex justify-center mb-3 mt-2 overflow-hidden rounded-2xl">
                  <img 
                    src={getUniqueImageUrl(item.imageUrl, item.id, item.itemName)} 
                    alt={item.itemName} 
                    className="w-32 h-32 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://placehold.co/120x120/f1f5f9/10b981?text=Fresh+Cart"; }}
                  />
                </div>
                <div className="flex flex-col flex-1 justify-between text-center">
                  <div>
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight min-h-[40px] group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-bold">{item.itemQuantity}</p>
                  </div>

                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/40">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-slate-400 line-through">
                        ₹{originalPrice}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-base font-black text-slate-850 dark:text-white">
                          ₹{discountedPrice}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500">
                          / {item.unitSize ? `${item.unitSize} ${item.unit || 'pcs'}` : (item.unit || item.itemQuantity || '1 pcs')}
                        </span>
                      </div>
                    </div>
                    
                    {item.itemStock <= 0 ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-extrabold text-[10px] rounded-xl cursor-not-allowed"
                      >
                        OUT OF STOCK
                      </button>
                    ) : quantity > 0 ? (
                      <div className="flex items-center space-x-2 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/10 dark:border-primary-900/30 rounded-xl px-1.5 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decreaseCartItem(cartItem);
                          }}
                          className="w-5.5 h-5.5 rounded-lg bg-white dark:bg-[#111724] flex items-center justify-center text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-200 min-w-[12px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (quantity < item.itemStock) addToCart(item);
                          }}
                          disabled={quantity >= item.itemStock}
                          className={`w-5.5 h-5.5 rounded-lg bg-white dark:bg-[#111724] flex items-center justify-center shadow-sm border transition-colors ${
                            quantity >= item.itemStock
                              ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                              : 'text-primary-500 hover:bg-slate-50 border-slate-100 cursor-pointer'
                          }`}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleAddClick(e, item)}
                        className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
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
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <img src="/empty_box.webp" alt="No items" className="w-40 h-40 object-contain opacity-50" />
          <p className="text-slate-400 font-medium mt-4">No items available in this category</p>
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
            className="w-12 h-12 object-cover rounded-full border-2 border-primary-500 shadow-lg bg-white"
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
