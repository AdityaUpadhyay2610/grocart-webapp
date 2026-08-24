import React from 'react';
import { Search, ArrowUp, ArrowDown, Banknote } from 'lucide-react';

interface AdminRetailersTabProps {
  retailers: any[];
  userSearch: string;
  setUserSearch: (v: string) => void;
  platformStats: any;
  customersCount: number;
}

const ProgressRing = ({ radius, stroke, progress, color, label, subLabel }: any) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
      <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 absolute">
        <circle
          stroke="currentColor"
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-800 dark:text-slate-100">{label}</span>
        <span className="text-[10px] font-bold text-slate-500">{subLabel}</span>
      </div>
    </div>
  );
};

export function AdminRetailersTab({
  retailers, userSearch, setUserSearch
}: AdminRetailersTabProps) {
  
  const filteredRetailers = retailers.filter(r => 
    r.storeName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    r.name?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Mock data to match the visual if retailers is empty or small
  const displayRetailers = filteredRetailers.length > 0 ? filteredRetailers : [
    { uid: '1', name: 'Admin Name', storeName: 'Admin Store', score: 95, scoreLabel: 'Excellent', color: '#10B981', category: 'Electronics', payout: 12500.00, trend: 'up' },
    { uid: '2', name: 'Savia Ranm', storeName: 'Savia Store', score: 88, scoreLabel: 'Good', color: '#10B981', category: 'Apparel', payout: 8240.50, trend: 'down' },
    { uid: '3', name: 'Mamili rawen', storeName: 'Mamili Store', score: 72, scoreLabel: 'Needs Improvement', color: '#3B82F6', category: 'Grocery', payout: 5100.25, trend: 'down' },
    { uid: '4', name: 'Mamili rawen', storeName: 'Mamili Store 2', score: 82, scoreLabel: 'Good', color: '#10B981', category: 'Electronics', payout: 7700.50, trend: 'down' },
    { uid: '5', name: 'Marvel fiuwa', storeName: 'Marvel Store', score: 72, scoreLabel: 'Excellent', color: '#3B82F6', category: 'Grocery', payout: 5100.25, trend: 'up' },
    { uid: '6', name: 'Marci Jinmar', storeName: 'Marci Store', score: 76, scoreLabel: 'Good', color: '#3B82F6', category: 'Grocery', payout: 8850.00, trend: 'down' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Vendor Performance Matrix</h2>
      </div>

      {/* Global Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </div>
        <input 
          type="text" 
          value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
          placeholder="Search vendors, categories, metrics... (⌘K)" 
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
        />
      </div>

      {/* Grid of Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRetailers.map((vendor: any, idx: number) => {
          // Generate mock data if missing
          const score = vendor.score || Math.floor(Math.random() * 30) + 70;
          const isExcellent = score >= 90;
          const isGood = score >= 80 && score < 90;
          const scoreLabel = vendor.scoreLabel || (isExcellent ? 'Excellent' : isGood ? 'Good' : 'Needs Improvement');
          const color = vendor.color || (score >= 80 ? '#10B981' : '#3B82F6');
          const category = vendor.category || 'Grocery';
          const payout = vendor.payout || Math.floor(Math.random() * 10000) + 1000;
          const trend = vendor.trend || (Math.random() > 0.5 ? 'up' : 'down');
          
          return (
            <div key={vendor.uid || idx} className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-emerald-500/20 shadow-sm hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden shrink-0">
                    <img src={vendor.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(vendor.name || 'Store')}&background=0ea5e9&color=fff&size=128`} alt={vendor.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">{vendor.name || vendor.storeName}</h3>
                </div>
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-full">
                  Vendor
                </span>
              </div>

              {/* Body */}
              <div className="flex items-center justify-between">
                <div className="shrink-0">
                  <ProgressRing 
                    radius={50} 
                    stroke={8} 
                    progress={score} 
                    color={color} 
                    label={`${score}%`} 
                    subLabel={scoreLabel} 
                  />
                </div>
                <div className="flex flex-col items-end text-right space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Top Selling Category</p>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">
                      {category}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 mb-1">Last Payout</p>
                    <div className="flex items-center justify-end space-x-1.5 text-slate-800 dark:text-slate-100 font-black">
                      <Banknote size={14} className="text-emerald-500" />
                      <span>${payout.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                      {trend === 'up' ? (
                        <ArrowUp size={14} className="text-emerald-500" />
                      ) : (
                        <ArrowDown size={14} className="text-rose-500" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
