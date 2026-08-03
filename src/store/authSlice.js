import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout, 
  resendVerificationEmail, 
  updateProfile as authUpdateProfile, 
  refreshUser 
} from "../services/firebaseAuth";

const initialState = {
  user: null,
  isGuestSession: false,
  isLoading: false,
  authError: null,
  isEmailVerified: false,
  savedAddress: localStorage.getItem("grocart_address") || "",
  localAddress: localStorage.getItem("grocart_local_address") || ""
};

// Async Thunks
export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    const { user: firebaseUser, error } = await authLogin(email, password);
    if (error) {
      return rejectWithValue(error);
    }
    return {
      id: firebaseUser.uid,
      username: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      emailVerified: firebaseUser.emailVerified
    };
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async ({ username, email, password }, { rejectWithValue }) => {
    const { user: firebaseUser, error } = await authRegister(username, email, password);
    if (error) {
      return rejectWithValue(error);
    }
    return {
      id: firebaseUser.uid,
      username,
      email,
      emailVerified: false
    };
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    const { error } = await authLogout();
    if (error) {
      return rejectWithValue(error);
    }
    return null;
  }
);

export const refreshVerificationThunk = createAsyncThunk(
  "auth/refreshVerification",
  async (_, { rejectWithValue }) => {
    try {
      const refreshedUser = await refreshUser();
      if (refreshedUser) {
        return refreshedUser.emailVerified;
      }
      return false;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const resendVerificationThunk = createAsyncThunk(
  "auth/resendVerification",
  async (_, { rejectWithValue }) => {
    try {
      await resendVerificationEmail();
      return "Verification email sent — check your inbox!";
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async ({ name, address, localAddress }, { rejectWithValue }) => {
    try {
      await authUpdateProfile(name.trim());
      localStorage.setItem("grocart_address", address);
      if (localAddress !== undefined) {
        localStorage.setItem("grocart_local_address", localAddress);
      }
      return { username: name.trim(), address, localAddress };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserState(state, action) {
      const payload = action.payload;
      if (payload) {
        state.user = {
          id: payload.id,
          username: payload.username,
          email: payload.email
        };
        state.isGuestSession = false;
        state.isEmailVerified = payload.emailVerified;
      } else {
        state.user = null;
        state.isEmailVerified = false;
      }
      state.isLoading = false;
    },
    setAuthLoading(state, action) {
      state.isLoading = action.payload;
    },
    startGuestSession(state) {
      state.isGuestSession = true;
      state.user = {
        id: "guest_user",
        username: "Guest User",
        email: "guest@grocart.com"
      };
    },
    endGuestSession(state) {
      state.isGuestSession = false;
      state.user = null;
    },
    clearAuthError(state) {
      state.authError = null;
    },
    setAuthError(state, action) {
      state.authError = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email
        };
        state.isGuestSession = false;
        state.isEmailVerified = action.payload.emailVerified;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload || "Login failed";
      })

      // Register
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.authError = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email
        };
        state.isEmailVerified = false;
        state.authError = "Verification email sent! Please check your inbox.";
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.authError = action.payload || "Registration failed";
      })

      // Logout
      .addCase(logoutThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isGuestSession = false;
        state.isEmailVerified = false;
      })
      .addCase(logoutThunk.rejected, (state) => {
        state.isLoading = false;
      })

      // Refresh verification
      .addCase(refreshVerificationThunk.fulfilled, (state, action) => {
        state.isEmailVerified = action.payload;
      })

      // Resend verification
      .addCase(resendVerificationThunk.fulfilled, (state, action) => {
        state.authError = action.payload;
      })
      .addCase(resendVerificationThunk.rejected, (state, action) => {
        state.authError = action.payload || "Failed to resend verification";
      })

      // Update Profile
      .addCase(updateProfileThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.username = action.payload.username;
        }
        state.savedAddress = action.payload.address;
        if (action.payload.localAddress !== undefined) {
          state.localAddress = action.payload.localAddress;
        }
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
      });
  }
});

export const { 
  setUserState, 
  setAuthLoading,
  startGuestSession, 
  endGuestSession, 
  clearAuthError,
  setAuthError 
} = authSlice.actions;

export default authSlice.reducer;
