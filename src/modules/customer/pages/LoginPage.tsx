import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { authApi } from '@global/services/api/authApi';
import { setUserProfile } from '@global/store';
import { UserRole } from '@global/models';

import { Eye, EyeOff } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-4 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg rounded-3xl bg-white/80 backdrop-blur-xl p-10 shadow-2xl border border-white/50 relative z-10 transition-all duration-300">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Grocart Platform</h1>
          <p className="text-sm font-medium text-gray-500 mt-2">{isRegister ? 'Create your new account' : 'Welcome back, sign in to your portal'}</p>
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
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/50 p-3.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400" placeholder="John Doe" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Account Type</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => setRole('customer')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'customer' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-gray-100 bg-white/50 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <span className="text-xs font-bold">Customer</span>
                    </button>
                    <button type="button" onClick={() => setRole('retailer')} className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'retailer' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md' : 'border-gray-100 bg-white/50 text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}>
                      <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      <span className="text-xs font-bold">Retailer</span>
                    </button>
                  </div>
                </div>

                {role === 'retailer' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Store / Business Name</label>
                    <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/50 p-3.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all placeholder-gray-400" placeholder="Green Valley Organics" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white/50 p-3.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400" placeholder="name@domain.com" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full rounded-xl border border-gray-200 bg-white/50 p-3.5 pr-10 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder-gray-400" 
                  placeholder="••••••••" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center items-center rounded-xl bg-emerald-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:shadow-xl focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : isRegister ? 'Register Account' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); handleReset(); }} className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              {isRegister ? 'Sign In' : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
