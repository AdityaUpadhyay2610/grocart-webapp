import { configureStore, createSlice, PayloadAction, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { UserProfile, ProductItem } from '../../domain/models';

const storage = {
  getItem(key: string) {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  }
};

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
    },
    clearSession: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

interface CartItem {
  product: ProductItem;
  quantity: number;
}

interface CartState {
  items: Record<string, CartItem>;
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: {} } as CartState,
  reducers: {
    addToCart: (state, action: PayloadAction<ProductItem>) => {
      const p = action.payload;
      if (state.items[p.id]) {
        state.items[p.id].quantity += 1;
      } else {
        state.items[p.id] = { product: p, quantity: 1 };
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      delete state.items[action.payload];
    },
    clearCart: (state) => {
      state.items = {};
    }
  }
});

export const { setUserProfile, clearSession } = authSlice.actions;
export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  cart: cartSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
