import React from "react";
import { useGPSLocation } from "@global/hooks/useLocation";
import { formatINR } from "@global/utils/calculations";
import { Plus, Minus, Trash2, Tag, X, Leaf, ArrowRight, MapPin, ShoppingCart } from "lucide-react";
import { useCartScreen } from "../hooks/useCartScreen";

export const CartScreen = React.memo(({ onBrowseProducts }) => {
  const { locationText } = useGPSLocation();

  const {
    cartItems,
    addToCart,
    decreaseCartItem,
    removeFromCart,
    proceedToPay,
    appliedCoupon,
    itemTotal,
    handlingCharge,
    deliveryFee,
    couponDiscount,
    grandTotal,
    couponInput,
    setCouponInput,
    couponError,
    couponSuccess,
    gstAmount,
    ecoSavings,
    totalItemsCount,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleApplyInput
  } = useCartScreen();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center select-none animate-fade-in">
        <div className="w-24 h-24 bg-surface-container dark:bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-inner text-on-surface-variant">
          <ShoppingCart size={40} className="stroke-[1.5]" />
        </div>
        <h2 className="font-headline-md text-2xl font-black text-on-surface dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-on-surface-variant max-w-xs mb-8">
          Looks like you haven&apos;t added any fresh groceries yet. Explore our categories to fill your basket!
        </p>
        <button
          onClick={onBrowseProducts}
          className="px-8 py-3.5 bg-primary text-on-primary dark:text-black font-headline-md text-sm font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Start Shopping</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-surface-variant/40 dark:border-[#262626] gap-2">
        <div>
          <h1 className="font-headline-md text-2xl sm:text-3xl font-black text-on-surface dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your fresh bag
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant bg-surface-container-low dark:bg-[#171717] px-3.5 py-2 rounded-xl border border-surface-variant/30 dark:border-[#262626]">
          <MapPin size={14} className="text-primary" />
          <span className="truncate max-w-[200px]">Delivery to: {locationText || "Select location"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface-container-lowest dark:bg-[#121212] rounded-3xl p-4 sm:p-6 border border-surface-variant/40 dark:border-[#262626] flex flex-col divide-y divide-surface-variant/20 dark:divide-[#202020]">
            {cartItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container dark:bg-[#1e1e1e] p-2 flex items-center justify-center shrink-0 border border-surface-variant/20 dark:border-[#262626]">
                    <img
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-headline-md text-sm sm:text-base font-bold text-on-surface dark:text-white truncate">
                      {item.itemName}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {item.itemQuantity}
                    </span>
                    <span className="font-headline-md text-sm font-black text-primary mt-1">
                      {formatINR(item.itemPrice)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-surface-container dark:bg-[#1e1e1e] rounded-xl border border-surface-variant/40 dark:border-[#2c2c2c] p-1">
                    <button
                      onClick={() => decreaseCartItem(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-on-surface dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-7 h-7 flex items-center justify-center text-on-surface hover:text-primary transition-colors cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Eco Savings Banner */}
          {ecoSavings > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
              <Leaf size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                By choosing GroCart's local hyper-fast sourcing, this order saves approx. <strong>{ecoSavings}g of CO2 emissions</strong>!
              </span>
            </div>
          )}
        </div>

        {/* Checkout Summary Card */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Coupon Box */}
          <div className="bg-surface-container-lowest dark:bg-[#121212] rounded-3xl p-5 border border-surface-variant/40 dark:border-[#262626]">
            <div className="flex items-center gap-2 mb-3">
              <Tag size={16} className="text-primary" />
              <span className="font-headline-md text-sm font-black text-on-surface dark:text-white">Coupons & Offers</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-primary uppercase tracking-wider">{appliedCoupon.code} applied</span>
                  <span className="text-[11px] text-on-surface-variant">You saved {formatINR(couponDiscount)}</span>
                </div>
                <button onClick={handleRemoveCoupon} className="p-1 text-on-surface-variant hover:text-red-500 transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyInput} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter promo code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-surface-container dark:bg-[#1c1c1c] border border-surface-variant/40 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs font-bold text-on-surface dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!couponInput.trim()}
                  className="px-4 py-2 bg-primary text-on-primary dark:text-black font-headline-md text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-container transition-all cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-[11px] text-red-500 font-bold mt-2">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-primary font-bold mt-2">Coupon applied successfully!</p>}

            {!appliedCoupon && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-surface-variant/20 dark:border-[#202020]">
                {["WELCOME50", "FREESHIP", "FRESH10"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleApplyCoupon(code)}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-surface-container dark:bg-[#1c1c1c] text-on-surface-variant hover:text-primary hover:border-primary border border-surface-variant/30 dark:border-[#262626] transition-colors cursor-pointer"
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bill Summary */}
          <div className="bg-surface-container-lowest dark:bg-[#121212] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] flex flex-col gap-3.5">
            <h3 className="font-headline-md text-sm font-black text-on-surface dark:text-white pb-2 border-b border-surface-variant/20 dark:border-[#202020]">
              Bill Summary
            </h3>

            <div className="flex flex-col gap-2 text-xs text-on-surface-variant font-medium">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(itemTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(handlingCharge)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-primary">
                  {deliveryFee === 0 ? "FREE" : formatINR(deliveryFee)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-on-surface-variant/70 pt-1">
                <span>Incl. Taxes &amp; GST</span>
                <span>{formatINR(gstAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-surface-variant/30 dark:border-[#262626] text-base font-black text-on-surface dark:text-white">
              <span>Grand Total</span>
              <span className="text-xl text-primary font-black">{formatINR(grandTotal)}</span>
            </div>

            <button
              onClick={proceedToPay}
              className="mt-3 w-full py-4 bg-primary text-on-primary dark:text-black font-headline-md text-sm font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CartScreen.displayName = "CartScreen";
