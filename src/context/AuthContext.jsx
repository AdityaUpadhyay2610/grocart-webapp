import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { onAuthStateChange, login as authLogin, register as authRegister, logout as authLogout, resendVerificationEmail, updateProfile as authUpdateProfile, refreshUser } from "../services/firebaseAuth";
import { User } from "../models/User";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuestSession, setIsGuestSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [savedAddress, setSavedAddress] = useState(localStorage.getItem("grocart_address") || "");

  // Listen to Auth State changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        const domainUser = new User({
          id: firebaseUser.uid,
          username: firebaseUser.displayName || "User",
          email: firebaseUser.email || ""
        });
        setUser(domainUser);
        setIsGuestSession(false);
        setIsEmailVerified(firebaseUser.emailVerified);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    const { user: firebaseUser, error } = await authLogin(email, password);
    if (error) {
      setAuthError(error);
    } else if (firebaseUser) {
      setUser(new User({
        id: firebaseUser.uid,
        username: firebaseUser.displayName || "User",
        email: firebaseUser.email || ""
      }));
      setIsEmailVerified(firebaseUser.emailVerified);
    }
    setIsLoading(false);
  }, []);

  const register = useCallback(async (username, email, password) => {
    setIsLoading(true);
    setAuthError(null);
    const { user: firebaseUser, error } = await authRegister(username, email, password);
    if (error) {
      setAuthError(error);
    } else if (firebaseUser) {
      setUser(new User({
        id: firebaseUser.uid,
        username,
        email
      }));
      setIsEmailVerified(false); // Newly created accounts start unverified
      setAuthError("Verification email sent! Please check your inbox.");
    }
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    const { error } = await authLogout();
    if (!error) {
      setUser(null);
      setIsGuestSession(false);
      setIsEmailVerified(false);
    }
    setIsLoading(false);
  }, []);

  const refreshVerification = useCallback(async () => {
    try {
      const refreshedUser = await refreshUser();
      if (refreshedUser) {
        setIsEmailVerified(refreshedUser.emailVerified);
        return refreshedUser.emailVerified;
      }
    } catch (e) {
      console.error("Failed to refresh verification status:", e);
    }
    return false;
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await resendVerificationEmail();
      setAuthError("Verification email resent — check your inbox!");
    } catch (error) {
      setAuthError(error.message);
    }
  }, []);

  const startGuestSession = useCallback(() => {
    setIsGuestSession(true);
  }, []);

  const endGuestSession = useCallback(() => {
    setIsGuestSession(false);
  }, []);

  const updateProfile = useCallback(async (newName, newAddress) => {
    setIsLoading(true);
    try {
      const updatedUser = await authUpdateProfile(newName.trim());
      setUser(prev => new User({
        id: prev.id,
        username: newName.trim(),
        email: prev.email
      }));
      
      // Save address locally (replicating SessionManager)
      localStorage.setItem("grocart_address", newAddress);
      setSavedAddress(newAddress);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isGuestSession,
      isLoading,
      authError,
      isEmailVerified,
      savedAddress,
      login,
      register,
      logout,
      refreshVerification,
      resendVerification,
      startGuestSession,
      endGuestSession,
      updateProfile,
      clearAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
