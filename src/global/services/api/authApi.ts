// src/global/services/api/authApi.ts
// Client API for GroCart authentication and profile operations.
// Backed by Express + PostgreSQL backend using JWT access + refresh tokens.

import { apiClient, setAccessToken, refreshSession } from '@global/utils/axiosInstance';
import { UserProfile, UserRole } from '@global/models';

export const authApi = {
  /**
   * Log in user with email and password.
   * Stores access token in memory and returns the user profile.
   */
  loginUser: async (email: string, password: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { user, accessToken } = response.data?.data || {};
      if (accessToken) {
        setAccessToken(accessToken);
      }
      return user as UserProfile;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  },

  /**
   * Register a new customer or retailer account.
   * Stores access token in memory and returns the created user profile.
   */
  registerUser: async (
    email: string,
    password: string,
    name: string,
    role: UserRole,
    storeName?: string,
    confirmPassword?: string
  ): Promise<UserProfile> => {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        confirmPassword: confirmPassword || password,
        name,
        role,
        storeName: storeName || ''
      });
      const { user, accessToken } = response.data?.data || {};
      if (accessToken) {
        setAccessToken(accessToken);
      }
      return user as UserProfile;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  /**
   * Log out user: clears the backend refresh token cookie and resets in-memory token.
   */
  logoutUser: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout error (continuing local cleanup):', err);
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Restore user session from httpOnly refresh token cookie on app startup.
   */
  restoreSession: async (): Promise<UserProfile | null> => {
    try {
      const data = await refreshSession();
      return (data?.user as UserProfile) || null;
    } catch (error: any) {
      setAccessToken(null);
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Update the logged-in user's profile.
   */
  updateProfile: async (_uid: string, updates: Partial<UserProfile>): Promise<void> => {
    try {
      await apiClient.put('/users/me', updates);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile';
      throw new Error(msg);
    }
  },

  /**
   * Fetch the current user's profile.
   */
  fetchUserProfile: async (_uid?: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.get('/auth/me');
      const user = response.data?.data?.user;
      if (!user) {
        throw new Error('User profile does not exist in database.');
      }
      return user as UserProfile;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch user profile';
      throw new Error(msg);
    }
  },

  /**
   * Create another administrator account (Admin only).
   */
  createAdmin: async (email: string, password: string, name: string): Promise<UserProfile> => {
    try {
      const response = await apiClient.post('/admin/admins', { email, password, name });
      return response.data?.data?.user as UserProfile;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create admin';
      throw new Error(msg);
    }
  }
};
