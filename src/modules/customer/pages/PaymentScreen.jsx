import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useCart } from "../state/CartContext";
import { formatINR } from "@global/utils/calculations";
import { loadRazorpayScript } from "@global/utils/loadRazorpay";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/orderRepository";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Lock,
  CheckCircle,
  Loader2,
  Smartphone,
  Wallet,
  Landmark,
  Check
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "COD",
    name: "Cash on Delivery (COD)",
    description: "Pay with cash or UPI directly to delivery partner at doorstep",
    icon: Banknote,
    badge: "Most Popular",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  },
  {
    id: "UPI",
    name: "UPI",
    description: "Instant payment via PhonePe, Paytm, Google Pay, CRED or UPI ID",
    icon: Smartphone,
    badge: "Fastest",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  {
    id: "CARD",
    name: "Credit or Debit Card",
    description: "Visa, Mastercard, RuPay & Maestro accepted via Razorpay",
    icon: CreditCard,
    badge: "Instant 5% Off",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  {
    id: "NETBANKING",
    name: "Net Banking",
    description: "50+ major Indian banks: SBI, HDFC, ICICI, Axis, Kotak, PNB & more",
    icon: Landmark,
    badge: "Direct Bank",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10"
  },
  {
    id: "WALLET",
    name: "Wallets",
    description: "Amazon Pay, Mobikwik, Airtel Money & other digital wallets",
    icon: Wallet,
    badge: null,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10"
  }
];

const UPI_APPS = [
  { id: "phonepe", name: "PhonePe", tag: "Most used" },
  { id: "paytm", name: "Paytm", tag: "Instant" },
  { id: "gpay", name: "Google Pay", tag: "Fast" },
  { id: "cred", name: "CRED", tag: "Cashback" },
  { id: "other", name: "Any Other UPI ID / QR", tag: "All Apps" }
];

const POPULAR_BANKS = [
  { code: "HDFC", name: "HDFC Bank" },
  { code: "SBIN", name: "State Bank of India (SBI)" },
  { code: "ICIC", name: "ICICI Bank" },
  { code: "UTIB", name: "Axis Bank" },
  { code: "KKBK", name: "Kotak Mahindra Bank" },
  { code: "PUNB", name: "Punjab National Bank" }
];

const OTHER_BANKS = [
  { code: "BARB_R", name: "Bank of Baroda" },
  { code: "CNRB", name: "Canara Bank" },
  { code: "UBIN", name: "Union Bank of India" },
  { code: "INDB", name: "IndusInd Bank" },
  { code: "YESB", name: "Yes Bank" },
  { code: "IDFB", name: "IDFC FIRST Bank" },
  { code: "FDRL", name: "Federal Bank" },
  { code: "IOBA", name: "Indian Overseas Bank" },
  { code: "CBIN", name: "Central Bank of India" }
];

export const PaymentScreen = React.memo(({ onPaymentConfirmed }) => {
  const {
    cartItems,
    deliveryFee,
    couponDiscount,
    grandTotal,
    appliedCoupon,
    selectedPaymentMethod,
    setPaymentMethod,
    placeOrder,
    completePayment,
    clearCartData
  } = useCart();

  const user = useSelector((state) => state.auth.user);
  const [orderStage, setOrderStage] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [finalTotal, setFinalTotal] = useState(0);

  const [selectedUpiApp, setSelectedUpiApp] = useState("phonepe");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");

  const handleMethodSelect = useCallback((methodId) => {
    setPaymentMethod(methodId);
  }, [setPaymentMethod]);

  const activeMethodDisplay = useMemo(() => {
    if (selectedPaymentMethod === "UPI") {
      const app = UPI_APPS.find(a => a.id === selectedUpiApp);
      if (selectedUpiApp === "other" && upiIdInput.trim()) {
        return `UPI (${upiIdInput.trim()})`;
      }
      return `UPI (${app ? app.name : "UPI App"})`;
    }
    if (selectedPaymentMethod === "NETBANKING") {
      const bank = POPULAR_BANKS.find(b => b.code === selectedBank) || OTHER_BANKS.find(b => b.code === selectedBank);
      return `Net Banking (${bank ? bank.name : selectedBank})`;
    }
    if (selectedPaymentMethod === "CARD") return "Credit or Debit Card";
    if (selectedPaymentMethod === "WALLET") return "Wallet";
    return "Cash on Delivery (COD)";
  }, [selectedPaymentMethod, selectedUpiApp, upiIdInput, selectedBank]);

  const handleBuyClick = useCallback(async () => {
    if (!selectedPaymentMethod) return;

    setFinalTotal(grandTotal);

    if (selectedPaymentMethod === "COD") {
      setOrderStage("processing");
      try {
        const newOrderId = await placeOrder();
        clearCartData();
        setOrderId(newOrderId);

        setTimeout(() => {
          setOrderStage("success");
          setTimeout(() => {
            setOrderStage(null);
            completePayment();
            onPaymentConfirmed();
          }, 2000);
        }, 1200);
      } catch (e) {
        console.error("Order placement failed:", e);
        alert(e.response?.data?.message || "Order placement failed. Please try again.");
        setOrderStage(null);
      }
      return;
    }

    setOrderStage("processing");

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Could not connect to Razorpay payment gateway. Please check your internet connection.");
      setOrderStage(null);
      return;
    }

    try {
      const rzpOrderData = await createRazorpayOrder({
        items: cartItems,
        couponCode: appliedCoupon?.code
      });

      const prefillConfig = {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phoneNumber || ""
      };

      if (selectedPaymentMethod === "UPI") {
        prefillConfig.method = "upi";
        if (selectedUpiApp === "other" && upiIdInput.trim()) {
          prefillConfig.vpa = upiIdInput.trim();
        }
      } else if (selectedPaymentMethod === "NETBANKING") {
        prefillConfig.method = "netbanking";
        prefillConfig.bank = selectedBank;
      }

      const options = {
        key: rzpOrderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency || "INR",
        name: "GroCart Quick Commerce",
        description: `Fresh Grocery Order #${rzpOrderData.receipt}`,
        image: "/favicon.png",
        order_id: rzpOrderData.razorpayOrderId,
        prefill: prefillConfig,
        theme: {
          color: "#0C8346"
        },
        handler: async function (response) {
          try {
            const confirmedOrderId = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems,
              couponCode: appliedCoupon?.code,
              paymentMethod: activeMethodDisplay
            });

            clearCartData();
            setOrderId(confirmedOrderId);
            setOrderStage("success");

            setTimeout(() => {
              setOrderStage(null);
              completePayment();
              onPaymentConfirmed();
            }, 2000);
          } catch (verifyErr) {
            console.error("Payment verification failed:", verifyErr);
            alert("Payment completed but signature verification failed. Please contact GroCart support.");
            setOrderStage(null);
          }
        },
        modal: {
          ondismiss: function () {
            setOrderStage(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        alert(`Payment Failed: ${response.error?.description || "Transaction cancelled"}`);
        setOrderStage(null);
      });
      rzp.open();

    } catch (err) {
      console.error("Failed to start Razorpay checkout:", err);
      alert(err.response?.data?.message || "Failed to initialize payment gateway.");
      setOrderStage(null);
    }
  }, [
    selectedPaymentMethod,
    grandTotal,
    cartItems,
    appliedCoupon,
    user,
    selectedUpiApp,
    upiIdInput,
    selectedBank,
    activeMethodDisplay,
    placeOrder,
    clearCartData,
    completePayment,
    onPaymentConfirmed
  ]);
  // Place this right above the return statement in PaymentScreen.jsx
  const getPayButtonLabel = () => {
    if (selectedPaymentMethod === "COD") {
      return `Confirm Order (Total = ${formatINR(grandTotal)})`;
    }
    if (selectedPaymentMethod === "UPI") {
      return `Pay and Confirm Order (${formatINR(grandTotal)})`;
    }
    return `Pay ${formatINR(grandTotal)}`;
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-surface-container-lowest dark:bg-[#0a0a0a] text-on-surface dark:text-white z-50 overflow-y-auto pb-8 select-none flex flex-col transition-colors duration-300">
      
      {orderStage && (
        <div className="fixed inset-0 w-full h-full bg-surface-container-lowest dark:bg-[#0a0a0a] z-[60] flex flex-col items-center justify-center p-8 animate-fade-in">
          {orderStage === "processing" ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <h3 className="text-2xl font-black text-on-surface dark:text-white">Connecting to Payment Gateway...</h3>
              <p className="text-sm text-on-surface-variant">Please complete payment in the secure window</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-gradient-to-tr from-primary to-primary-container rounded-full flex items-center justify-center shadow-lg shadow-primary/20 scale-in-out">
                <CheckCircle className="w-14 h-14 text-on-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-on-surface dark:text-white">Payment Confirmed!</h3>
                <p className="text-sm text-on-surface-variant font-medium">Order #{orderId ? orderId.substring(orderId.length - 6).toUpperCase() : "GC-9823"} placed successfully</p>
                <p className="text-xs text-primary font-bold">Paid {formatINR(finalTotal)} via {activeMethodDisplay}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="sticky top-0 bg-surface-container-lowest/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-surface-variant/40 dark:border-[#262626] z-10 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={completePayment}
            className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Cart</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            <Lock size={12} />
            <span>100% Secure Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
        <div>
          <h1 className="font-display-lg text-2xl sm:text-3xl font-black text-on-surface dark:text-white">Select Payment Method</h1>
          <p className="text-xs text-on-surface-variant mt-1">Choose how you would like to pay for your fresh delivery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 flex flex-col gap-3">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPaymentMethod === method.id;
              const Icon = method.icon;

              return (
                <div key={method.id} className="flex flex-col">
                  <div
                    onClick={() => handleMethodSelect(method.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                        : "border-surface-variant/40 dark:border-[#262626] bg-surface-container-low dark:bg-[#171717] hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${method.bgColor} ${method.color}`}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white">{method.name}</h4>
                          {method.badge && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/20 text-primary">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{method.description}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary"
                        : "border-surface-variant dark:border-[#353534]"
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white dark:bg-black" />}
                    </div>
                  </div>

                  {/* Sub-options for UPI */}
                  {isSelected && method.id === "UPI" && (
                    <div className="mt-2 p-4 rounded-2xl bg-surface-container-low dark:bg-[#171717] border border-primary/30 flex flex-col gap-3">
                      <span className="text-xs font-bold text-on-surface dark:text-white">Choose your UPI App:</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {UPI_APPS.map((app) => {
                          const isAppSelected = selectedUpiApp === app.id;
                          return (
                            <button
                              key={app.id}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.id)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                isAppSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                  : "border-surface-variant/40 dark:border-[#262626] bg-surface-container dark:bg-[#201f1f] text-on-surface dark:text-white hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{app.name}</span>
                                {isAppSelected && <Check size={14} className="text-primary" />}
                              </div>
                              <span className="text-[10px] text-on-surface-variant mt-0.5">{app.tag}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedUpiApp === "other" && (
                        <div className="mt-2 flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-on-surface dark:text-white">Enter UPI ID / VPA</label>
                          <input
                            type="text"
                            value={upiIdInput}
                            onChange={(e) => setUpiIdInput(e.target.value)}
                            placeholder="e.g. mobile@paytm or name@okhdfcbank"
                            className="w-full bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface dark:text-white focus:outline-none focus:border-primary"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-options for Net Banking */}
                  {isSelected && method.id === "NETBANKING" && (
                    <div className="mt-2 p-4 rounded-2xl bg-surface-container-low dark:bg-[#171717] border border-primary/30 flex flex-col gap-3">
                      <span className="text-xs font-bold text-on-surface dark:text-white">Select Popular Bank:</span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POPULAR_BANKS.map((bank) => {
                          const isBankSelected = selectedBank === bank.code;
                          return (
                            <button
                              key={bank.code}
                              type="button"
                              onClick={() => setSelectedBank(bank.code)}
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                isBankSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                  : "border-surface-variant/40 dark:border-[#262626] bg-surface-container dark:bg-[#201f1f] text-on-surface dark:text-white hover:border-primary/40"
                              }`}
                            >
                              <span className="text-xs font-bold truncate">{bank.name}</span>
                              {isBankSelected && <Check size={14} className="text-primary shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-on-surface-variant">Or choose another bank</label>
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
