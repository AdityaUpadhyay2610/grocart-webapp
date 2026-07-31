import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { fetchCart, saveCartItem, removeCartItem, clearCart } from "../services/cartRepository";
import { placeOrder as dbPlaceOrder } from "../services/orderRepository";
import { CartItem } from "../models/CartItem";
import { Order } from "../models/Order";
import {
  calculateItemTotal,
  calculateHandlingCharge,
  getDeliveryFee,
  calculateCouponDiscount,
  calculateGrandTotal,
  applyCoupon
} from "../services/calculations";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [showPaymentScreen, setShowPaymentScreen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [animatingItem, setAnimatingItem] = useState(null);

  // Sync / Load cart when user changes
  const loadCart = useCallback(async () => {
    if (user?.id) {
      const items = await fetchCart(user.id);
      setCartItems(items);
    } else {
      setCartItems([]);
    }
  }, [user]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Heavy computations memoized
  const itemTotal = useMemo(() => calculateItemTotal(cartItems), [cartItems]);
  const handlingCharge = useMemo(() => calculateHandlingCharge(itemTotal), [itemTotal]);
  const deliveryFee = useMemo(() => getDeliveryFee(), []);
  
  const couponDiscount = useMemo(() => 
    calculateCouponDiscount(appliedCoupon, itemTotal), 
    [appliedCoupon, itemTotal]
  );
  
  const grandTotal = useMemo(() => 
    calculateGrandTotal(itemTotal, handlingCharge, deliveryFee, couponDiscount), 
    [itemTotal, handlingCharge, deliveryFee, couponDiscount]
  );

  // Add Item to Cart (Firebase + Local Sync)
  const addToCart = useCallback(async (product) => {
    if (!user?.id) return;
    
    // Find existing item
    const existing = cartItems.find(item => item.id === product.id);
    const newQuantity = (existing?.quantity || 0) + 1;
    
    const cartItem = new CartItem({
      id: product.id,
      itemName: product.itemName,
      itemPrice: product.itemPrice,
      imageUrl: product.imageUrl,
      quantity: newQuantity
    });

    // Optimistic UI update
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = cartItem;
        return updated;
      }
      return [...prev, cartItem];
    });

    try {
      await saveCartItem(user.id, cartItem);
    } catch (e) {
      console.error("Failed to sync add cart item:", e);
      loadCart(); // Rollback on failure
    }
  }, [user, cartItems, loadCart]);

  // Decrease quantity or remove item
  const decreaseCartItem = useCallback(async (item) => {
    if (!user?.id) return;

    if (item.quantity <= 1) {
      // Optimistic UI update
      setCartItems(prev => prev.filter(i => i.id !== item.id));
      try {
        await removeCartItem(user.id, item.id);
      } catch (e) {
        console.error("Failed to sync remove cart item:", e);
        loadCart(); // Rollback
      }
    } else {
      const updatedItem = new CartItem({
        ...item,
        quantity: item.quantity - 1
      });
      // Optimistic UI update
      setCartItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
      try {
        await saveCartItem(user.id, updatedItem);
      } catch (e) {
        console.error("Failed to sync decrease cart item:", e);
        loadCart(); // Rollback
      }
    }
  }, [user, loadCart]);

  const triggerAddToCartAnimation = useCallback((product) => {
    setAnimatingItem(product);
    setTimeout(() => {
      setAnimatingItem(null);
    }, 800);
  }, []);

  const proceedToPay = useCallback(() => {
    setShowPaymentScreen(true);
  }, []);

  const cancelPayment = useCallback(() => {
    setShowPaymentScreen(false);
  }, []);

  const setPaymentMethod = useCallback((method) => {
    setSelectedPaymentMethod(method);
  }, []);

  const applyCouponCode = useCallback((code) => {
    const { error, coupon } = applyCoupon(code, itemTotal);
    if (!error) {
      setAppliedCoupon(coupon);
    }
    return error;
  }, [itemTotal]);

  const removeAppliedCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const completePayment = useCallback(() => {
    setShowPaymentScreen(false);
  }, []);

  // Place Order on Firebase (and clear cart)
  const placeOrder = useCallback(async () => {
    if (!user?.id || cartItems.length === 0) return null;
    
    try {
      const order = new Order({
        items: cartItems,
        timestamp: Date.now(),
        totalPaid: grandTotal,
        couponDiscount: couponDiscount
      });

      // Place order in DB
      const orderId = await dbPlaceOrder(user.id, order);
      if (orderId) {
        // Clear remote cart
        await clearCart(user.id);
        // Clear local cart
        setCartItems([]);
        setAppliedCoupon(null);
        setSelectedPaymentMethod(null);
        return orderId;
      }
    } catch (e) {
      console.error("Failed to place order:", e);
      throw e;
    }
    return null;
  }, [user, cartItems, grandTotal, couponDiscount]);

  return (
    <CartContext.Provider value={{
      cartItems,
      showPaymentScreen,
      selectedPaymentMethod,
      appliedCoupon,
      animatingItem,
      itemTotal,
      handlingCharge,
      deliveryFee,
      couponDiscount,
      grandTotal,
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
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
