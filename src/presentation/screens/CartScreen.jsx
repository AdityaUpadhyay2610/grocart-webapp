import React, { useState, useMemo, useCallback } from "react";
import { useCart } from "../../application/context/CartContext";
import { Plus, Minus, Tag, X, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { COUPON_OFFERS } from "../../domain/services/calculations";

export const CartScreen = React.memo(({ onBrowseProducts }) => {
  const {
    cartItems,
    addToCart,
    decreaseCartItem,
    proceedToPay,
    appliedCoupon,
    applyCouponCode,
    removeAppliedCoupon,
    itemTotal,
    handlingCharge,
    deliveryFee,
    couponDiscount,
    grandTotal
  } = useCart();

  const [showCoupons, setShowCoupons] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);

  const toggleCoupons = useCallback(() => {
    setShowCoupons(prev => !prev);
  }, []);

  const handleApplyCoupon = useCallback((code) => {
    const error = applyCouponCode(code);
    if (error) {
      setCouponError(error);
    } else {
      setCouponError(null);
      setShowCoupons(false);
    }
  }, [applyCouponCode]);

  const handleRemoveCoupon = useCallback(() => {
    removeAppliedCoupon();
    setCouponInput("");
    setCouponError(null);
  }, [removeAppliedCoupon]);

  const handleApplyInput = useCallback((e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      handleApplyCoupon(couponInput);
    }
  }, [couponInput, handleApplyCoupon]);

  return (
    <div className="flex flex-col pb-36 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent relative px-4">
      {cartItems.length > 0 ? (
        <div className="flex flex-col space-y-6 pt-4 text-left">
          <h2 className="text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Review Items</h2>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart items list */}
            <div className="lg:col-span-7 space-y-4">
              {cartItems.map(item => {
                const discountedPrice = Math.floor(item.itemPrice * 75 / 100);
                const itemRowTotal = discountedPrice * item.quantity;
                
                return (
                  <div 
                    key={item.id}
                    className="bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 flex justify-between items-center shadow-sm dark:shadow-none"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="w-20 h-20 object-cover rounded-2xl bg-gray-50 dark:bg-slate-800/40 flex-shrink-0"
                      onError={(e) => { e.target.src = "https://placehold.co/60x60/f1f5f9/7c3aed?text=Item"; }}
                    />
                    <div className="flex-1 px-5 text-left">
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 line-clamp-1">{item.itemName}</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-450 mt-1 font-semibold">₹{discountedPrice} each</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center space-x-3 bg-gray-50 dark:bg-slate-850 border border-gray-100 dark:border-slate-800 rounded-full px-2 py-1">
                        <button
                          onClick={() => decreaseCartItem(item)}
                          className="w-7 h-7 rounded-full bg-white dark:bg-[#151C2C] flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-black text-slate-700 dark:text-slate-300 min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full bg-white dark:bg-[#151C2C] flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-100">₹{itemRowTotal}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Sticky Summary, Coupons, and Pay Button */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              {/* Coupon Code Section */}
              <div className={`bg-white dark:bg-[#111724] border rounded-3xl p-5 shadow-sm dark:shadow-none transition-all duration-300 ${
                appliedCoupon ? "border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10" : "border-gray-100 dark:border-slate-800/80"
              }`}>
                <div 
                  onClick={!appliedCoupon ? toggleCoupons : undefined}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      appliedCoupon ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-450" : "bg-cyan-100 dark:bg-cyan-950/40 text-violet-600 dark:text-violet-450"
                    }`}>
                      <Tag size={20} />
                    </div>
                    <div className="text-left">
                      <h3 className={`text-sm font-extrabold ${appliedCoupon ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {appliedCoupon ? "Coupon Applied!" : "Apply Coupon"}
                      </h3>
                      <p className={`text-xs ${appliedCoupon ? "text-emerald-600 dark:text-emerald-500" : "text-gray-400 dark:text-slate-450"}`}>
                        {appliedCoupon ? `${appliedCoupon.code} — ${appliedCoupon.discountPercent}% off` : "Save more on your order"}
                      </p>
                    </div>
                  </div>
                  {appliedCoupon ? (
                    <button 
                      onClick={handleRemoveCoupon} 
                      className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/20 text-red-50 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <div>
                      {showCoupons ? <ChevronUp size={20} className="text-violet-600" /> : <ChevronDown size={20} className="text-violet-600" />}
                    </div>
                  )}
                </div>

                {/* Expandable Coupon Panel */}
                {showCoupons && !appliedCoupon && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/80 space-y-4">
                    <form onSubmit={handleApplyInput} className="flex space-x-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50 dark:bg-slate-800/40 dark:text-slate-100 uppercase"
                      />
                      <button
                        type="submit"
                        disabled={!couponInput.trim()}
                        className="px-4 py-2.5 bg-cyan-600 text-white font-extrabold text-sm rounded-xl hover:bg-cyan-700 disabled:opacity-50 transition-colors"
                      >
                        Apply
                      </button>
                    </form>
                    {couponError && (
                      <p className="text-xs text-red-500 font-medium text-left">{couponError}</p>
                    )}

                    <div className="text-left space-y-3 mt-4">
                      <h4 className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Available Coupons</h4>
                      <div className="space-y-2">
                        {COUPON_OFFERS.map(coupon => (
                          <div 
                            key={coupon.code}
                            className="p-3 bg-cyan-50/50 dark:bg-cyan-950/20 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 border border-cyan-100 dark:border-violet-900/30 rounded-2xl flex justify-between items-center cursor-pointer transition-colors"
                            onClick={() => handleApplyCoupon(coupon.code)}
                          >
                            <div className="text-left">
                              <span className="text-xs font-black text-violet-600 dark:text-violet-400 tracking-wide bg-cyan-100 dark:bg-cyan-900/50 px-2 py-0.5 rounded-md">
                                {coupon.code}
                              </span>
                              <p className="text-[11px] text-gray-500 dark:text-slate-450 mt-1">{coupon.description}</p>
                            </div>
                            <span className="text-xs font-black text-violet-600 dark:text-violet-400 px-3 py-1.5 bg-white dark:bg-[#151C2C] rounded-xl shadow-sm dark:shadow-none border border-cyan-100 dark:border-violet-900/40">
                              TAP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details */}
              <div className="bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm dark:shadow-none text-left">
                <h3 className="text-base font-black text-slate-805 dark:text-slate-200 mb-4 flex items-center space-x-2">
                  <ShoppingBag size={18} className="text-violet-600 dark:text-violet-400" />
                  <span>Bill Details</span>
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Item Total</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{itemTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Handling Charge (1%)</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{handlingCharge}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 dark:text-slate-400">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">₹{deliveryFee}</span>
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-500 font-semibold">
                      <span className="flex items-center space-x-1">
                        <Tag size={12} />
                        <span>Coupon ({appliedCoupon.code})</span>
                      </span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}

                  <hr className="border-dashed border-gray-100 dark:border-slate-800/60 my-3" />

                  <div className="flex justify-between text-lg font-black text-slate-900 dark:text-slate-100">
                    <span>To Pay</span>
                    <span className="text-violet-600 dark:text-violet-400">₹{grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Desktop Checkout Button (Hidden on Mobile) */}
              <div className="hidden lg:block w-full">
                <button
                  onClick={proceedToPay}
                  className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-violet-200 transition-all active:scale-98 cursor-pointer text-center"
                >
                  Proceed to Pay  •  ₹{grandTotal}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Pinned Bottom Button (Hidden on Desktop) */}
          <div className="lg:hidden fixed bottom-[65px] left-0 right-0 bg-white dark:bg-[#0E131F] border-t border-gray-100 dark:border-slate-800/80 p-4 z-20 shadow-[0_-8px_20px_-6px_rgba(0,0,0,0.05)] pointer-events-auto transition-colors duration-300">
            <div className="max-w-md mx-auto">
              <button
                onClick={proceedToPay}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-violet-200 transition-all active:scale-98 cursor-pointer"
              >
                Proceed to Pay  •  ₹{grandTotal}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center min-h-[calc(100vh-140px)]">
          <img 
            src="/emptycart.webp" 
            alt="Empty Cart" 
            className="w-56 h-56 object-contain mb-6 animate-float"
            onError={(e) => { e.target.src = "https://placehold.co/200x200/f1f5f9/7c3aed?text=Empty+Cart"; }}
          />
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Your Cart is Empty</h3>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-2 max-w-xs mx-auto">
            Your shopping journey hasn't started yet. Let's find something for you!
          </p>
          <button
            onClick={onBrowseProducts}
            className="mt-6 px-6 py-3 bg-cyan-600 text-white font-extrabold text-sm rounded-2xl hover:bg-cyan-700 shadow-md transition-colors"
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  );
});

CartScreen.displayName = "CartScreen";

