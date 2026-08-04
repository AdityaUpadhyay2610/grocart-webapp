import React, { useMemo } from "react";
import { X, Plus, Minus, ShieldCheck, Leaf, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

// Function to generate category-specific mock descriptions, ingredients, and nutrition facts
const getProductDetails = (item) => {
  const category = (item.itemCategory || "").toLowerCase();
  
  if (category.includes("fruit")) {
    return {
      description: `Fresh, hand-picked ${item.itemName} sourced directly from local orchard growers. Grown using natural fertilizers and harvested at peak ripeness to ensure delicious flavor, crisp texture, and maximum nutrient retention. Perfect for snacks, salads, or smoothies.`,
      ingredients: `100% Organic ${item.itemName}`,
      sourcedFrom: "Nashik Farms, Maharashtra",
      nutrition: { calories: "52 kcal", protein: "0.3 g", carbs: "14 g", fat: "0.2 g", fiber: "2.4 g" }
    };
  }
  if (category.includes("vegetable")) {
    return {
      description: `Freshly harvested ${item.itemName}, washed and packed under strict hygiene conditions. Rich in dietary fiber, vitamins, and minerals, making it an essential addition to your daily healthy meals, soups, and curries.`,
      ingredients: `100% Fresh ${item.itemName}`,
      sourcedFrom: "Local Vegetable Cooperatives, Haryana",
      nutrition: { calories: "22 kcal", protein: "1.1 g", carbs: "4.5 g", fat: "0.1 g", fiber: "1.8 g" }
    };
  }
  if (category.includes("beverage")) {
    return {
      description: `Refresh and rehydrate with ${item.itemName}. A delightful flavor profile crafted to quench your thirst and revitalize your senses. Best served chilled. Keep refrigerated after opening.`,
      ingredients: "Water, Natural Extracts, Cane Sugar, Acidity Regulators, Permitted Flavors",
      sourcedFrom: "Bottled at ISO-certified regional facilities",
      nutrition: { calories: "40 kcal", protein: "0 g", carbs: "10.5 g", fat: "0 g", sodium: "12 mg" }
    };
  }
  if (category.includes("bread") || category.includes("biscuits")) {
    return {
      description: `Soft, oven-fresh ${item.itemName} made with high-quality grains. Baked daily to deliver a rich aroma and perfect texture. An excellent choice for a wholesome breakfast toast or teatime snack.`,
      ingredients: "Whole Wheat Flour, Yeast, Water, Sugar, Edible Vegetable Oil, Iodized Salt, Preservatives",
      sourcedFrom: "GroCart Bakery Division",
      nutrition: { calories: "265 kcal", protein: "8.5 g", carbs: "49 g", fat: "3.2 g", fiber: "6 g" }
    };
  }
  if (category.includes("chocolate") || category.includes("sweet")) {
    return {
      description: `Indulge in the rich, velvety taste of ${item.itemName}. Crafted from premium cocoa beans and finest ingredients to offer a melt-in-the-mouth chocolatey goodness. Perfect for sweet cravings or gifting.`,
      ingredients: "Sugar, Cocoa Butter, Milk Solids, Cocoa Mass, Emulsifiers, Added Flavors",
      sourcedFrom: "Artisanal Chocolatiers, Ooty",
      nutrition: { calories: "530 kcal", protein: "6.2 g", carbs: "58 g", fat: "30 g", calcium: "120 mg" }
    };
  }
  if (category.includes("munchies") || category.includes("packed")) {
    return {
      description: `Crispy, crunchy, and packed with flavor, ${item.itemName} is the perfect companion for your evening tea, movie nights, or quick hunger pangs. Packaged under modified atmosphere to preserve freshness.`,
      ingredients: "Dehydrated Potatoes/Grains, Edible Vegetable Oil, Spices & Condiments, Salt",
      sourcedFrom: "Regional Snack Hubs",
      nutrition: { calories: "540 kcal", protein: "7 g", carbs: "53 g", fat: "33 g", sodium: "780 mg" }
    };
  }
  if (category.includes("dairy")) {
    return {
      description: `Creamy, pasteurized, and wholesome ${item.itemName} packed with the goodness of calcium and essential vitamins. Sourced daily from selected dairy farms ensuring maximum purity and freshness.`,
      ingredients: "100% Fresh Cow/Buffalo Milk/Dairy Solids",
      sourcedFrom: "Cooperative Dairy Union, Anand",
      nutrition: { calories: "64 kcal", protein: "3.3 g", carbs: "4.7 g", fat: "3.5 g", calcium: "120 mg" }
    };
  }
  
  // Default values
  return {
    description: `High-quality ${item.itemName} carefully selected and processed under clean conditions. A premium choice for your daily household needs, offering great taste and excellent value.`,
    ingredients: "Premium Grade Ingredients",
    sourcedFrom: "Sourced & Distributed by GroCart Logistics",
    nutrition: { calories: "120 kcal", protein: "4 g", carbs: "22 g", fat: "2 g", sodium: "45 mg" }
  };
};

export const ProductDetailModal = React.memo(({ product, onClose }) => {
  const { cartItems, addToCart, decreaseCartItem } = useCart();

  const details = useMemo(() => {
    if (!product) return null;
    return getProductDetails(product);
  }, [product]);

  if (!product) return null;

  const originalPrice = product.itemPrice;
  const discountedPrice = Math.floor(originalPrice * 75 / 100);
  const cartItem = cartItems.find(i => i.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in select-none">
      {/* Modal Container */}
      <div className="bg-white dark:bg-[#111724] border border-slate-150 dark:border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in max-h-[90vh] md:max-h-[85vh]">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/85 dark:bg-slate-850/85 backdrop-blur-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-850 shadow-md cursor-pointer z-50 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side: Product Image & Badges */}
        <div className="w-full md:w-1/2 bg-slate-50 dark:bg-[#0c101a] p-4 md:p-6 flex flex-col justify-center items-center relative min-h-[160px] md:min-h-full border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/80">
          <div className="absolute top-4 left-4 flex flex-col space-y-1.5 items-start">
            <span className="bg-primary-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              {product.itemCategory}
            </span>
            <span className="bg-accent-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              25% OFF
            </span>
          </div>

          <img
            src={product.imageUrl}
            alt={product.itemName}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 object-cover rounded-3xl shadow-sm dark:brightness-95 animate-float mt-4"
            onError={(e) => { e.target.src = "https://placehold.co/200x200/f1f5f9/10b981?text=Fresh+Product"; }}
          />

          <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-slate-400 dark:text-slate-505">
            <ShieldCheck size={14} className="text-primary-500" />
            <span>100% Quality Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between flex-1 overflow-y-auto">
          <div>
            {/* Title & Size */}
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-black text-slate-850 dark:text-white tracking-tight leading-tight">
                {product.itemName}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1.5 bg-slate-50 dark:bg-slate-850/50 inline-block px-2.5 py-1 rounded-full border border-slate-100 dark:border-slate-800/40">
                Pack Size: {product.itemQuantity}
              </p>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-2.5 my-4 text-left">
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                ₹{discountedPrice}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{originalPrice}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-slate-100 dark:border-slate-800/80 my-3" />

            {/* Description & Source */}
            <div className="text-left space-y-3.5">
              <div>
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Product Description</h4>
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold mt-1">
                  {details?.description}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50/40 dark:bg-primary-950/20 p-2.5 rounded-xl border border-primary-100/10">
                <Leaf size={14} className="flex-shrink-0" />
                <span>{details?.sourcedFrom}</span>
              </div>

              {/* Nutritional Table */}
              <div>
                <h4 className="text-xs font-black text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2">Nutritional Values (Approx. per 100g)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(details?.nutrition || {}).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 dark:bg-slate-850/50 border border-slate-100 dark:border-slate-800/40 rounded-xl p-2 text-center">
                      <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{key}</span>
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Item Subtotal</span>
              <span className="text-lg font-black text-slate-850 dark:text-white">
                ₹{discountedPrice * (quantity || 1)}
              </span>
            </div>

            {quantity > 0 ? (
              <div className="flex items-center space-x-3.5 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/10 dark:border-primary-900/30 rounded-2xl px-3.5 py-1.5">
                <button
                  onClick={() => decreaseCartItem(cartItem)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-[#111724] flex items-center justify-center text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black text-slate-700 dark:text-slate-200 min-w-[14px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => addToCart(product)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-[#111724] flex items-center justify-center text-primary-500 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product)}
                className="flex-1 py-3.5 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer max-w-[200px]"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Animations styling */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
});

ProductDetailModal.displayName = "ProductDetailModal";
