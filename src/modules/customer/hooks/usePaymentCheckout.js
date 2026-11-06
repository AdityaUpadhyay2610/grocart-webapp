import { useState, useMemo, useCallback } from "react";
import { appConfig } from "@global/config/appConfig";
import { formatINR } from "@global/utils/calculations";
import { loadRazorpayScript } from "@global/utils/loadRazorpay";
import { createRazorpayOrder, verifyRazorpayPayment } from "../services/orderRepository";
import { UPI_APPS, POPULAR_BANKS, OTHER_BANKS } from "../constants/paymentConstants";

export function usePaymentCheckout({
  cartItems = [],
  grandTotal = 0,
  appliedCoupon = null,
  user = null,
  onPaymentConfirmed = () => {},
  completePayment = () => {},
  placeOrder = async () => {},
  clearCartData = () => {}
}) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [selectedUpiApp, setSelectedUpiApp] = useState("phonepe");
  const [upiIdInput, setUpiIdInput] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC");
  const [orderStage, setOrderStage] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [finalTotal, setFinalTotal] = useState(grandTotal);

  const activeMethodDisplay = useMemo(() => {
    if (selectedPaymentMethod === "COD") return "Cash on Delivery";
    if (selectedPaymentMethod === "UPI") {
      const app = UPI_APPS.find((a) => a.id === selectedUpiApp);
      return app ? `UPI (${app.name})` : "UPI";
    }
    if (selectedPaymentMethod === "NETBANKING") {
      const allBanks = [...POPULAR_BANKS, ...OTHER_BANKS];
      const bank = allBanks.find((b) => b.code === selectedBank);
      return bank ? `Net Banking (${bank.name})` : "Net Banking";
    }
    if (selectedPaymentMethod === "CARD") return "Credit / Debit Card";
    if (selectedPaymentMethod === "WALLET") return "Wallet / Postpaid";
    return "Not Selected";
  }, [selectedPaymentMethod, selectedUpiApp, selectedBank]);

  const getPayButtonLabel = useCallback(() => {
    if (selectedPaymentMethod === "COD") {
      return `Confirm Order (Total = ${formatINR(grandTotal)})`;
    }
    if (selectedPaymentMethod === "UPI") {
      return `Pay and Confirm Order (${formatINR(grandTotal)})`;
    }
    return `Pay ${formatINR(grandTotal)}`;
  }, [selectedPaymentMethod, grandTotal]);

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
        key: rzpOrderData.keyId || appConfig.razorpayKeyId,
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
    placeOrder,
    clearCartData,
    cartItems,
    appliedCoupon,
    user,
    selectedUpiApp,
    upiIdInput,
    selectedBank,
    activeMethodDisplay,
    completePayment,
    onPaymentConfirmed
  ]);

  return {
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    selectedUpiApp,
    setSelectedUpiApp,
    upiIdInput,
    setUpiIdInput,
    selectedBank,
    setSelectedBank,
    orderStage,
    setOrderStage,
    orderId,
    finalTotal,
    activeMethodDisplay,
    getPayButtonLabel,
    handleBuyClick
  };
}

