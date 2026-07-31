import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export const LoginScreen = React.memo(() => {
  const {
    user,
    isGuestSession,
    isLoading,
    authError,
    isEmailVerified,
    login,
    register,
    refreshVerification,
    resendVerification,
    startGuestSession,
    clearAuthError
  } = useAuth();

  const [isSignupMode, setIsSignupMode] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Email format validation (Regex matcher)
  const isEmailFormatValid = useMemo(() => {
    if (!email) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // Clean error on mode toggle
  const toggleMode = useCallback(() => {
    setIsSignupMode(prev => !prev);
    setUsername("");
    setPassword("");
    setEmail("");
    setEmailTouched(false);
    clearAuthError();
  }, [clearAuthError]);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
    setEmailTouched(true);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);

  const handleTogglePassword = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "" || (isSignupMode && username.trim() === "")) {
      alert("All fields are required!");
      return;
    }
    if (!isEmailFormatValid) {
      alert("Please enter a valid email address.");
      return;
    }

    if (isSignupMode) {
      register(username, email, password);
    } else {
      login(email, password);
    }
  }, [isSignupMode, username, email, password, isEmailFormatValid, register, login]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 py-12 select-none bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-800/95 rounded-3xl border border-gray-150 dark:border-slate-700 p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
        {/* Top Illustration */}
        <div className="flex justify-center mb-6">
          <img 
            src="/otp.webp" 
            alt="Login Illustration" 
            className="w-36 h-36 object-contain animate-float"
            onError={(e) => { e.target.src = "https://placehold.co/150x150/e8e9fe/7c3aed?text=GroCart"; }}
          />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 text-center tracking-tight">
          {isSignupMode ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-2 mb-6">
          {isSignupMode 
            ? "Sign up to start shopping for fresh groceries" 
            : "Log in with your email to continue"}
        </p>

        {/* Global Auth Error Alert */}
        {authError && (
          <div className={`p-4 rounded-xl border mb-6 flex items-start space-x-3 text-sm ${
            authError.includes("Verification") 
              ? "bg-amber-50 border-amber-200 text-amber-800" 
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {authError.includes("Verification") ? (
              <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{authError}</span>
          </div>
        )}

        {/* Email Verification Banner */}
        {user && !isEmailVerified && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 shadow-sm animate-pulse-subtle">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold">Verify your email</p>
                <p className="text-xs text-amber-700 mt-0.5">Check your inbox for a verification link.</p>
              </div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={refreshVerification}
                  className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Done</span>
                </button>
                <button
                  onClick={resendVerification}
                  className="text-[11px] text-gray-500 hover:underline"
                >
                  Resend
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignupMode && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50 ${
                  emailTouched && !isEmailFormatValid ? "border-red-400 focus:ring-red-500" : "border-gray-200"
                }`}
                required
              />
            </div>
            {emailTouched && !isEmailFormatValid && (
              <p className="text-[11px] text-red-500 mt-1 font-medium">Enter a valid email address (e.g. user@gmail.com)</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 h-5 text-gray-400" />
              </div>
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gray-50/50"
                required
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || (emailTouched && !isEmailFormatValid)}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSignupMode ? (
                "Sign Up"
              ) : (
                "Log In"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-3">
          <button
            onClick={toggleMode}
            className="text-sm font-semibold text-violet-600 hover:underline"
          >
            {isSignupMode ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
          
          <button
            onClick={startGuestSession}
            className="text-xs font-semibold text-gray-400 hover:text-gray-600 hover:underline transition-colors"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
});

LoginScreen.displayName = "LoginScreen";

