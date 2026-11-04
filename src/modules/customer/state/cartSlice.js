import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCart, saveCartItem, removeCartItem, clearCart } from "../services/cartRepository";
import { placeOrder as dbPlaceOrder } from "../services/orderRepository";
import {
  calculateItemTotal,
  calculateHandlingCharge,
  getDeliveryFee,
  calculateGrandTotal
} from "@global/utils/calculations";

const initialState = {
  cartItems: [],
  showPaymentScreen: false,
  selectedPaymentMethod: null,
  appliedCoupon: null,
  animatingItem: null,
  itemTotal: 0,
  handlingCharge: 0,
  deliveryFee: getDeliveryFee(),
  couponDiscount: 0,
  grandTotal: 0
};

const recalculateTotals = (state) => {
  state.itemTotal = calculateItemTotal(state.cartItems);
  state.handlingCharge = calculateHandlingCharge(state.itemTotal);
  state.deliveryFee = getDeliveryFee();
  state.couponDiscount = state.appliedCoupon?.discount || 0;
  state.grandTotal = calculateGrandTotal(
    state.itemTotal,
    state.handlingCharge,
    state.deliveryFee,
    state.couponDiscount
  );
};

export const loadCartThunk = createAsyncThunk(
  "cart/loadCart",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const userId = auth.user?.uid || auth.user?.id;
    if (!userId) return [];
    try {
      const items = await fetchCart(userId);
      return items;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const addToCartThunk = createAsyncThunk(
  "cart/addToCart",
  async (product, { getState, rejectWithValue, dispatch }) => {
    const { auth, cart } = getState();
    const userId = auth.user?.uid || auth.user?.id;
    if (!userId) return rejectWithValue("User not logged in");

    const unit = product.itemQuantity || product.unit || "500g";
    const cartItemId = product.cartItemId || (unit ? `${product.id}_${unit.replace(/\s+/g, '')}` : product.id);

    const existing = cart.cartItems.find(item => item.id === cartItemId || item.id === product.id);
    const newQuantity = (existing?.quantity || 0) + 1;
    const stockLimit = product.itemStock || 99;

    if (newQuantity > stockLimit) {
      return rejectWithValue("Out of stock");
    }

    const cartItem = {
      id: existing ? existing.id : cartItemId,
      productId: product.productId || product.id,
      itemName: product.itemName,
      itemPrice: Number(product.itemPrice) || 0,
      itemQuantity: unit,
      imageUrl: product.imageUrl || product.image || '',
      retailerId: product.retailerId || "",
      itemStock: stockLimit,
      quantity: newQuantity
    };

    dispatch(cartSlice.actions.updateItemOptimistic(cartItem));

    try {
      await saveCartItem(userId, cartItem);
    } catch (e) {
      console.error("Failed to sync add cart item:", e);
      dispatch(loadCartThunk());
      return rejectWithValue(e.message);
    }
  }
);

export const decreaseCartItemThunk = createAsyncThunk(
  "cart/decreaseCartItem",
  async (item, { getState, rejectWithValue, dispatch }) => {
    const { auth } = getState();
    const userId = auth.user?.uid || auth.user?.id;
    if (!userId) return rejectWithValue("User not logged in");

    if (item.quantity <= 1) {
      dispatch(cartSlice.actions.removeItemOptimistic(item.id));
      try {
        await removeCartItem(userId, item.id);
      } catch (e) {
        console.error("Failed to sync remove cart item:", e);
        dispatch(loadCartThunk());
        return rejectWithValue(e.message);
      }
    } else {
      const updatedItem = {
        ...item,
        quantity: item.quantity - 1
      };
      dispatch(cartSlice.actions.updateItemOptimistic(updatedItem));
      try {
        await saveCartItem(userId, updatedItem);
      } catch (e) {
        console.error("Failed to sync decrease cart item:", e);
        dispatch(loadCartThunk());
        return rejectWithValue(e.message);
      }
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, dispatch }) => {
    const { auth } = getState();
    const userId = auth.user?.uid || auth.user?.id;
    
    // Immediately clear local Redux state
    dispatch(cartSlice.actions.clearCartState());
    localStorage.removeItem("grocart_guest_cart");

    // Clear backend database
    if (userId) {
      try {
        await clearCart(userId);
      } catch (e) {
        console.warn("Failed to clear backend cart:", e);
      }
    }
    return true;
  }
);

export const placeOrderThunk = createAsyncThunk(
  "cart/placeOrder",
  async (_, { getState, rejectWithValue, dispatch }) => {
    const { auth, cart } = getState();
    const userId = auth.user?.uid || auth.user?.id;
    if (!userId || cart.cartItems.length === 0) {
      return rejectWithValue("Order placement requirements not met");
    }

    try {
      const order = {
        items: cart.cartItems,
        couponCode: cart.appliedCoupon?.code
      };

      const orderId = await dbPlaceOrder(userId, order);
      if (orderId) {
        dispatch(clearCartThunk());
        return orderId;
      }
      return rejectWithValue("Could not place order");
    } catch (e) {
      console.error("Failed to place order:", e);
      return rejectWithValue(e.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    updateItemOptimistic(state, action) {
      const updatedItem = action.payload;
      const idx = state.cartItems.findIndex(item => item.id === updatedItem.id);
      if (idx > -1) {
        state.cartItems[idx] = updatedItem;
      } else {
        state.cartItems.push(updatedItem);
      }
      state.appliedCoupon = null;
      recalculateTotals(state);
    },
    removeItemOptimistic(state, action) {
      const id = action.payload;
      state.cartItems = state.cartItems.filter(item => item.id !== id);
      state.appliedCoupon = null;
      recalculateTotals(state);
    },
    triggerAddToCartAnimation(state, action) {
      state.animatingItem = action.payload;
    },
    clearAnimatingItem(state) {
      state.animatingItem = null;
    },
    proceedToPay(state) {
      state.showPaymentScreen = true;
    },
    cancelPayment(state) {
      state.showPaymentScreen = false;
    },
    setPaymentMethod(state, action) {
      state.selectedPaymentMethod = action.payload;
    },
    applyCouponCode(state, action) {
      state.appliedCoupon = action.payload;
      recalculateTotals(state);
    },
    removeAppliedCoupon(state) {
      state.appliedCoupon = null;
      recalculateTotals(state);
    },
    clearCartState(state) {
      state.cartItems = [];
      state.appliedCoupon = null;
      state.selectedPaymentMethod = null;
      state.showPaymentScreen = false;
      recalculateTotals(state);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCartThunk.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        recalculateTotals(state);
      })
      .addCase(placeOrderThunk.fulfilled, (state) => {
        state.cartItems = [];
        state.appliedCoupon = null;
        state.selectedPaymentMethod = null;
        state.showPaymentScreen = false;
        recalculateTotals(state);
      })
      .addCase(clearCartThunk.fulfilled, (state) => {
        state.cartItems = [];
        state.appliedCoupon = null;
        state.selectedPaymentMethod = null;
        state.showPaymentScreen = false;
        recalculateTotals(state);
      });
  }
});

export const {
  triggerAddToCartAnimation,
  clearAnimatingItem,
  proceedToPay,
  cancelPayment,
  setPaymentMethod,
  applyCouponCode,
  removeAppliedCoupon,
  clearCartState
} = cartSlice.actions;

export default cartSlice.reducer;
