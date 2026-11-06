import { useState, useMemo, useCallback } from "react";
import { useCart } from "../state/CartContext";
import { calculateGST, calculateEcoSavings } from "@global/utils/calculations";

export function useCartScreen() {
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

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const gstAmount = useMemo(() => calculateGST(itemTotal), [itemTotal]);
  const ecoSavings = useMemo(() => calculateEcoSavings(cartItems), [cartItems]);

  const totalItemsCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }, [cartItems]);

  const handleApplyCoupon = useCallback(async (code) => {
    const error = await applyCouponCode(code);
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

  return {
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
  };
}

