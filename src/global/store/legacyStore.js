import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./legacyAuthSlice";
import cartReducer from "../../modules/customer/state/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer
  },
  // Disable serializability check if needed, or leave defaults
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
