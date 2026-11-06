import React from "react";
import { useSelector } from "react-redux";
import { useCart } from "../state/CartContext";
import { formatINR } from "@global/utils/calculations";
import {
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Lock,
  CheckCircle,
  Loader2,
  Check
} from "lucide-react";

import {
  PAYMENT_METHODS,
  UPI_APPS,
  POPULAR_BANKS,
  OTHER_BANKS
} from "../constants/paymentConstants";
import { usePaymentCheckout } from "../hooks/usePaymentCheckout";

export const PaymentScreen = React.memo(({ onPaymentConfirmed, onNavigateBack }) => {
  const {
    cartItems,
    grandTotal,
    deliveryFee,
    couponDiscount,
    appliedCoupon,
    completePayment,
    placeOrder,
    clearCartData
  } = useCart();

  const user = useSelector((state) => state.auth?.user);

  const {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    selectedUpiApp,
    setSelectedUpiApp,
    upiIdInput,
    setUpiIdInput,
    selectedBank,
    setSelectedBank,
    orderStage,
    orderId,
    finalTotal,
    activeMethodDisplay,
    getPayButtonLabel,
    handleBuyClick
  } = usePaymentCheckout({
    cartItems,
    grandTotal,
    appliedCoupon,
    user,
    onPaymentConfirmed,
    completePayment,
    placeOrder,
    clearCartData
  });

  return (
    <div className="fixed inset-0 w-full h-full bg-surface-container-lowest dark:bg-[#0a0a0a] text-on-surface dark:text-white z-50 overflow-y-auto pb-8 select-none flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-surface/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-surface-variant/40 dark:border-[#262626] px-4 py-3.5 flex items-center justify-between">
        <button
          onClick={onNavigateBack}
          className="p-2 -ml-2 rounded-full hover:bg-surface-container dark:hover:bg-[#202020] text-on-surface dark:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-headline-md text-base font-black text-on-surface dark:text-white">Select Payment Method</span>
          <span className="text-[10px] text-on-surface-variant font-medium flex items-center gap-1">
            <Lock size={10} className="text-primary" /> 256-bit Bank Grade Encrypted
          </span>
        </div>
        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 flex-1 flex flex-col">
        {orderStage && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-surface-variant/30 dark:border-[#333] flex flex-col items-center">
              {orderStage === "processing" ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 animate-spin">
                    <Loader2 size={32} />
                  </div>
                  <h3 className="font-headline-md text-lg font-black text-on-surface dark:text-white mb-2">
                    Processing Your Order
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Connecting with payment provider. Please do not close or refresh this window...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
                    <CheckCircle size={36} />
                  </div>
                  <h3 className="font-headline-md text-lg font-black text-on-surface dark:text-white mb-2">
                    Order Confirmed!
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                    Your fresh groceries are being packed at the nearest GroCart dark store.
                  </p>
                  <div className="bg-surface-container dark:bg-[#262626] px-4 py-2 rounded-xl text-xs font-bold text-primary mb-2">
                    Order ID: {orderId || "GC-" + Math.floor(100000 + Math.random() * 900000)}
                  </div>
                  <div className="text-sm font-black text-on-surface dark:text-white">
                    Amount: {formatINR(finalTotal)}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Payment Method Selection */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-on-surface-variant px-1">
              Payment Options
            </span>

            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              const Icon = method.icon;

              return (
                <div
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                    isSelected
                      ? "bg-surface-container-high dark:bg-[#1e1e1e] border-primary shadow-md shadow-primary/5"
                      : "bg-surface-container-low dark:bg-[#141414] border-surface-variant/40 dark:border-[#262626] hover:border-surface-variant hover:bg-surface-container dark:hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.bgColor} ${method.color}`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-headline-md text-sm font-bold text-on-surface dark:text-white">
                            {method.name}
                          </span>
                          {method.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant line-clamp-1">
                          {method.description}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-on-primary"
                          : "border-surface-variant dark:border-[#444]"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-on-primary dark:bg-black" />}
                    </div>
                  </div>

                  {/* UPI Sub-Options */}
                  {isSelected && method.id === "UPI" && (
                    <div className="pt-3 mt-1 border-t border-surface-variant/30 dark:border-[#2c2c2c] flex flex-col gap-3">
                      <span className="text-[11px] font-bold text-on-surface-variant">Choose UPI App:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {UPI_APPS.map((app) => {
                          const isAppSelected = selectedUpiApp === app.id;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUpiApp(app.id);
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                isAppSelected
                                  ? "border-primary bg-primary/10 text-primary dark:text-primary"
                                  : "border-surface-variant/40 dark:border-[#262626] bg-surface-container dark:bg-[#201f1f] text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              <span className="text-base">{app.icon}</span>
                              <span className="truncate">{app.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedUpiApp === "other" && (
                        <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder="username@okhdfcbank"
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                            className="flex-1 bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] rounded-xl px-3.5 py-2 text-xs font-bold text-on-surface dark:text-white focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-primary text-on-primary dark:text-black text-xs font-bold rounded-xl"
                          >
                            Verify
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Net Banking Sub-Options */}
                  {isSelected && method.id === "NETBANKING" && (
                    <div className="pt-3 mt-1 border-t border-surface-variant/30 dark:border-[#2c2c2c] flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[11px] font-bold text-on-surface-variant">Select Your Bank:</span>
                      
                      {/* Popular Banks Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {POPULAR_BANKS.map((bank) => {
                          const isBankSelected = selectedBank === bank.code;
                          return (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => setSelectedBank(bank.code)}
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                isBankSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-surface-variant/40 dark:border-[#262626] bg-surface-container dark:bg-[#201f1f] text-on-surface-variant hover:text-on-surface"
                              }`}
                            >
                              <span>{bank.short}</span>
                              {isBankSelected && <Check size={14} className="text-primary shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Dropdown for All Other Banks */}
                      <div className="mt-1">
                        <select
                          value={OTHER_BANKS.some(b => b.code === selectedBank) ? selectedBank : ""}
                          onChange={(e) => {
                            if (e.target.value) setSelectedBank(e.target.value);
                          }}
                          className="w-full bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface dark:text-white focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="">-- More Indian Banks (50+) --</option>
                          {OTHER_BANKS.map((bank) => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="mt-4 p-4 rounded-2xl bg-surface-container dark:bg-[#1a1a1a] border border-surface-variant/30 dark:border-[#262626] flex items-center gap-3 text-xs text-on-surface-variant">
              <ShieldCheck size={20} className="text-primary shrink-0" />
              <span>All online payments are encrypted and secured with RBI compliant 256-bit SSL protocols.</span>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="md:col-span-5 bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] flex flex-col gap-4">
            <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-white border-b border-surface-variant/30 dark:border-[#262626] pb-3">
              Order Summary
            </h3>

            <div className="flex flex-col gap-2.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items in Cart</span>
                <span className="font-bold text-on-surface dark:text-white">{cartItems.length} products</span>
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
              
              <div className="flex justify-between items-baseline pt-3 border-t border-surface-variant/30 dark:border-[#262626] text-base font-black text-on-surface dark:text-white">
                <span>Grand Total</span>
                <span className="text-xl text-primary font-black">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="text-[11px] text-on-surface-variant bg-surface-container dark:bg-[#201f1f] p-3 rounded-xl border border-surface-variant/30 dark:border-[#262626]">
              <span>Payment Mode: </span>
              <span className="font-bold text-primary">{activeMethodDisplay}</span>
            </div>

            <button
              onClick={handleBuyClick}
              disabled={!selectedPaymentMethod}
              className="mt-2 w-full py-4 bg-primary text-on-primary dark:text-black font-headline-md text-s font-black rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="text-sm">{getPayButtonLabel()}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentScreen.displayName = "PaymentScreen";
