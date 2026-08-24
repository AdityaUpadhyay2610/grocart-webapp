import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { authApi } from '@global/services/api/authApi';
import { setUserProfile } from '@global/store';
import { UserRole } from '@global/models';
import { useTheme } from '@global/context/ThemeContext';

import { Eye, EyeOff, Store } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isDark } = useTheme();

  const handleReset = () => {
    setEmail('');
    setPassword('');
    setName('');
    setStoreName('');
    setRole('customer');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let profile;
      if (isRegister) {
        profile = await authApi.registerUser(email, password, name, role, storeName);
      } else {
        profile = await authApi.loginUser(email, password);
      }

      dispatch(setUserProfile(profile));

      if (profile.role === 'admin') navigate('/admin/dashboard', { replace: true });
      else if (profile.role === 'retailer') navigate('/retailer/dashboard', { replace: true });
      else navigate('/', { replace: true });
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden text-slate-900 dark:text-slate-100 transition-colors selection:bg-emerald-500/30"
      style={{
        backgroundImage: isDark 
          ? `linear-gradient(to bottom right, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`
          : `linear-gradient(to bottom right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.85)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-lg rounded-[2rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-10 shadow-2xl border border-white/50 dark:border-slate-700/50 relative z-10 transition-all duration-300">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white mb-4 shadow-lg shadow-emerald-500/20">
            <Store size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">GroCart</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">{isRegister ? 'Create your new account' : 'Welcome back, sign in to your portal'}</p>
        </div>

        {errorMsg && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-200 shadow-sm animate-pulse">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div className="animate-fade-in-up">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Full Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Account Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRole('customer')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'customer' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm'}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-[11px] font-bold uppercase tracking-wide">Customer</span>
                    </button>
                    <button type="button" onClick={() => setRole('retailer')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'retailer' ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'border-white/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-sm'}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <span className="text-[11px] font-bold uppercase tracking-wide">Retailer</span>
                    </button>
                  </div>
                </div>

                {role === 'retailer' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Store / Business Name</label>
                    <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full rounded-xl border border-white/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm" placeholder="Green Valley Organics" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm" placeholder="name@domain.com" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full rounded-xl border border-white/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3 pr-10 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl active:scale-95 disabled:opacity-50 transition-all border border-emerald-400/30">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); handleReset(); }} className="font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
              {isRegister ? 'Sign In' : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
