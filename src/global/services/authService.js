// src/global/services/authService.js
// Compatibility shim: all functions now proxy to the Express + PostgreSQL backend
// via authApi.
// Function signatures are preserved for backward compatibility.

import { authApi } from './api/authApi';
import { setAccessToken } from '@global/utils/axiosInstance';

/**
 * Log in with email and password.
 * Returns { user, error } to match the expected signature.
 */
export const login = async (email, password) => {
  try {
    const user = await authApi.loginUser(email, password);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Register a new customer account.
 * Returns { user, error } to match the expected signature.
 */
export const register = async (username, email, password, confirmPassword) => {
  try {
    const user = await authApi.registerUser(email, password, username, 'customer', undefined, confirmPassword);
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Log out the current user – clears backend session and in-memory token.
 */
export const logout = async () => {
  try {
    await authApi.logoutUser();
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

/**
 * Resend verification email – no-op in the new backend flow.
 * Email verification is handled at the backend level if needed.
 */
export const resendVerificationEmail = async () => {
  console.info('[authService] resendVerificationEmail: no-op in REST auth mode.');
};

/**
 * Update the display name for the logged-in user.
 * Returns the updated user profile or throws.
 */
export const updateProfile = async (displayName) => {
  try {
    await authApi.updateProfile(undefined, { username: displayName });
    const user = await authApi.fetchUserProfile();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * Refresh/reload the current user – re-fetches profile from the backend.
 * Returns the user profile or null.
 */
export const refreshUser = async () => {
  try {
    const user = await authApi.fetchUserProfile();
    return user || null;
  } catch {
    return null;
  }
};

/**
 * Subscribe to auth state changes.
 * In the REST world, this does a one-time session restore on mount.
 * Returns an unsubscribe function (no-op for cleanup) to preserve the
 * expected auth listener call pattern.
 *
 * @param {(user: object|null) => void} callback
 * @returns {() => void} unsubscribe
 */
export const onAuthStateChange = (callback) => {
  let cancelled = false;

  authApi.restoreSession()
    .then((user) => {
      if (!cancelled) callback(user || null);
    })
    .catch(() => {
      if (!cancelled) callback(null);
    });

  // Return unsubscribe so existing `return unsubscribe` patterns work
  return () => { cancelled = true; };
};
