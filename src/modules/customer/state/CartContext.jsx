/* eslint-disable react-refresh/only-export-components */
import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  loadCartThunk, 
  addToCartThunk, 
  decreaseCartItemThunk, 
  placeOrderThunk,
  clearCartThunk,
  triggerAddToCartAnimation as triggerAddToCartAnimationAction,
  clearAnimatingItem as clearAnimatingItemAction,
  proceedToPay as proceedToPayAction,
  cancelPayment as cancelPaymentAction,
  setPaymentMethod as setPaymentMethodAction,
  applyCouponCode as applyCouponCodeAction,
  removeAppliedCoupon as removeAppliedCouponAction
} from './cartSlice';
import { validateCoupon } from '../services/couponRepository';

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

  const clearCartData = useCallback(() => {
    dispatch(clearCartThunk());
  }, [dispatch]);

  const completePayment = useCallback(() => {
    dispatch(clearCartThunk());
    dispatch(cancelPaymentAction());
  }, [dispatch]);

  const placeOrder = useCallback(async () => {
    const orderId = await dispatch(placeOrderThunk()).unwrap();
    dispatch(clearCartThunk());
    return orderId;
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
    clearCartData,
    clearCart: clearCartData,
    completePayment,
    placeOrder
  };
};
