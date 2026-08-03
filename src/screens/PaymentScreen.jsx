import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { CreditCard, Truck, Smartphone, Wallet, CheckCircle, Loader2, ArrowLeft, Receipt, Check } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "COD", label: "Cash on Delivery", subtitle: "Pay when you receive", icon: Truck },
  { id: "CARD", label: "Card Payment", subtitle: "Visa, Mastercard, RuPay", icon: CreditCard },
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

  // New States for Card Payment Screen and Popup Dialogs
  const [showCardScreen, setShowCardScreen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: ""
  });

  const handleMethodSelect = useCallback((methodId) => {
    if (methodId === "COD") {
      setPaymentMethod("COD");
    } else if (methodId === "CARD") {
      setPaymentMethod("CARD");
      setShowCardScreen(true);
      setPopupMessage("this payment method is not avialable right now coming soon try COD");
      setShowPopup(true);
    } else {
      // UPI or WALLET
      setPopupMessage("this payment method is not avialable right now coming soon try COD");
      setShowPopup(true);
    }
  }, [setPaymentMethod]);

  const handleCardInputChange = useCallback((field, val) => {
    let cleanVal = val;
    if (field === "number") {
      cleanVal = val.replace(/\D/g, "").substring(0, 16);
      cleanVal = cleanVal.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (field === "expiry") {
      cleanVal = val.replace(/\D/g, "").substring(0, 4);
      if (cleanVal.length > 2) {
        cleanVal = cleanVal.substring(0, 2) + "/" + cleanVal.substring(2);
      }
    } else if (field === "cvv") {
      cleanVal = val.replace(/\D/g, "").substring(0, 3);
    }
    setCardDetails(prev => ({ ...prev, [field]: cleanVal }));
  }, []);

  const handleCardSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    setPopupMessage("this payment method is not avialable right now coming soon try COD");
    setShowPopup(true);
  }, []);

  const handleSelectCOD = useCallback(() => {
    setPaymentMethod("COD");
    setShowCardScreen(false);
    setShowPopup(false);
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
              <Loader2 className="w-16 h-16 text-primary-500 animate-spin" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Placing your order...</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">Please wait a moment</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/10 dark:shadow-none scale-in-out">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">Order Placed! 🎉</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  Payment: {activeMethodDetails?.label || "Cash on Delivery"}
                </p>
                <p className="text-lg font-black text-primary-600 dark:text-primary-400 mt-2">
                  Total: ₹{finalTotal}
                </p>
                {orderId && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-505 font-mono mt-1">
                    ID: #{orderId.substring(orderId.length - 8)}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top App Bar */}
      <div className="sticky top-0 bg-white dark:bg-[#090D16] border-b border-slate-100 dark:border-slate-800/80 flex items-center px-4 py-4 z-40 transition-colors duration-300">
        <button 
          onClick={completePayment}
          className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center mr-3 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} className="text-slate-850 dark:text-slate-200" />
        </button>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Payment Method</h2>
      </div>

      <div className="w-full max-w-md mx-auto px-4 mt-4 space-y-6 flex-1 text-left">
        {/* Order Summary Card */}
        <div className="bg-white dark:bg-[#111724] border border-slate-105 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm dark:shadow-none text-left">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Receipt size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Order Summary</h3>
          </div>
          
          <hr className="border-slate-100 dark:border-slate-800/60 mb-3" />
          
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
              <div className="flex justify-between text-primary-600 dark:text-primary-400 font-semibold">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>- ₹{couponDiscount}</span>
              </div>
            )}
            
            <hr className="border-slate-100 dark:border-slate-800/60 my-2" />
            
            <div className="flex justify-between text-base font-black text-slate-850 dark:text-white">
              <span>Total</span>
              <span className="text-primary-605 dark:text-primary-400 font-mono">₹{grandTotal}</span>
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
                      ? "border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 shadow-sm dark:shadow-none" 
                      : "border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-805/40"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-primary-500 text-white" : "bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400"
                    }`}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-805 dark:text-slate-200">{method.label}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{method.subtitle}</p>
                    </div>
                  </div>
                  
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 dark:border-slate-800" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pinned Bottom Buy Button */}
      <div className="sticky bottom-0 bg-white dark:bg-[#090D16] border-t border-slate-100 dark:border-slate-800/80 p-4 z-40 transition-colors duration-300">
        <div className="max-w-md mx-auto">
          {!selectedPaymentMethod && (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3">Please select a payment method</p>
          )}
          <button
            onClick={handleBuyClick}
            disabled={!selectedPaymentMethod}
            className="w-full py-4 bg-primary-500 hover:bg-primary-650 text-white font-extrabold text-base rounded-2xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Buy It  •  ₹{grandTotal}</span>
          </button>
        </div>
      </div>

      {/* Card Details Screen Overlay */}
      {showCardScreen && (
        <div className="fixed inset-0 w-full h-full bg-slate-50 dark:bg-[#090D16] z-50 overflow-y-auto pb-8 select-none flex flex-col transition-colors duration-300 animate-slide-in">
          {/* Top App Bar */}
          <div className="sticky top-0 bg-white dark:bg-[#090D16] border-b border-slate-100 dark:border-slate-800/80 flex items-center px-4 py-4 z-45 transition-colors duration-300">
            <button 
              onClick={() => setShowCardScreen(false)}
              className="w-10 h-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center mr-3 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-slate-850 dark:text-slate-200" />
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Card Details</h2>
          </div>

          <div className="w-full max-w-md mx-auto px-4 mt-6 space-y-6 flex-1 flex flex-col items-center">
            {/* Premium Glassmorphic Credit Card Preview */}
            <div className="w-full aspect-[1.586] bg-gradient-to-br from-primary-600 to-teal-800 rounded-2xl p-6 text-white relative shadow-xl shadow-primary-500/10 overflow-hidden flex flex-col justify-between select-none border border-white/10">
              {/* Background glow effects */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/20 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl" />

              {/* Top section: Chip & Brand */}
              <div className="flex justify-between items-start z-10">
                {/* Virtual Card Chip */}
                <div className="w-10 h-8 bg-amber-450/80 rounded-md relative overflow-hidden border border-amber-300/40">
                  <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-850/20" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-850/20" />
                </div>
                <span className="font-extrabold tracking-widest text-sm opacity-90">CREDIT CARD</span>
              </div>

              {/* Middle section: Card Number */}
              <div className="text-xl md:text-2xl font-mono tracking-widest text-center my-4 font-bold z-10 drop-shadow-sm min-h-[32px]">
                {cardDetails.number || "•••• •••• •••• ••••"}
              </div>

              {/* Bottom section: Name & Expiry */}
              <div className="flex justify-between items-end z-10">
                <div className="flex flex-col items-start max-w-[70%] text-left">
                  <span className="text-[9px] uppercase tracking-wider text-slate-350 font-bold">Card Holder</span>
                  <span className="text-sm font-bold truncate tracking-wide max-w-full min-h-[20px]">
                    {cardDetails.name.toUpperCase() || "YOUR NAME"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-slate-350 font-bold">Expires</span>
                  <span className="text-sm font-mono font-bold min-h-[20px]">
                    {cardDetails.expiry || "MM/YY"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Details */}
            <form onSubmit={handleCardSubmit} className="w-full space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase pl-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000"
                  value={cardDetails.number}
                  onChange={(e) => handleCardInputChange("number", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#111724] border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-white placeholder-slate-400"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase pl-1">Cardholder Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => handleCardInputChange("name", e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#111724] border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-white placeholder-slate-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-455 dark:text-slate-500 uppercase pl-1">Expiry Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => handleCardInputChange("expiry", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111724] border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-455 dark:text-slate-500 uppercase pl-1">CVV</label>
                  <input 
                    type="password" 
                    placeholder="•••"
                    value={cardDetails.cvv}
                    onChange={(e) => handleCardInputChange("cvv", e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-[#111724] border border-slate-200/60 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors dark:text-white placeholder-slate-400"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-base rounded-2xl shadow-lg mt-6 transition-all active:scale-98 cursor-pointer flex items-center justify-center"
              >
                Pay Now  •  ₹{grandTotal}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Alert Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 w-full h-full bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 select-none animate-fade-in">
          <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative animate-scale-in flex flex-col items-center">
            {/* Alert Icon */}
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-955/20 rounded-full flex items-center justify-center text-amber-500 mb-4 animate-bounce-subtle border border-amber-100/10">
              <CreditCard size={32} />
            </div>

            <h3 className="text-lg font-black text-slate-805 dark:text-slate-100 tracking-tight">Payment Unavailable</h3>
            
            <p className="text-xs text-slate-405 dark:text-slate-400 font-bold mt-2.5 leading-relaxed capitalize">
              {popupMessage}
            </p>

            <div className="w-full mt-6 space-y-2">
              <button
                onClick={handleSelectCOD}
                className="w-full py-3 bg-primary-500 hover:bg-primary-650 text-white font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Try Cash on Delivery (COD)
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-355 font-black text-xs rounded-xl transition-colors cursor-pointer border border-slate-100 dark:border-transparent"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scale-in-out {
          animation: scaleInOut 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes scaleInOut {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.25s ease forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
});

PaymentScreen.displayName = "PaymentScreen";
