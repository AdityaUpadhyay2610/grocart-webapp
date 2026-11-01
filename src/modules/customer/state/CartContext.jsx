/* eslint-disable react-refresh/only-export-components */
import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  loadCartThunk, 
  addToCartThunk, 
  decreaseCartItemThunk, 
  placeOrderThunk,
  triggerAddToCartAnimation as triggerAddToCartAnimationAction,
  clearAnimatingItem as clearAnimatingItemAction,
  proceedToPay as proceedToPayAction,
  cancelPayment as cancelPaymentAction,
  setPaymentMethod as setPaymentMethodAction,
  applyCouponCode as applyCouponCodeAction,
  removeAppliedCoupon as removeAppliedCouponAction
} from './cartSlice';
import { validateCoupon } from '../services/couponRepository';

// Legacy provider for backward compatibility (no-op context)
export const CartProvider = ({ children }) => {
  return <>{children}</>;
};

export const useCart = () => {
  const dispatch = useDispatch();
  const cartState = useSelector((state) => state.cart);

  const loadCart = useCallback(() => dispatch(loadCartThunk()), [dispatch]);
  const addToCart = useCallback((product) => dispatch(addToCartThunk(product)), [dispatch]);
  const decreaseCartItem = useCallback((item) => dispatch(decreaseCartItemThunk(item)), [dispatch]);
  const triggerAddToCartAnimation = useCallback((product) => {
    dispatch(triggerAddToCartAnimationAction(product));
    setTimeout(() => {
      dispatch(clearAnimatingItemAction());
    }, 800);
  }, [dispatch]);
  const proceedToPay = useCallback(() => dispatch(proceedToPayAction()), [dispatch]);
  const cancelPayment = useCallback(() => dispatch(cancelPaymentAction()), [dispatch]);
  const setPaymentMethod = useCallback((method) => dispatch(setPaymentMethodAction(method)), [dispatch]);
  const applyCouponCode = useCallback(async (code) => {
    try {
      const coupon = await validateCoupon(code, cartState.cartItems);
      dispatch(applyCouponCodeAction(coupon));
      return null;
    } catch (error) {
      const message = error.response?.data?.message || 'Could not validate this coupon.';
      return message;
    }
  }, [dispatch, cartState.cartItems]);
  const removeAppliedCoupon = useCallback(() => dispatch(removeAppliedCouponAction()), [dispatch]);
  const completePayment = useCallback(() => dispatch(cancelPaymentAction()), [dispatch]);
  const placeOrder = useCallback(async () => {
    return await dispatch(placeOrderThunk()).unwrap();
  }, [dispatch]);

  return {
    ...cartState,
    loadCart,
    addToCart,
    decreaseCartItem,
    triggerAddToCartAnimation,
    proceedToPay,
    cancelPayment,
    setPaymentMethod,
    applyCouponCode,
    removeAppliedCoupon,
    completePayment,
    placeOrder
  };
};
