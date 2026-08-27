import React, { useMemo, useState } from "react";
import { X, Plus, Minus, ShieldCheck, Leaf, ShoppingCart } from "lucide-react";
import { useCart } from '../state/CartContext';
import { formatINR, calculateUnitPrice, getAvailableUnits } from '@global/utils/calculations';

const getUniqueImageUrl = (url, id, title) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((title || 'Product').trim())}&background=random&color=fff&size=400&font-size=0.33&length=2&bold=true`;
  if (!url) return fallback;
  if (typeof url === 'string' && (url.includes("loremflickr.com") || url.includes("pollinations.ai"))) {
    return fallback;
  }
  return url;
};

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
  
  if (category.includes("electronics") || category.includes("appliances") || category.includes("tech")) {
    return {
      description: `High-performance ${item.itemName} designed for durability and efficiency. Manufactured with precision engineering to meet your daily technological needs with seamless reliability.`,
      sourcedFrom: "Authorized Brand Distributors",
    };
  }

  if (category.includes("home") || category.includes("cleaning") || category.includes("care")) {
    return {
      description: `Premium ${item.itemName} formulated to deliver outstanding results. Essential for maintaining a clean, fresh, and hygienic home environment effortlessly.`,
      sourcedFrom: "Top-Tier Home Care Brands",
    };
  }

  // Default values
  return {
    description: `High-quality ${item.itemName} carefully selected and packaged. A premium choice for your daily household or personal needs, offering excellent value and reliability.`,
    sourcedFrom: "Sourced & Distributed by GroCart Logistics",
  };
};

export const ProductDetailModal = React.memo(({ product, onClose }) => {
  const { cartItems, addToCart, decreaseCartItem } = useCart();

  const availableUnits = useMemo(() => getAvailableUnits(product), [product]);
  const [selectedUnit, setSelectedUnit] = useState(() => product?.itemQuantity || availableUnits[0] || "500g");

  const details = useMemo(() => {
    if (!product) return null;
    return getProductDetails(product);
  }, [product]);

  if (!product) return null;

  const basePrice = product.itemPrice || 0;
  const baseCost = product.itemCost || Math.round(basePrice * 1.25);
  const baseQuantity = product.itemQuantity || "500g";

  const discountedPrice = calculateUnitPrice(basePrice, selectedUnit, baseQuantity);
  const originalPrice = calculateUnitPrice(baseCost, selectedUnit, baseQuantity);
  const discountPercent = originalPrice > discountedPrice 
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const cartItemId = `${product.id}_${selectedUnit.replace(/\s+/g, '')}`;
  const cartItem = cartItems.find(i => i.id === cartItemId || (i.productId === product.id && i.itemQuantity === selectedUnit) || (i.id === product.id && (!i.itemQuantity || i.itemQuantity === selectedUnit)));
  const quantity = cartItem ? cartItem.quantity : 0;

  const itemPayload = {
    ...product,
    cartItemId,
    itemQuantity: selectedUnit,
    itemPrice: discountedPrice,
    itemCost: originalPrice
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 animate-fade-in select-none">
      {/* Modal Container */}
      <div className="bg-surface-container-low dark:bg-[#171717] border border-surface-variant/40 dark:border-[#262626] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-scale-in max-h-[90vh] md:max-h-[85vh]">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-10 h-10 rounded-full bg-surface-container dark:bg-[#201f1f] backdrop-blur-sm border border-surface-variant/40 dark:border-[#262626] flex items-center justify-center text-on-surface dark:text-white hover:bg-surface-container-high shadow-md cursor-pointer z-50 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Left Side: Product Image & Badges */}
        <div className="w-full md:w-1/2 bg-surface-container-lowest dark:bg-[#0e0e0e] p-4 md:p-6 flex flex-col justify-center items-center relative min-h-[160px] md:min-h-full border-b md:border-b-0 md:border-r border-surface-variant/40 dark:border-[#262626]">
          <div className="absolute top-4 left-4 flex flex-col space-y-1.5 items-start">
            <span className="bg-primary text-white dark:text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
              {product.itemCategory}
            </span>
            {discountPercent > 0 && (
              <span className="bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          <img
            src={getUniqueImageUrl(product.imageUrl, product.id, product.itemName)}
            alt={product.itemName}
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-64 md:h-64 object-cover rounded-3xl shadow-sm dark:brightness-95 animate-float mt-4"
            onError={(e) => { e.target.src = "https://placehold.co/200x200/f1f5f9/10b981?text=Fresh+Product"; }}
          />

          <div className="mt-4 flex items-center space-x-2 text-xs font-bold text-on-surface-variant">
            <ShieldCheck size={14} className="text-primary" />
            <span>100% Quality Guaranteed</span>
          </div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between flex-1 overflow-y-auto">
          <div>
            {/* Title & Size */}
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-black text-on-surface dark:text-white tracking-tight leading-tight">
                {product.itemName}
              </h3>
              {product.retailerStoreName && (
                <p className="text-xs font-semibold text-primary mt-1 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Sold by: {product.retailerStoreName}
                </p>
              )}
              
              {/* Unit Selection Pills */}
              <div className="mt-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant block mb-1.5">Select Amount / Unit</span>
                <div className="flex flex-wrap gap-2">
                  {availableUnits.map(unit => (
                    <button
                      key={unit}
                      onClick={() => setSelectedUnit(unit)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selectedUnit === unit
                          ? 'bg-primary text-white dark:text-black border-primary shadow-sm scale-105'
                          : 'bg-surface-container dark:bg-[#201f1f] text-on-surface dark:text-white border-surface-variant/40 dark:border-[#262626] hover:border-primary'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price section (Changes on Unit Selection) */}
            <div className="flex items-baseline space-x-2.5 my-4 text-left">
              <span className="text-2xl font-black text-primary">
                ₹{discountedPrice}
              </span>
              <span className="text-sm text-on-surface-variant line-through">
                ₹{originalPrice}
              </span>
              <span className="text-sm font-bold text-on-surface-variant">
                / {selectedUnit}
              </span>
            </div>

            {/* Divider */}
            <hr className="border-surface-variant/30 dark:border-[#262626] my-3" />

            {/* Description & Source */}
            <div className="text-left space-y-3.5">
              <div>
                <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-wider">Product Description</h4>
                <p className="text-xs text-on-surface dark:text-gray-300 leading-relaxed font-semibold mt-1">
                  {details?.description}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-bold text-primary bg-primary/10 p-2.5 rounded-xl border border-primary/20">
                <Leaf size={14} className="flex-shrink-0" />
                <span>{details?.sourcedFrom}</span>
              </div>

              {/* Nutritional Table */}
              {details?.nutrition && (
                <div>
                  <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-wider mb-2">Nutritional Values (Approx. per 100g)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(details.nutrition).map(([key, val]) => (
                      <div key={key} className="bg-surface-container dark:bg-[#201f1f] border border-surface-variant/30 dark:border-[#262626] rounded-xl p-2 text-center">
                        <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">{key}</span>
                        <span className="text-xs font-black text-on-surface dark:text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-surface-variant/30 dark:border-[#262626] flex items-center justify-between gap-4">
            <div className="text-left">
              <span className="block text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Item Subtotal</span>
              <span className="text-lg font-black text-on-surface dark:text-white">
                ₹{discountedPrice * (quantity || 1)}
              </span>
            </div>

            {product.itemStock <= 0 ? (
              <button
                disabled
                className="flex-1 py-3.5 bg-surface-container dark:bg-[#201f1f] text-on-surface-variant font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 cursor-not-allowed max-w-[200px]"
              >
                <span>Out of Stock</span>
              </button>
            ) : quantity > 0 ? (
              <div className="flex items-center space-x-3.5 bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] rounded-2xl px-3.5 py-1.5">
                <button
                  onClick={() => decreaseCartItem(cartItem)}
                  className="w-7 h-7 rounded-xl bg-surface-container-high dark:bg-[#2a2a2a] flex items-center justify-center text-primary hover:bg-surface-container-highest shadow-sm border border-surface-variant/40 dark:border-[#262626] transition-colors cursor-pointer"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-black text-on-surface dark:text-white min-w-[14px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (quantity < (product.itemStock || 99)) addToCart(itemPayload);
                  }}
                  disabled={quantity >= (product.itemStock || 99)}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-sm border transition-colors ${
                    quantity >= (product.itemStock || 99)
                      ? 'bg-surface-container dark:bg-[#201f1f] text-on-surface-variant border-surface-variant/40 dark:border-[#262626] cursor-not-allowed'
                      : 'bg-surface-container-high dark:bg-[#2a2a2a] text-primary hover:bg-surface-container-highest border-surface-variant/40 dark:border-[#262626] cursor-pointer'
                  }`}
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(itemPayload)}
                className="flex-1 py-3.5 bg-primary text-on-primary dark:text-black font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center space-x-2 hover:bg-primary-container transition-all active:scale-98 cursor-pointer max-w-[200px]"
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
