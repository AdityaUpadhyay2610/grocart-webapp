import React, { useMemo, useState, useCallback } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router";
import { useCart } from "../state/CartContext";
import { matchCategory } from "@global/models/Categories";
import { formatINR, calculateUnitPrice, getAvailableUnits } from "@global/utils/calculations";
import { Heart, Plus, Minus, X, Check, SlidersHorizontal, ChevronDown } from "lucide-react";

const getUniqueImageUrl = (url, id, title) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((title || 'Product').trim())}&background=random&color=fff&size=400&font-size=0.33&length=2&bold=true`;
  if (!url) return fallback;
  if (typeof url === 'string' && (url.includes("loremflickr.com") || url.includes("pollinations.ai"))) {
    return fallback;
  }
  return url;
};

// Smoothie Recipe for the aside widget
const QUICK_RECIPE = {
  id: "green-smoothie",
  title: "Morning Green Smoothie",
  badge: "Quick Recipe",
  prepTime: "5 mins",
  description: "A nutrient-packed energizer made with crisp spinach, crisp green apples, bananas, and coconut water.",
  image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&auto=format&fit=crop&q=80",
  ingredients: [
    { id: "sm-1", itemName: "Baby Spinach", itemPrice: 40, itemQuantity: "200g", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80" },
    { id: "sm-2", itemName: "Green Apples", itemPrice: 120, itemQuantity: "500g", imageUrl: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=400&auto=format&fit=crop&q=80" },
    { id: "sm-3", itemName: "Fresh Bananas", itemPrice: 50, itemQuantity: "1 Dozen", imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80" },
    { id: "sm-4", itemName: "Tender Coconut Water", itemPrice: 60, itemQuantity: "1 Pack", imageUrl: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&auto=format&fit=crop&q=80" }
  ],
  instructions: [
    "Rinse baby spinach leaves thoroughly in cold water.",
    "Core green apples and dice into bite-sized chunks.",
    "Add spinach, apple chunks, banana, and coconut water into a blender.",
    "Blend on high speed for 60 seconds until silky smooth. Serve immediately with ice cubes!"
  ]
};

export const ProductsScreen = React.memo(({ category: propCategory, products = [] }) => {
  const { cartItems, addToCart, decreaseCartItem, triggerAddToCartAnimation } = useCart();
  const { setSelectedProduct, categories = [] } = useOutletContext() || {};
  const { categoryId } = useParams();
  const navigate = useNavigate();

  // Wishlist & Filter States
  const [wishlist, setWishlist] = useState(() => new Set());
  const [activeSubcategory, setActiveSubcategory] = useState("All Items");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedDietary, setSelectedDietary] = useState(() => new Set());
  const [selectedBrands, setSelectedBrands] = useState(() => new Set());
  const [sortBy, setSortBy] = useState("featured");
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [addedRecipeToast, setAddedRecipeToast] = useState(false);
  const [selectedUnitMap, setSelectedUnitMap] = useState({});

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

  const toggleWishlist = useCallback((e, itemId) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const toggleDietary = useCallback((diet) => {
    setSelectedDietary(prev => {
      const next = new Set(prev);
      if (next.has(diet)) next.delete(diet);
      else next.add(diet);
      return next;
    });
  }, []);

  const toggleBrand = useCallback((brand) => {
    setSelectedBrands(prev => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setMinPrice(0);
    setMaxPrice(500);
    setSelectedDietary(new Set());
    setSelectedBrands(new Set());
    setActiveSubcategory("All Items");
  }, []);

  // Filtered & Sorted Products
  const processedProducts = useMemo(() => {
    let list = products || [];
    if (category) {
      list = list.filter(product => matchCategory(product.itemCategory, category.name));
    }

    // Fallback if current category is empty in DB
    if (list.length === 0 && products.length > 0) {
      list = products.slice(0, 12);
    }

    // Price Filter
    list = list.filter(item => item.itemPrice >= minPrice && item.itemPrice <= maxPrice);

    // Sort
    if (sortBy === "price-low") {
      list.sort((a, b) => a.itemPrice - b.itemPrice);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.itemPrice - a.itemPrice);
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.itemName || "").localeCompare(b.itemName || ""));
    }

    return list;
  }, [products, category, minPrice, maxPrice, sortBy]);

  const handleAddAllRecipeIngredients = useCallback(() => {
    QUICK_RECIPE.ingredients.forEach(item => {
      addToCart(item);
    });
    setShowRecipeModal(false);
    setAddedRecipeToast(true);
    setTimeout(() => setAddedRecipeToast(false), 3000);
  }, [addToCart]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-28 select-none min-h-screen text-left animate-fade-in gap-8">
      
      {/* ── 1. TEXTURED HEADER BANNER ── */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-on-primary-fixed-variant shadow-lg p-6 sm:p-10 flex flex-col justify-between min-h-[160px] md:min-h-[190px]">
        {/* Background texture */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-primary-fixed-variant via-on-primary-fixed-variant/95 to-primary/40" />
        </div>

        {/* Breadcrumb & Title */}
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-surface-container-low/75">
            <span onClick={() => navigate("/home")} className="hover:text-white cursor-pointer">Home</span>
            <span>/</span>
            <span onClick={() => navigate("/categories")} className="hover:text-white cursor-pointer">Categories</span>
            <span>/</span>
            <span className="text-white font-bold">{categoryName}</span>
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="font-display-lg text-pure-white text-3xl sm:text-4xl font-black">{categoryName}</h1>
            <span className="px-3 py-0.5 bg-white/20 text-white rounded-full text-xs font-bold backdrop-blur-sm">
              {processedProducts.length} items
            </span>
          </div>
        </div>

        {/* Subcategory Filter Tabs */}
        <div className="relative z-10 flex items-center gap-2 mt-4 overflow-x-auto hide-scrollbar pt-2">
          {["All Items", "Organic Certified", "Farm Fresh", "Imported / Exotic", "Budget Saver"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubcategory(tab)}
              className={`px-4 py-1.5 rounded-xl font-label-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeSubcategory === tab 
                  ? 'bg-primary-container text-on-primary shadow-md' 
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* ── 2. MAIN 12-COLUMN LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left Sidebar: Filters & Recipe Aside Widget (4 cols) ── */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          
          {/* Filters Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-surface-variant/30 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                <h3 className="font-headline-md text-base font-bold text-on-surface">Filters</h3>
              </div>
              <button 
                onClick={clearFilters}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Price Range Slider */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold text-on-surface">
                <span>Price Range</span>
                <span className="text-primary">{formatINR(minPrice, false)} - {formatINR(maxPrice, false)}</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="500" 
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant font-medium">
                <span>₹0</span>
                <span>₹250</span>
                <span>₹500+</span>
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-surface-variant/30">
              <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface">Dietary & Quality</h4>
              {["100% Organic", "Locally Sourced", "Non-GMO", "Pesticide Free"].map(diet => (
                <label key={diet} className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox"
                    checked={selectedDietary.has(diet)}
                    onChange={() => toggleDietary(diet)}
                    className="rounded text-primary focus:ring-primary accent-primary w-4 h-4"
                  />
                  <span>{diet}</span>
                </label>
              ))}
            </div>

            {/* Brands / Sourced Regions */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-surface-variant/30">
              <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface">Brand & Farms</h4>
              {["Himalayan Orchards", "Nilgiri Fresh", "Valley Farms", "Organic India"].map(brand => (
                <label key={brand} className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox"
                    checked={selectedBrands.has(brand)}
                    onChange={() => toggleBrand(brand)}
                    className="rounded text-primary focus:ring-primary accent-primary w-4 h-4"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>

            {/* Quick Category Switcher */}
            <div className="flex flex-col gap-2 pt-4 border-t border-surface-variant/30">
              <div className="flex justify-between items-center">
                <h4 className="font-label-md text-xs font-bold uppercase tracking-wider text-on-surface">All Categories</h4>
                <button 
                  onClick={() => navigate("/categories")}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {categories.map(c => {
                  const isCurrent = category && (
                    c.name.toLowerCase() === category.name.toLowerCase() ||
                    (category.nameDisplay && c.name.toLowerCase() === category.nameDisplay.toLowerCase())
                  );
                  return (
                    <button
                      key={c.id || c.name}
                      onClick={() => navigate(`/categories/${encodeURIComponent(c.name)}`)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent 
                          ? 'bg-primary text-on-primary' 
                          : 'text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{c.nameDisplay || c.name}</span>
                      <span className="text-[10px] opacity-75">{isCurrent ? "✓" : "→"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>


          {/* Quick Recipes Aside Widget */}
          <div className="bg-gradient-to-br from-surface-tint to-primary rounded-3xl p-6 shadow-md text-white flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                {QUICK_RECIPE.badge}
              </span>
              <span className="text-[11px] font-bold text-white/80">⏱ {QUICK_RECIPE.prepTime}</span>
            </div>

            <div className="flex gap-3 items-center">
              <img src={QUICK_RECIPE.image} alt={QUICK_RECIPE.title} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
              <div>
                <h4 className="font-headline-md text-sm font-extrabold leading-tight">{QUICK_RECIPE.title}</h4>
                <p className="text-[11px] text-white/80 mt-1 line-clamp-2">{QUICK_RECIPE.description}</p>
              </div>
            </div>

            <button 
              onClick={() => setShowRecipeModal(true)}
              className="w-full py-2.5 bg-white text-primary font-label-md text-xs font-bold rounded-xl hover:bg-surface-container-lowest transition-all shadow-sm cursor-pointer"
            >
              View Recipe & Ingredients
            </button>
          </div>
        </div>

        {/* ── Right: Product Listing Grid (8 cols) ── */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Sort & Count Bar */}
          <div className="flex justify-between items-center bg-surface-container-lowest rounded-2xl px-5 py-3 border border-surface-variant/40 shadow-sm">
            <span className="font-body-md text-xs font-bold text-on-surface">
              Showing <span className="text-primary">{processedProducts.length}</span> fresh products
            </span>

            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs text-on-surface-variant hidden sm:inline font-semibold">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-container-low border border-surface-variant/40 rounded-xl px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Product Cards Grid */}
          {processedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {processedProducts.map(item => {
                const isWishlisted = wishlist.has(item.id);
                const availableUnits = getAvailableUnits(item);
                const selectedUnit = selectedUnitMap[item.id] || item.itemQuantity || availableUnits[1] || availableUnits[0] || "500g";
                const unitAdjustedPrice = calculateUnitPrice(item.itemPrice, selectedUnit, item.itemQuantity || "500g");
                const unitAdjustedCost = calculateUnitPrice(item.itemCost || Math.round(item.itemPrice * 1.25), selectedUnit, item.itemQuantity || "500g");

                const cartItemId = `${item.id}_${selectedUnit.replace(/\s+/g, '')}`;
                const cartItem = cartItems.find(i => i.id === cartItemId || (i.productId === item.id && i.itemQuantity === selectedUnit) || (i.id === item.id && (!i.itemQuantity || i.itemQuantity === selectedUnit)));
                const quantity = cartItem ? cartItem.quantity : 0;

                const itemPayload = {
                  ...item,
                  cartItemId,
                  itemQuantity: selectedUnit,
                  itemPrice: unitAdjustedPrice,
                  itemCost: unitAdjustedCost
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduct && setSelectedProduct(itemPayload)}
                    className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-variant/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 group relative cursor-pointer"
                  >
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => toggleWishlist(e, item.id)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center transition-colors z-10 cursor-pointer ${
                        isWishlisted ? 'text-tertiary bg-error-container/40' : 'text-on-surface-variant hover:text-tertiary'
                      }`}
                    >
                      <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                    </button>

                    {/* Image */}
                    <div className="h-36 w-full rounded-xl bg-gradient-to-b from-surface-container-lowest to-surface-container/40 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getUniqueImageUrl(item.imageUrl, item.id, item.itemName)}
                        alt={item.itemName}
                        className="h-32 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = "https://placehold.co/120x120/f1f5f9/10b981?text=Produce"; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-1 text-left">
                      <span className="font-label-sm text-[10px] font-bold text-primary uppercase tracking-wider">
                        {item.itemCategory || categoryName}
                      </span>
                      <h4 className="font-headline-md text-sm font-bold text-on-surface line-clamp-1 leading-tight">
                        {item.itemName}
                      </h4>
                      
                      {/* Unit Size Selector */}
                      <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                        <select 
                          value={selectedUnit}
                          onChange={(e) => setSelectedUnitMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-full bg-surface-container-low border border-surface-variant/30 rounded-lg px-2 py-1 text-[11px] font-bold text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                        >
                          {availableUnits.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Price & Stepper / Add */}
                    <div className="flex items-center justify-between pt-3 border-t border-surface-variant/30 mt-1">
                      <div className="flex flex-col text-left">
                        <span className="font-label-sm text-[10px] text-slate-text line-through opacity-75">{formatINR(unitAdjustedCost, false)}</span>
                        <span className="font-headline-md text-base font-black text-on-surface">{formatINR(unitAdjustedPrice)}</span>
                      </div>

                      {quantity > 0 ? (
                        <div className="flex items-center space-x-1.5 bg-primary-50 dark:bg-primary-950/20 border border-primary-200/50 rounded-xl px-1.5 py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decreaseCartItem(cartItem);
                            }}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-[#111724] flex items-center justify-center text-primary hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-black text-on-surface min-w-[14px] text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(itemPayload);
                            }}
                            className="w-6 h-6 rounded-lg bg-white dark:bg-[#111724] flex items-center justify-center text-primary hover:bg-slate-50 shadow-sm transition-colors cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerAddToCartAnimation(itemPayload);
                            addToCart(itemPayload);
                          }}
                          className="px-4 py-2 bg-primary text-on-primary font-label-md text-xs font-bold rounded-xl hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-3xl p-12 text-center border border-surface-variant/40 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">inventory_2</span>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">No products match your filters</h3>
              <p className="text-xs text-on-surface-variant max-w-sm">Try adjusting your price range or clearing selected dietary options.</p>
              <button 
                onClick={clearFilters}
                className="mt-2 px-5 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RECIPE MODAL ── */}
      {showRecipeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-surface-variant/40 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{QUICK_RECIPE.badge}</span>
                <h3 className="font-headline-md text-2xl font-black text-on-surface mt-0.5">{QUICK_RECIPE.title}</h3>
              </div>
              <button onClick={() => setShowRecipeModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <img src={QUICK_RECIPE.image} alt={QUICK_RECIPE.title} className="w-full h-44 object-cover rounded-2xl mb-4" />

            <p className="text-sm text-on-surface-variant mb-4">{QUICK_RECIPE.description}</p>

            <h4 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Ingredients Needed:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {QUICK_RECIPE.ingredients.map(ing => (
                <div key={ing.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30">
                  <div className="flex items-center gap-2">
                    <img src={ing.imageUrl} alt={ing.itemName} className="w-7 h-7 rounded object-cover" />
                    <span className="text-xs font-bold text-on-surface">{ing.itemName}</span>
                  </div>
                  <span className="text-xs font-extrabold text-primary">{formatINR(ing.itemPrice, false)}</span>
                </div>
              ))}
            </div>

            <h4 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Instructions:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-on-surface-variant mb-6">
              {QUICK_RECIPE.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <button
              onClick={handleAddAllRecipeIngredients}
              className="w-full py-3 bg-primary text-on-primary font-label-md rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>Add All Recipe Ingredients to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {addedRecipeToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-slide-up">
          <Check size={18} />
          <span>Smoothie ingredients added to your cart!</span>
        </div>
      )}
    </div>
  );
});

ProductsScreen.displayName = "ProductsScreen";

