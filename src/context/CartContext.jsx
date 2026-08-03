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
} from "../store/cartSlice";
import { applyCoupon } from "../services/calculations";

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
  const applyCouponCode = useCallback((code) => {
    const { error } = applyCoupon(code, cartState.itemTotal);
    if (!error) {
      dispatch(applyCouponCodeAction(code));
    }
    return error;
  }, [dispatch, cartState.itemTotal]);
  const removeAppliedCoupon = useCallback(() => dispatch(removeAppliedCouponAction()), [dispatch]);
  const completePayment = useCallback(() => dispatch(cancelPaymentAction()), [dispatch]);
  const placeOrder = useCallback(async () => {
    try {
      const orderId = await dispatch(placeOrderThunk()).unwrap();
      return orderId;
    } catch (e) {
      throw e;
    }
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
