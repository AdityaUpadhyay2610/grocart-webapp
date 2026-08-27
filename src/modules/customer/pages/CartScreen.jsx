import React, { useState, useMemo, useCallback } from "react";
import { useCart } from "../state/CartContext";
import { useGPSLocation } from "@global/hooks/useLocation";
import { formatINR, calculateGST, calculateEcoSavings, COUPON_OFFERS } from "@global/utils/calculations";
import { Plus, Minus, Trash2, Tag, X, Check, ArrowRight, Sparkles, Leaf } from "lucide-react";

export const CartScreen = React.memo(({ onBrowseProducts }) => {
  const {
    cartItems,
    addToCart,
    decreaseCartItem,
    removeFromCart,
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

  const { locationText } = useGPSLocation();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const gstAmount = useMemo(() => calculateGST(itemTotal), [itemTotal]);
  const ecoSavings = useMemo(() => calculateEcoSavings(cartItems), [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const handleApplyCoupon = useCallback((code) => {
    const error = applyCouponCode(code);
    if (error) {
      setCouponError(error);
      setCouponSuccess(false);
    } else {
      setCouponError(null);
      setCouponSuccess(true);
      setCouponInput("");
      setTimeout(() => setCouponSuccess(false), 3000);
    }
  }, [applyCouponCode]);

  const handleRemoveCoupon = useCallback(() => {
    removeAppliedCoupon();
    setCouponInput("");
    setCouponError(null);
    setCouponSuccess(false);
  }, [removeAppliedCoupon]);

  const handleApplyInput = useCallback((e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      handleApplyCoupon(couponInput.trim().toUpperCase());
    }
  }, [couponInput, handleApplyCoupon]);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      {cartItems.length > 0 ? (
        <div className="flex flex-col gap-6">
          
          {/* Header Title */}
          <div>
            <h1 className="font-display-lg text-on-surface dark:text-white text-3xl sm:text-4xl font-black">Review Your Organic Cart</h1>
            <p className="font-body-md text-on-surface-variant mt-1 text-sm">
              ({totalItemsCount} items selected for fast 10-minute quick delivery)
            </p>
          </div>

          {/* ── 2-Column Responsive Layout (8 cols Table + 4 cols Summary) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── Left: Cart Table & Eco Impact (8 cols) ── */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
              
              {/* Cart Items Table Card */}
              <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl border border-surface-variant/40 dark:border-[#262626] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-surface-variant/30 dark:border-[#262626] text-on-surface-variant uppercase text-[11px] font-bold tracking-wider bg-surface-container/50 dark:bg-[#131313]">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-4 hidden sm:table-cell">Unit Price</th>
                        <th className="py-4 px-4 text-center">Quantity</th>
                        <th className="py-4 px-4 text-right">Total</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/20 dark:divide-[#262626]">
                      {cartItems.map((item) => {
                        const price = item.itemPrice;
                        const rowTotal = price * item.quantity;

                        return (
                          <tr key={item.id} className="hover:bg-surface-container/30 dark:hover:bg-[#201f1f]/40 transition-colors">
                            {/* Product info */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3.5">
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.itemName} 
                                  className="w-14 h-14 rounded-2xl object-cover bg-surface-container-lowest dark:bg-[#0e0e0e] flex-shrink-0 border border-surface-variant/30 dark:border-[#262626]"
                                  onError={(e) => { e.target.src = "https://placehold.co/80x80/f1f5f9/10b981?text=Produce"; }}
                                />
                                <div>
                                  <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white line-clamp-1 leading-tight">{item.itemName}</h4>
                                  <span className="font-label-sm text-xs text-on-surface-variant">{item.itemQuantity || '500g'}</span>
                                  <span className="sm:hidden font-headline-md text-xs font-black text-primary block mt-0.5">{formatINR(price)}</span>
                                </div>
                              </div>
                            </td>

                            {/* Unit Price */}
                            <td className="py-4 px-4 hidden sm:table-cell font-headline-md text-sm font-bold text-on-surface dark:text-white">
                              {formatINR(price)}
                            </td>

                            {/* Quantity Stepper */}
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center space-x-2 bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] rounded-xl px-2 py-1 w-max mx-auto">
                                <button
                                  onClick={() => decreaseCartItem(item)}
                                  className="w-6 h-6 rounded-lg bg-surface-container-high dark:bg-[#2a2a2a] flex items-center justify-center text-primary hover:bg-surface-container-highest shadow-xs transition-colors cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="font-label-md text-xs font-black text-on-surface dark:text-white min-w-[16px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => addToCart(item)}
                                  className="w-6 h-6 rounded-lg bg-surface-container-high dark:bg-[#2a2a2a] flex items-center justify-center text-primary hover:bg-surface-container-highest shadow-xs transition-colors cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="py-4 px-4 text-right font-headline-md text-sm font-black text-on-surface dark:text-white">
                              {formatINR(rowTotal)}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => removeFromCart ? removeFromCart(item.id) : decreaseCartItem(item)}
                                className="w-8 h-8 rounded-full text-on-surface-variant hover:text-error hover:bg-error-container/20 flex items-center justify-center mx-auto transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Eco-Impact Tracker Widget ── */}
              <div className="bg-gradient-to-r from-primary-50 via-surface-container-lowest to-primary-100/30 dark:from-[#171717] dark:to-[#171717] rounded-3xl p-6 border border-primary/20 dark:border-[#262626] flex flex-col sm:flex-row items-center gap-5 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
                  <Leaf size={28} />
                </div>
                <div className="flex-1 text-left w-full">
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-md text-base font-black text-on-surface dark:text-white">
                      Eco-Impact: {ecoSavings.co2eSavedKg} kg CO₂e Saved!
                    </h3>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-md uppercase">100% Organic</span>
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant mt-1">
                    By choosing local organic growers, you reduced standard supply chain transport emissions.
                  </p>
                  
                  {/* Target Progress Bar */}
                  <div className="mt-3 flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] font-bold text-on-surface dark:text-white">
                      <span>Plastic-Free Packaging Progress</span>
                      <span className="text-primary">{ecoSavings.packagingProgressPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container dark:bg-[#201f1f] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-700" 
                        style={{ width: `${ecoSavings.packagingProgressPercent}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: Summary Card (4 cols) ── */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
              
              <div className="bg-gradient-to-b from-primary via-on-primary-fixed-variant to-[#003824] dark:from-[#171717] dark:to-[#171717] rounded-3xl p-6 sm:p-7 text-white dark:text-white shadow-xl flex flex-col gap-6 border border-white/10 dark:border-[#262626] relative overflow-hidden">
                <h3 className="font-headline-md text-xl font-black text-white dark:text-white border-b border-white/15 dark:border-[#262626] pb-4">
                  Order Summary
                </h3>

                {/* Estimated Delivery Widget */}
                <div className="bg-white/10 dark:bg-[#201f1f] backdrop-blur-md rounded-2xl p-4 border border-white/15 dark:border-[#262626] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-[10px] uppercase font-black text-primary-fixed-dim dark:text-primary tracking-wider">
                      Quick-Commerce Delivery
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-white dark:text-white font-bold">
                      <span className="w-2 h-2 rounded-full bg-primary-fixed dark:bg-primary animate-ping" />
                      <span>10 - 20 mins</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 mt-1">
                    <span className="material-symbols-outlined text-primary-fixed dark:text-primary text-[18px] shrink-0">location_on</span>
                    <p className="text-xs text-white/90 dark:text-on-surface-variant font-medium truncate">
                      {locationText || "Connaught Place, New Delhi"}
                    </p>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="flex flex-col gap-2">
                  <span className="font-label-sm text-xs font-bold text-white dark:text-white">Apply Promo Code</span>
                  <form onSubmit={handleApplyInput} className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. GROCART10" 
                      className="flex-1 bg-white/15 dark:bg-[#201f1f] border border-white/20 dark:border-[#262626] rounded-xl px-3 py-2 text-xs font-bold text-white dark:text-white placeholder:text-white/50 dark:placeholder:text-on-surface-variant focus:outline-none focus:bg-white/20 uppercase"
                    />
                    <button 
                      type="submit"
                      disabled={!couponInput.trim()}
                      className="px-4 py-2 bg-primary-fixed text-on-primary-fixed dark:bg-primary dark:text-black font-label-md text-xs font-black rounded-xl hover:bg-pure-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Applied Coupon Pill */}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-primary-container/40 dark:bg-primary/15 border border-primary-fixed/40 dark:border-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold text-white dark:text-primary mt-1">
                      <span className="flex items-center gap-1.5">
                        <Tag size={12} className="text-primary-fixed dark:text-primary" />
                        <span>{appliedCoupon.code} applied (-{formatINR(couponDiscount, false)})</span>
                      </span>
                      <button onClick={handleRemoveCoupon} className="text-white dark:text-on-surface hover:text-error cursor-pointer">
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {couponError && <span className="text-xs text-red-300 dark:text-error font-bold">{couponError}</span>}
                  {couponSuccess && <span className="text-xs text-primary-fixed dark:text-primary font-bold">Coupon applied successfully!</span>}

                  {/* Quick Coupon Chips */}
                  {!appliedCoupon && (
                    <div className="flex gap-2 mt-1">
                      {COUPON_OFFERS.slice(0, 2).map(c => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          className="px-2.5 py-1 bg-white/10 dark:bg-[#201f1f] hover:bg-white/20 dark:hover:border-primary rounded-lg text-[10px] font-bold text-white/90 dark:text-on-surface-variant border border-white/10 dark:border-[#262626] cursor-pointer"
                        >
                          {c.code} ({c.discountPercent}% OFF)
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* INR Bill Breakdown */}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/15 dark:border-[#262626] text-xs text-white/85 dark:text-on-surface-variant">
                  <div className="flex justify-between font-medium">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-white dark:text-white">{formatINR(itemTotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>GST (5%)</span>
                    <span className="font-bold text-white dark:text-white">{formatINR(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-white dark:text-white">
                      {deliveryFee === 0 ? <span className="text-primary-fixed dark:text-primary font-black">FREE</span> : formatINR(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Handling Fee</span>
                    <span className="font-bold text-white dark:text-white">{formatINR(handlingCharge)}</span>
                  </div>
                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between font-bold text-primary-fixed dark:text-primary">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-{formatINR(couponDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-4 border-t border-white/20 dark:border-[#262626] text-base font-black text-white dark:text-white">
                    <span>Grand Total</span>
                    <span className="text-xl text-primary-fixed dark:text-primary font-black">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={proceedToPay}
                  className="w-full py-4 bg-primary-fixed text-on-primary-fixed dark:bg-primary dark:text-black font-headline-md text-sm font-black rounded-2xl shadow-lg hover:bg-pure-white hover:scale-[1.02] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Pay</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="flex flex-col items-center justify-center py-20 text-center min-h-[calc(100vh-280px)]">
          <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-6xl text-primary">shopping_cart</span>
          </div>
          <h2 className="font-display-lg text-2xl sm:text-3xl font-black text-on-surface dark:text-white">Your Cart is Empty</h2>
          <p className="font-body-md text-on-surface-variant mt-2 max-w-sm text-sm">
            Your shopping basket is waiting for fresh organic produce. Let's find something delicious!
          </p>
          <button
            onClick={onBrowseProducts}
            className="mt-6 px-8 py-3.5 bg-primary text-on-primary font-label-md text-sm font-black rounded-xl hover:bg-primary-container shadow-md transition-all cursor-pointer"
          >
            Explore Groceries
          </button>
        </div>
      )}
    </div>
  );
});

CartScreen.displayName = "CartScreen";


