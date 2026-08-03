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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 select-none bg-slate-50 dark:bg-[#090D16] text-slate-800 dark:text-slate-200 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 dark:bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative z-10 animate-scale-in">
        {/* Top Header visual bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-3xl" />

        {/* Top Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary-50 dark:bg-primary-950/20 rounded-2xl flex items-center justify-center shadow-inner border border-primary-100/10">
            <img 
              src="/otp.webp" 
              alt="Login" 
              className="w-16 h-16 object-contain animate-float"
              onError={(e) => { e.target.src = "https://placehold.co/100x100/e8fbf3/10b981?text=GroCart"; }}
            />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white text-center tracking-tight leading-none">
          {isSignupMode ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 text-center mt-2 mb-8 font-semibold">
          {isSignupMode 
            ? "Sign up to start shopping for fresh groceries" 
            : "Log in to access your custom fresh cart"}
        </p>

        {/* Global Auth Error Alert */}
        {authError && (
          <div className={`p-4 rounded-2xl border mb-6 flex items-start space-x-3 text-sm transition-all duration-300 ${
            authError.includes("Verification") 
              ? "bg-accent-50 border-accent-200 text-accent-700 dark:bg-accent-950/20 dark:border-accent-900/30 dark:text-accent-400" 
              : "bg-red-50 border-red-200/50 text-red-800 dark:bg-red-950/15 dark:border-red-900/30 dark:text-red-400"
          }`}>
            {authError.includes("Verification") ? (
              <CheckCircle className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-650 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-semibold leading-snug">{authError}</span>
          </div>
        )}

        {/* Email Verification Banner */}
        {user && !isEmailVerified && (
          <div className="bg-accent-50 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-900/30 rounded-2xl p-4 mb-6 text-sm text-accent-850 dark:text-accent-400 shadow-sm animate-pulse-subtle">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <p className="font-black">Verify your email</p>
                <p className="text-xs opacity-90 mt-0.5">Check your inbox for a verification link.</p>
              </div>
              <div className="flex flex-col space-y-1">
                <button
                  onClick={refreshVerification}
                  className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center cursor-pointer"
                >
                  <span>Done</span>
                </button>
                <button
                  onClick={resendVerification}
                  className="text-[11px] text-slate-400 hover:text-slate-650 hover:underline cursor-pointer transition-colors"
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
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Display Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200/60 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-slate-50/50 dark:bg-[#0c101a]/50 text-slate-800 dark:text-white transition-all placeholder-slate-400"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="you@example.com"
                className={`block w-full pl-10 pr-3 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-slate-50/50 dark:bg-[#0c101a]/50 text-slate-800 dark:text-white transition-all placeholder-slate-400 ${
                  emailTouched && !isEmailFormatValid ? "border-red-400 focus:ring-red-500" : "border-slate-200/60 dark:border-slate-800"
                }`}
                required
              />
            </div>
            {emailTouched && !isEmailFormatValid && (
              <p className="text-[11px] text-red-500 mt-1 font-medium pl-1">Enter a valid email address (e.g. user@gmail.com)</p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-slate-200/60 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-slate-50/50 dark:bg-[#0c101a]/50 text-slate-800 dark:text-white transition-all placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || (emailTouched && !isEmailFormatValid)}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-md text-base font-extrabold text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer hover:shadow-lg active:scale-98"
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

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={toggleMode}
            className="text-sm font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors hover:underline cursor-pointer"
          >
            {isSignupMode ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </button>
          
          <div className="w-full flex items-center justify-center space-x-2.5 py-1">
            <hr className="w-1/4 border-slate-100 dark:border-slate-800" />
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Or</span>
            <hr className="w-1/4 border-slate-100 dark:border-slate-800" />
          </div>

          <button
            onClick={startGuestSession}
            className="text-xs font-extrabold text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 hover:underline transition-colors cursor-pointer"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
});

LoginScreen.displayName = "LoginScreen";

