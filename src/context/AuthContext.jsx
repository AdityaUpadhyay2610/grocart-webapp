import React, { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  loginThunk, 
  registerThunk, 
  logoutThunk, 
  refreshVerificationThunk, 
  resendVerificationThunk, 
  updateProfileThunk,
  startGuestSession as startGuestSessionAction,
  endGuestSession as endGuestSessionAction,
  clearAuthError as clearAuthErrorAction
} from "../store/authSlice";

// Legacy provider for backward compatibility (no-op context)
export const AuthProvider = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const login = useCallback((email, password) => dispatch(loginThunk({ email, password })), [dispatch]);
  const register = useCallback((username, email, password) => dispatch(registerThunk({ username, email, password })), [dispatch]);
  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const refreshVerification = useCallback(async () => {
    try {
      const verified = await dispatch(refreshVerificationThunk()).unwrap();
      return verified;
    } catch (e) {
      return false;
    }
  }, [dispatch]);
  const resendVerification = useCallback(() => dispatch(resendVerificationThunk()), [dispatch]);
  const startGuestSession = useCallback(() => dispatch(startGuestSessionAction()), [dispatch]);
  const endGuestSession = useCallback(() => dispatch(endGuestSessionAction()), [dispatch]);
  const updateProfile = useCallback(async (name, address) => {
    try {
      await dispatch(updateProfileThunk({ name, address })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [dispatch]);
  const clearAuthError = useCallback(() => dispatch(clearAuthErrorAction()), [dispatch]);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshVerification,
    resendVerification,
    startGuestSession,
    endGuestSession,
    updateProfile,
    clearAuthError
  };
};
