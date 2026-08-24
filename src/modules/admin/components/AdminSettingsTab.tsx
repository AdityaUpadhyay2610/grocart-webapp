import React from 'react';
import { Settings, Save, Store, Bell, Shield, Wallet } from 'lucide-react';

export function AdminSettingsTab() {
  return (
    <div className="animate-fade-in relative z-10 space-y-6">
      <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight px-2">Admin Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings Navigation (Left Column) */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-xl text-left font-bold text-slate-800 dark:text-white shadow-sm transition-colors">
            <Store className="text-emerald-500" size={20} />
            Platform Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border border-transparent rounded-xl text-left font-bold text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
            <Wallet className="text-slate-400" size={20} />
            Payment Gateway
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border border-transparent rounded-xl text-left font-bold text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
            <Bell className="text-slate-400" size={20} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-transparent border border-transparent rounded-xl text-left font-bold text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
            <Shield className="text-slate-400" size={20} />
            Security
          </button>
        </div>

        {/* Settings Content (Right Column) */}
        <div className="lg:col-span-2">
          <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <Settings size={20} className="text-emerald-500"/> Platform Configuration
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="GroMart"
                  className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@gromart.com"
                  className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Default Currency</label>
                <select className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Platform Commission Rate (%)</label>
                <input 
                  type="number" 
                  defaultValue="15"
                  className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button className="flex items-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
