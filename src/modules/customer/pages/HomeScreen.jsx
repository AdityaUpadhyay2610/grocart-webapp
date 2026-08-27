import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { useCart } from '../state/CartContext';
import { formatINR, calculateUnitPrice, getAvailableUnits } from '@global/utils/calculations';
import { X, Heart, Plus, Minus, Check, ChevronLeft, ChevronRight } from "lucide-react";

// Featured recipes data for the seasonal trend feature
const SEASONAL_RECIPES = [
  {
    id: "summer-berry-salad",
    title: "Summer Berry Salad",
    badge: "Seasonal Trend",
    description: "A refreshing mix of organic seasonal berries and crisp greens. Perfect for a light, nutritious lunch.",
    prepTime: "10 mins",
    servings: "2 servings",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCSrbkhXjFIhNB9ua69uMGMvLoPsHwShxuGt3jbwMOgvb5He58d9Dm8o2Qb001kvsigKrgdCOkSRoZIi41EHfum3bvFR2Zvy_SgLV28EaDC7Sd0xgAZePv02cEtnJF39csQ2MEFxnSi1AOS-Yan1M3dExlRhfBFac5ocqyOv4WvWmthG1KHkQXaBO5TZkIcw8e7xkh0Do3u0KjtXw_ZrNinIvOTJhAOZIUM5CqalxyaK4NWpb0gxN-7dA",
    ingredients: [
      { id: "ing-1", itemName: "Organic Strawberries", itemPrice: 149, itemQuantity: "250g", imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80" },
      { id: "ing-2", itemName: "Fresh Blueberries", itemPrice: 199, itemQuantity: "125g", imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&auto=format&fit=crop&q=80" },
      { id: "ing-3", itemName: "Baby Spinach Leaves", itemPrice: 65, itemQuantity: "200g", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=80" },
      { id: "ing-4", itemName: "Feta Cheese Crumbles", itemPrice: 180, itemQuantity: "150g", imageUrl: "https://images.unsplash.com/photo-1559561853-08451507cbe7?w=400&auto=format&fit=crop&q=80" }
    ],
    instructions: [
      "Wash and gently dry the fresh baby spinach and berries.",
      "Slice strawberries into halves and place in a large ceramic salad bowl.",
      "Toss with fresh blueberries and organic greens.",
      "Sprinkle feta cheese crumbles and lightly drizzle balsamic glaze before serving."
    ]
  }
];

export const HomeScreen = React.memo(({ products = [], onCategoryClick }) => {
  const { cartItems, addToCart, triggerAddToCartAnimation } = useCart();
  const { setSelectedProduct, categories = [] } = useOutletContext() || {};
  const navigate = useNavigate();

  // Wishlist state for interactive hearts
  const [wishlist, setWishlist] = useState(() => new Set());
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [addedRecipeToast, setAddedRecipeToast] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [selectedUnitMap, setSelectedUnitMap] = useState({});

  // Refs for horizontal scrolling
  const flashDealsScrollRef = useRef(null);
  const categoryScrollRef = useRef(null);

  const scrollFlashDeals = (dir) => {
    if (flashDealsScrollRef.current) {
      flashDealsScrollRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  };

  const scrollCategories = (dir) => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
    }
  };

  // Active flash deal countdown timer state (HH:MM:SS)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 35, seconds: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 35, seconds: 47 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWishlist = useCallback((e, itemId) => {
    e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }, []);

  const handleQuickAdd = useCallback((e, item) => {
    e.stopPropagation();
    triggerAddToCartAnimation(item);
    addToCart(item);
  }, [addToCart, triggerAddToCartAnimation]);

  const handleAddAllRecipeIngredients = useCallback((recipe) => {
    if (!recipe || !recipe.ingredients) return;
    recipe.ingredients.forEach(item => {
      addToCart(item);
    });
    setAddedRecipeToast(true);
    setTimeout(() => setAddedRecipeToast(false), 3000);
  }, [addToCart]);

  // Curated featured products fallback
  const displayFeaturedProducts = useMemo(() => {
    if (products && products.length > 0) {
      return products.slice(0, 10);
    }
    return [
      { id: 'fp-1', itemName: 'Avocados', itemCategory: 'Produce', itemQuantity: '2 Pack, Organic', itemPrice: 249, itemCost: 320, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt92FaApg3tPgCxUNsOdFnGuUAH1EK1StMmxqwQnYA6my0SaCv6HOxEZYpbGuzoTByrcaf-O9_powK8-r6_0aroo4IV7-dJwkymvzbvoL3-kfWxBlVxc8U7qBZRwEHKhfBd0X2HY0aWdgrGEpDkV3r6f5Wuhf07OGsiiZl1S3j__p6CT_5ouFThpWVFNuODCctvbC48WCIaCspFxUMChThRkJq54jw5vL5vIT1HrMoL5plpPSk9uLsvg' },
      { id: 'fp-2', itemName: 'Whole Milk', itemCategory: 'Dairy', itemQuantity: '1 Gallon, Farm Fresh', itemPrice: 85, itemCost: 95, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUhQhOIo4JDs4mjsEWCauLElgKX2CZFDymvpfbq12bJjIFgrlYXnFKIXnDAEibgStp6QufNYTPe07o619Uc3SNFT5d8BzSAWSN4pREKq1EbF-iCWOGnfMo3zatySBSdoOX2xUomDlmKIU33WrCNNGd5D2qySDCYEE8Q0L9pvMr-_rfsnN2K54UPpv799sO9ZI8IjfzHZZo-htI7YxiPo8nyi54Tj5h0BPT6yzSc7RiElMDpiBhLL6DOg' },
      { id: 'fp-3', itemName: 'Wheat Bread', itemCategory: 'Bakery', itemQuantity: 'Sliced, 24oz', itemPrice: 45, itemCost: 55, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOH4f6OU-X1TmnZplrcs7JnqmLxsZWKuYZFZAudy3vLR_rhzWaMGrj3wlW62hyFB2id4JSZI93a6ZXlkB_MKnsY7-nQa7yBafzGtaIb3OCZWMFS4rYCRzFTEiWkFaCGqqy96f8rmRjvZeGDJvCAiyEv_78LTg5dWUC_fuJ6iYpPDKcedPr9H2rovoUBwJOe7q5CtAbwViFtF8ulKBFb5YVVmRUsj8IT8-XyIh86JP0sBmXVlbGIYj0tA' },
      { id: 'fp-4', itemName: 'Whole Chicken', itemCategory: 'Meat', itemQuantity: 'Free Range, ~1kg', itemPrice: 280, itemCost: 320, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2hzSNA1-qCI7npJUysgCEsB5kDRbJjE8IAZvSqk4TifNMxPgKB4ZzDqH5tGzb_LGxWKiJsJOag3PkSEQ3AfMCUQYHnYhYMQs2pPPOfuf8qHSE5slvdi8cVYeJSkOybuTt_PxSPZeQmUHGrCIp05tcC6Bl-31SDpEz-_dGleB5Kr4bG0FFHSSnfOBFqMT2Lt1wVNPMgTYWn0DLjCjUK3MA0lPEJ1LCclKWPgb0P6hEbH6SanIolV-QgQ' },
      { id: 'fp-5', itemName: 'Organic Carrots', itemCategory: 'Produce', itemQuantity: '1 Bunch, Farm Fresh', itemPrice: 60, itemCost: 75, isNew: true, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCf3_pjdg2rHUre5ZnmYm_ByVC8iOjl9Dmyo-mKoowNeXRz9uAw8qUV4UkM3DzrFlrxb0r4iUXXWV17Yb5dVCyazhyuABf41PDNhtA_XgfIhec4MjWIih4uv2asO_9_g1MDTaIKK6iT6kAolJ5ulW-7ELA1Fm_U30oCYiX6ukfjXp4FvXqLIfGK4l0FKKhvbUUgaplz-UFkiVCrImrj6gWcKSvgh46JOaZd4e5cFGqhAT4DB9m7ylzDow' }
    ];
  }, [products]);

  // Flash deals items
  const flashDeals = useMemo(() => [
    {
      id: "fd-1",
      itemName: "Avocados",
      discount: "-30%",
      originalPrice: 350,
      price: 249,
      itemQuantity: "2 Pack",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLkjlA-nWYAjJN8UCmFqbwAzPuYFFzJv7Vl1hZNkZ-4eJnCvs2XoJRws8o9SApPZnmos_wWZ6OAFaQb3W-adzDFZbtFFQ5WpOHJwp879Dhm-BNeOYZJYC5f27A2Q1Aecz7PI81lEb9_j1-9pCJ40EAA08wQp8kFrkY3UsOZAwv-dZDtlw7fUkSGeOMobJL2XiO2tSrRjUIB8e-Eqs8UVKxMdIqWObbHIJLgcJ04AnuvGJbNwk0Svh0Yw"
    },
    {
      id: "fd-2",
      itemName: "Artisan Bread",
      discount: "-15%",
      originalPrice: 90,
      price: 75,
      itemQuantity: "400g",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8FZZ5poaC8Tz0Gkxzjy-lrKVk4xy5uO4Rl7sGo11YvAfp7igMQkrO1PeQXWCcAPOX5NN-H4zoex2jNmrF9QK2thrqgHAWZ6sGBCyoWtVvORNyX7GkHjqbHh0aMVvFjHK9i5yHVhsQTGPG5NCdg-85k8Cb_qc-vOI-aREuzm6FqYOLcHN2Ityygd1HuMfmlqVOPC8FyK98PMuD_4mutn9oTx9rM4P57ykp2ef51qv5_QD7R8zbocNCJQ"
    },
    {
      id: "fd-3",
      itemName: "Alphonso Mangoes",
      discount: "-25%",
      originalPrice: 480,
      price: 360,
      itemQuantity: "1 kg",
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: "fd-4",
      itemName: "Greek Yogurt",
      discount: "-20%",
      originalPrice: 120,
      price: 95,
      itemQuantity: "400g",
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=80"
    },
    {
      id: "fd-5",
      itemName: "Organic Honey",
      discount: "-35%",
      originalPrice: 399,
      price: 259,
      itemQuantity: "500g",
      imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&auto=format&fit=crop&q=80"
    }
  ], []);

  // Quick categories
  const displayQuickCategories = useMemo(() => {
    return categories.slice(0, 12);
  }, [categories]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 gap-10 md:gap-14 animate-fade-in text-left">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-on-primary-fixed-variant shadow-2xl min-h-[280px] md:min-h-[340px] lg:min-h-[370px] flex items-center justify-between mt-1 group">
        {/* Texture & Gradient Overlays */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-on-primary-fixed-variant via-on-primary-fixed-variant/90 to-transparent z-0" />
          
          {/* Ambient Glowing Aura behind the image */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-gradient-to-tr from-primary-fixed/25 via-emerald-400/20 to-teal-300/15 rounded-full blur-3xl opacity-70 animate-pulse pointer-events-none" />
        </div>

        {/* Mobile Background Watermark Image */}
        <div className="md:hidden absolute right-[-20px] bottom-[-20px] w-52 opacity-25 pointer-events-none">
          <img 
            src="/fresh-veges.png" 
            alt="Fresh Organic Vegetables" 
            className="w-full h-auto object-contain filter drop-shadow-md"
          />
        </div>

        {/* Left Content */}
        <div className="relative z-10 w-full md:w-3/5 p-6 sm:p-8 md:p-12 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/25 backdrop-blur-md rounded-full text-[11px] font-extrabold text-primary-fixed tracking-wide uppercase border border-primary-fixed/30 shadow-sm">
            <span className="material-symbols-outlined text-[15px] animate-pulse">eco</span>
            <span>Farm to Table Daily</span>
          </div>
          <h1 className="font-display-lg text-pure-white leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black drop-shadow-sm">
            Fresh Organic Vegetables,<br />
            <span className="text-primary-fixed-dim">Delivered to Your Door.</span>
          </h1>
          <p className="font-body-lg text-surface-container-low/90 text-xs sm:text-sm md:text-base max-w-md line-clamp-2 leading-relaxed">
            Crisp, locally sourced greens & farm produce harvested today and delivered in minutes.
          </p>
          <button 
            onClick={() => navigate("/categories/Fresh%20Vegetables")}
            className="mt-2 px-7 py-3 bg-primary-container text-on-primary font-label-md rounded-2xl shadow-[0_8px_20px_rgba(16,185,129,0.35)] hover:scale-105 hover:bg-primary transition-all duration-300 cursor-pointer font-extrabold text-xs sm:text-sm flex items-center gap-2.5 active:scale-95"
          >
            <span>Shop Fresh Vegetables</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>

        {/* Right Extended Banner Image with Aura, Opacity & Hover Effects */}
        <div className="hidden md:flex absolute right-2 lg:right-6 xl:right-10 top-0 bottom-0 w-1/2 lg:w-[48%] xl:w-[50%] h-full z-10 items-center justify-end pointer-events-none">
          <div className="relative flex items-center justify-center pointer-events-auto">
            {/* Luminous Glow Backdrop */}
            <div className="absolute inset-0 bg-primary-fixed-dim/20 blur-2xl rounded-full scale-110 -z-10 opacity-80" />
            
            <img 
              src="/fresh-veges.png" 
              alt="Fresh Organic Vegetables" 
              className="max-h-[300px] md:max-h-[330px] lg:max-h-[370px] xl:max-h-[410px] w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] hover:scale-108 hover:-translate-y-2 transition-all duration-700 ease-out cursor-pointer" 
            />
          </div>
        </div>
      </section>


      {/* ── 2. FLASH DEALS & QUICK CATEGORIES ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Flash Deals Panel (5 cols) */}
        <div className="col-span-1 lg:col-span-5 bg-gradient-to-br from-primary via-primary-container to-surface-tint rounded-3xl p-1 relative overflow-hidden group shadow-lg">
          <div className="bg-surface-container-lowest/10 backdrop-blur-md w-full h-full rounded-[1.35rem] p-5 sm:p-6 flex flex-col gap-4 relative z-10 border border-white/10">
            <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim animate-pulse text-[26px]">local_fire_department</span>
                <h2 className="font-headline-md text-pure-white text-xl font-bold">Flash Deals</h2>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Countdown Timer */}
                <div className="flex items-center gap-1.5 bg-on-primary-fixed-variant/50 backdrop-blur-sm rounded-lg p-1.5 border border-white/10 shadow-inner">
                  <span className="font-label-sm text-surface-container-low text-[10px] uppercase font-bold">Ends in:</span>
                  <div className="bg-pure-white text-on-surface font-label-md px-1.5 py-0.5 rounded text-xs font-bold font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span className="text-pure-white font-bold text-xs">:</span>
                  <div className="bg-pure-white text-on-surface font-label-md px-1.5 py-0.5 rounded text-xs font-bold font-mono">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span className="text-pure-white font-bold text-xs">:</span>
                  <div className="bg-pure-white text-primary font-label-md px-1.5 py-0.5 rounded text-xs font-bold font-mono">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>

                {/* Scroll Buttons < > for Flash Deals */}
                <div className="flex items-center gap-1 bg-on-primary-fixed-variant/40 p-1 rounded-xl border border-white/15">
                  <button 
                    onClick={() => scrollFlashDeals('left')}
                    aria-label="Scroll left flash deals"
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => scrollFlashDeals('right')}
                    aria-label="Scroll right flash deals"
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Flash Deal Cards with Horizontal Scroll */}
            <div 
              ref={flashDealsScrollRef}
              className="flex gap-4 overflow-x-auto pb-1 hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
            >
              {flashDeals.map(deal => (
                <div key={deal.id} className="min-w-[160px] max-w-[170px] flex-shrink-0 bg-pure-white rounded-2xl p-3 shadow-md flex flex-col justify-between gap-2 relative">
                  <div className="absolute -top-2 -right-2 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                    {deal.discount}
                  </div>
                  <div className="h-20 w-full rounded-xl bg-surface-container-low flex items-center justify-center overflow-hidden">
                    <img src={deal.imageUrl} alt={deal.itemName} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div>
                    <h3 className="font-label-md text-on-surface text-xs font-bold truncate">{deal.itemName}</h3>
                    <span className="text-[10px] text-slate-text font-semibold">{deal.itemQuantity || '500g'}</span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-headline-md text-primary text-sm font-black">{formatINR(deal.price, false)}</span>
                      <span className="font-label-sm text-slate-text line-through opacity-70 text-[10px]">{formatINR(deal.originalPrice, false)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleQuickAdd(e, { id: deal.id, itemName: deal.itemName, itemPrice: deal.price, itemQuantity: deal.itemQuantity || '500g', imageUrl: deal.imageUrl })}
                    className="w-full py-1.5 bg-primary text-on-primary rounded-xl font-label-sm hover:bg-primary-container transition-colors shadow-sm text-xs font-bold cursor-pointer"
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Quick-cards (7 cols) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center gap-4">
          <div className="flex justify-between items-center">
            <h2 className="font-headline-md text-on-surface text-xl font-bold">Category Quick-cards</h2>
            <div className="flex items-center gap-3">
              {/* < > Horizontal Scroll Buttons for Category Cards */}
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-surface-variant/40 shadow-xs">
                <button 
                  onClick={() => scrollCategories('left')}
                  aria-label="Previous categories"
                  className="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-white text-on-surface flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => scrollCategories('right')}
                  aria-label="Next categories"
                  className="w-7 h-7 rounded-lg bg-surface-container-lowest hover:bg-primary hover:text-white text-on-surface flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button onClick={() => navigate("/categories")} className="text-primary text-xs font-bold hover:underline cursor-pointer">
                View All
              </button>
            </div>
          </div>

          <div className="relative flex items-center">
            <div 
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth w-full py-2 px-1"
            >
              {displayQuickCategories.map(cat => (
                <div
                  key={cat.id || cat.name}
                  onClick={() => navigate(`/categories/${encodeURIComponent(cat.name)}`)}
                  className="min-w-[95px] flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
                >
                  <div className="w-20 h-20 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 border border-surface-variant/40 overflow-hidden p-2 relative">
                    <img 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                      onError={(e) => { e.target.src = "https://placehold.co/100x100/e8fbf3/10b981?text=" + encodeURIComponent(cat.name.substring(0, 3)); }}
                    />
                  </div>
                  <span className="font-label-md text-xs font-bold text-on-surface group-hover:text-primary transition-colors text-center truncate max-w-[95px]">
                    {cat.nameDisplay || cat.name}
                  </span>
                </div>
              ))}
              
              {/* View All Card */}
              <div
                onClick={() => navigate("/categories")}
                className="min-w-[95px] flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 text-primary shadow-sm flex flex-col items-center justify-center group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 border border-primary/30">
                  <span className="material-symbols-outlined text-[24px]">grid_view</span>
                  <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">All</span>
                </div>
                <span className="font-label-md text-xs font-bold text-primary group-hover:underline text-center">
                  27+ More
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── 3. SEASONAL TREND RECIPE BANNER ── */}
      <section className="w-full relative overflow-hidden rounded-[2rem] bg-surface-tint shadow-lg flex flex-col md:flex-row items-center">
        {/* Background decorative glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-on-primary-fixed/20 rounded-full blur-2xl pointer-events-none" />

        {/* Recipe Image */}
        <div className="w-full md:w-1/2 h-64 md:h-auto relative z-10 flex justify-center items-center p-8">
          <div className="w-60 h-60 md:w-72 md:h-72 rounded-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.2)] border-4 border-white/20 relative">
            <img 
              src={SEASONAL_RECIPES[0].image} 
              alt={SEASONAL_RECIPES[0].title}
              className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700" 
            />
          </div>
        </div>

        {/* Recipe Content */}
        <div className="w-full md:w-1/2 p-8 md:p-12 md:pl-0 flex flex-col gap-4 relative z-10 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-primary-fixed/20 text-primary-fixed-dim font-label-sm text-xs rounded-full w-max mx-auto md:mx-0 border border-primary-fixed/30 backdrop-blur-sm font-bold">
            {SEASONAL_RECIPES[0].badge}
          </div>
          <h2 className="font-display-lg text-pure-white text-3xl md:text-4xl font-black leading-tight">
            Summer Berry<br />Salad
          </h2>
          <p className="font-body-md text-surface-container-low/90 text-sm max-w-sm mx-auto md:mx-0">
            {SEASONAL_RECIPES[0].description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-2 justify-center md:justify-start">
            <button 
              onClick={() => setSelectedRecipe(SEASONAL_RECIPES[0])}
              className="px-6 py-3 bg-pure-white text-surface-tint font-label-md text-xs font-bold rounded-xl hover:bg-surface-container-lowest transition-all shadow-sm cursor-pointer"
            >
              View Recipe
            </button>
            <button 
              onClick={() => handleAddAllRecipeIngredients(SEASONAL_RECIPES[0])}
              className="px-6 py-3 bg-surface-tint border border-white/30 text-pure-white font-label-md text-xs font-bold rounded-xl hover:bg-primary transition-all flex items-center gap-2 backdrop-blur-sm cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              Add All Ingredients
            </button>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PRODUCTS GRID ── */}
      <section className="flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline-lg text-on-surface text-2xl font-black">Featured Products</h2>
            <p className="text-xs text-on-surface-variant font-medium mt-0.5">Select unit amounts to see instant price adjustments</p>
          </div>
          <button 
            onClick={() => navigate("/categories")}
            className="font-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1 group text-xs font-bold cursor-pointer"
          >
            View All
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {displayFeaturedProducts.map(item => {
            const isWishlisted = wishlist.has(item.id);
            const availableUnits = getAvailableUnits(item);
            const selectedUnit = selectedUnitMap[item.id] || item.itemQuantity || availableUnits[1] || availableUnits[0] || "500g";
            const unitAdjustedPrice = calculateUnitPrice(item.itemPrice, selectedUnit, item.itemQuantity || "500g");

            return (
              <div 
                key={item.id}
                onClick={() => setSelectedProduct && setSelectedProduct({ ...item, itemQuantity: selectedUnit, itemPrice: unitAdjustedPrice })}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 group relative border border-surface-variant/40 cursor-pointer justify-between"
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

                {item.isNew && (
                  <div className="absolute -top-2 -left-2 bg-secondary text-on-secondary text-[9px] font-black px-2 py-0.5 rounded-full z-10 shadow-sm uppercase tracking-wider">
                    New
                  </div>
                )}

                {/* Product Image */}
                <div className="h-32 w-full rounded-xl bg-gradient-to-b from-surface-container-lowest to-surface-container/40 flex items-center justify-center overflow-hidden mb-1">
                  <img 
                    src={item.imageUrl} 
                    alt={item.itemName} 
                    className="h-28 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                    onError={(e) => { e.target.src = "https://placehold.co/100x100/f1f5f9/10b981?text=Groceries"; }}
                  />
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="font-label-sm text-slate-text uppercase tracking-wider text-[10px] font-bold">{item.itemCategory}</span>
                  <h3 className="font-headline-md text-on-surface text-sm font-bold leading-tight truncate">{item.itemName}</h3>
                  
                  {/* Unit Selector Dropdown */}
                  <div onClick={(e) => e.stopPropagation()} className="mt-0.5">
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnitMap(prev => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-full bg-surface-container-low border border-surface-variant/40 rounded-lg px-2 py-1 text-[11px] font-bold text-on-surface cursor-pointer focus:outline-none focus:border-primary"
                    >
                      {availableUnits.map(unit => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price & Add Action */}
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-surface-variant/40">
                  <div className="flex flex-col text-left">
                    <span className="font-headline-md text-on-surface font-black text-base">
                      {formatINR(unitAdjustedPrice)}
                    </span>
                    <span className="text-[10px] text-slate-text font-medium">for {selectedUnit}</span>
                  </div>
                  <button 
                    onClick={(e) => handleQuickAdd(e, { 
                      ...item, 
                      itemQuantity: selectedUnit, 
                      itemPrice: unitAdjustedPrice 
                    })}
                    className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center hover:bg-primary-container hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Add to Cart"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── RECIPE DETAIL MODAL ── */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-surface-variant/40 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{selectedRecipe.badge}</span>
                <h3 className="font-headline-md text-2xl font-black text-on-surface mt-0.5">{selectedRecipe.title}</h3>
              </div>
              <button onClick={() => setSelectedRecipe(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X size={22} />
              </button>
            </div>

            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-48 object-cover rounded-2xl mb-4" />

            <p className="text-sm text-on-surface-variant mb-4">{selectedRecipe.description}</p>

            <h4 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Ingredients:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {selectedRecipe.ingredients.map(ing => (
                <div key={ing.id} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-surface-variant/30">
                  <div className="flex items-center gap-2">
                    <img src={ing.imageUrl} alt={ing.itemName} className="w-7 h-7 rounded object-cover" />
                    <span className="text-xs font-bold text-on-surface">{ing.itemName}</span>
                  </div>
                  <span className="text-xs font-extrabold text-primary">{formatINR(ing.itemPrice, false)}</span>
                </div>
              ))}
            </div>

            <h4 className="font-label-md text-sm font-bold text-on-surface uppercase tracking-wider mb-2">Preparation Instructions:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-on-surface-variant mb-6">
              {selectedRecipe.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>

            <button
              onClick={() => {
                handleAddAllRecipeIngredients(selectedRecipe);
                setSelectedRecipe(null);
              }}
              className="w-full py-3 bg-primary text-on-primary font-label-md rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>Add All Ingredients to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {addedRecipeToast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-slide-up">
          <Check size={18} />
          <span>All ingredients added to your cart!</span>
        </div>
      )}
    </div>
  );
});

HomeScreen.displayName = "HomeScreen";

