import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { CreditCard, Truck, Smartphone, Wallet, CheckCircle, Loader2, ArrowLeft, Receipt, Check } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "CARD", label: "Card Payment", subtitle: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "COD", label: "Cash on Delivery", subtitle: "Pay when you receive", icon: Truck },
  { id: "UPI", label: "UPI Payment", subtitle: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "WALLET", label: "Wallet", subtitle: "Paytm, Amazon Pay", icon: Wallet }
];

export const PaymentScreen = React.memo(({ onPaymentConfirmed }) => {
  const {
    itemTotal,
    handlingCharge,
    deliveryFee,
    couponDiscount,
    grandTotal,
    appliedCoupon,
    selectedPaymentMethod,
    setPaymentMethod,
    placeOrder,
    completePayment
  } = useCart();

  const [orderStage, setOrderStage] = useState(null); // 'processing' | 'success' | null
  const [orderId, setOrderId] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);

  const handleMethodSelect = useCallback((methodId) => {
    setPaymentMethod(methodId);
  }, [setPaymentMethod]);

  const handleBuyClick = useCallback(async () => {
    if (!selectedPaymentMethod) return;

    setFinalTotal(grandTotal);
    setOrderStage("processing");
    try {
      const newOrderId = await placeOrder();
      setOrderId(newOrderId);
      
      // Delay for success screen
      setTimeout(() => {
        setOrderStage("success");
        
        // Delay for completion callback
        setTimeout(() => {
          setOrderStage(null);
          completePayment();
          onPaymentConfirmed();
        }, 2200);
      }, 2000);
    } catch (e) {
      console.error("Order placement failed:", e);
      alert("Order placement failed. Please try again.");
      setOrderStage(null);
    }
  }, [selectedPaymentMethod, placeOrder, completePayment, onPaymentConfirmed, grandTotal]);

  const activeMethodDetails = useMemo(() => {
    return PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod);
  }, [selectedPaymentMethod]);

  return (
    <div className="fixed inset-0 w-full h-full bg-white dark:bg-[#090D16] text-slate-850 dark:text-slate-100 z-50 overflow-y-auto pb-8 select-none flex flex-col transition-colors duration-300">
      {/* Processing / Success Overlay */}
      {orderStage && (
        <div className="fixed inset-0 w-full h-full bg-white dark:bg-[#090D16] z-[60] flex flex-col items-center justify-center p-8 animate-fade-in">
          {orderStage === "processing" ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-16 h-16 text-violet-600 animate-spin" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Placing your order...</h3>
              <p className="text-sm text-gray-400 dark:text-slate-400">Please wait a moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-green-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none scale-in-out">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">Order Placed! 🎉</h3>
                <p className="text-sm text-gray-400 dark:text-slate-400 font-semibold mt-1">
                  Payment: {activeMethodDetails?.label || "Cash on Delivery"}
                </p>
                <p className="text-lg font-black text-violet-600 dark:text-violet-400 mt-2">
                  Total: ₹{finalTotal}
                </p>
                {orderId && (
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-1">
                    ID: #{orderId.substring(orderId.length - 8)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top App Bar */}
      <div className="sticky top-0 bg-white dark:bg-[#090D16] border-b border-gray-100 dark:border-slate-800/80 flex items-center px-4 py-4 z-40 transition-colors duration-300">
        <button 
          onClick={completePayment}
          className="w-10 h-10 rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center justify-center mr-3 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-800 dark:text-slate-200" />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Payment</h2>
      </div>

      <div className="w-full max-w-md mx-auto px-4 mt-4 space-y-6 flex-1">
        {/* Order Summary Card */}
        <div className="bg-white dark:bg-[#111724] border border-gray-100 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm dark:shadow-none text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Receipt size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Order Summary</h3>
          </div>
          
          <hr className="border-gray-50 dark:border-slate-800/60 mb-3" />
          
          <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Item Total</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹{itemTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Handling Charge</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹{handlingCharge}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">₹{deliveryFee}</span>
            </div>
            {appliedCoupon && couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-555 font-semibold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>- ₹{couponDiscount}</span>
              </div>
            )}
            
            <hr className="border-gray-50 dark:border-slate-800/60 my-2" />
            
            <div className="flex justify-between text-base font-black text-slate-850 dark:text-slate-250">
              <span>Total</span>
              <span className="text-violet-600 dark:text-violet-400">₹{grandTotal}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-left space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Choose Payment Method</h3>
          <div className="space-y-3">
            {PAYMENT_METHODS.map(method => {
              const Icon = method.icon;
              const isSelected = selectedPaymentMethod === method.id;
              
              return (
                <div
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? "border-violet-600 bg-cyan-50/20 dark:bg-cyan-950/20 shadow-md dark:shadow-none" 
                      : "border-gray-100 dark:border-slate-800 hover:bg-gray-50/50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-cyan-600 text-white" : "bg-cyan-100 dark:bg-cyan-950/50 text-violet-600 dark:text-cyan-450"
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{method.label}</h4>
                      <p className="text-xs text-gray-400 dark:text-slate-450 mt-0.5">{method.subtitle}</p>
                    </div>
                  </div>
                  
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-slate-700" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pinned Bottom Buy Button */}
      <div className="sticky bottom-0 bg-white dark:bg-[#090D16] border-t border-gray-100 dark:border-slate-800/80 p-4 z-40 transition-colors duration-300">
        <div className="max-w-md mx-auto">
          {!selectedPaymentMethod && (
            <p className="text-xs text-gray-400 dark:text-slate-450 text-center mb-3">Please select a payment method</p>
          )}
          <button
            onClick={handleBuyClick}
            disabled={!selectedPaymentMethod}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-base rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Buy It  •  ₹{grandTotal}</span>
          </button>
        </div>
      </div>

      <style>{`
        .scale-in-out {
          animation: scaleInOut 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scaleInOut {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
});

PaymentScreen.displayName = "PaymentScreen";

