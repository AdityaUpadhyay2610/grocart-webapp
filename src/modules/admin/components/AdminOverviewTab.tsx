import React from 'react';
import { TrendingUp, DollarSign, Store, Users, PackageCheck } from 'lucide-react';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';

// Data for Fulfillment Concentric Rings
const fulfillmentData = [
  { name: 'Ready to Ship', value: 85, fill: '#84cc16' }, // Lime Green
  { name: 'In-Transit', value: 45, fill: '#06b6d4' }, // Cyan
  { name: 'Out for Delivery', value: 12, fill: '#3b82f6' } // Blue
];

// Data for SLA Gauges
const slaDataActiveStore = [{ name: 'Active Store SLA', value: (22/25)*100, fill: '#eab308' }];
const slaDataCatalog = [{ name: 'Catalog Approval Rate', value: (11/22)*100, fill: '#22c55e' }];
const slaDataReturns = [{ name: 'Return Inquiries', value: (4/22)*100, fill: '#f97316' }];

interface AdminOverviewTabProps {
  platformStats: any;
  retailers: any[];
  customers: any[];
}

export function AdminOverviewTab({ platformStats, retailers, customers }: AdminOverviewTabProps) {
  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in">
      {/* PLATFORM KPI OVERVIEW */}
      <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 p-5 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">Platform Analytics</h2>
          <select className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors">
            <option>Daily</option>
            <option>Monthly</option>
            <option>Yearly</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total GMV */}
          <div className="flex items-center gap-4 hover:bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl transition-colors">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total GMV</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">₹{(platformStats?.totalGMV || 3351.24).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="text-[10px] font-bold text-slate-400">Projected Value</div>
            </div>
          </div>
          {/* Profit Margin */}
          <div className="flex items-center gap-4 hover:bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl transition-colors">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Platform Margin</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">₹{(platformStats?.totalPlatformProfit || 121659.08).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <div className="text-[10px] font-bold text-slate-400">Net Yield</div>
            </div>
          </div>
          {/* Active Retailers */}
          <div className="flex items-center gap-4 hover:bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl transition-colors">
            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Active Retailers</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{retailers.length || 2}</div>
              <div className="text-[10px] font-bold text-slate-400">Registered Sellers</div>
            </div>
          </div>
          {/* Total Shoppers */}
          <div className="flex items-center gap-4 hover:bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl transition-colors">
            <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Shoppers</div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{customers.length || 1}</div>
              <div className="text-[10px] font-bold text-slate-400">Active Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM HEALTH GAUGES */}
      <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 p-5 md:p-6">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Performance Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="flex flex-col items-center pt-4 sm:pt-0 hover:scale-105 transition-transform">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={slaDataActiveStore} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-xl font-black text-slate-900 dark:text-white">22/25</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Store SLA</div>
            </div>
          </div>
          <div className="flex flex-col items-center pt-4 sm:pt-0 hover:scale-105 transition-transform">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={slaDataCatalog} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-xl font-black text-slate-900 dark:text-white">11/22</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Approval Rate</div>
            </div>
          </div>
          <div className="flex flex-col items-center pt-4 sm:pt-0 hover:scale-105 transition-transform">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={slaDataReturns} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <div className="text-xl font-black text-slate-900 dark:text-white">04/22</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Return / Refund Inquiries</div>
            </div>
          </div>
        </div>
      </section>

      {/* SALES & LOGISTICS MULTI-CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Sales Distribution */}
        <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 p-5 md:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Sales Distribution & Categories</h2>
          <div className="space-y-8">
            {/* Split Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <span>Online (77%)</span>
                <span>Offline (23%)</span>
              </div>
              <div className="h-4 w-full flex rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full hover:opacity-80 transition-opacity" style={{ width: '77%' }}></div>
                <div className="bg-slate-300 h-full hover:opacity-80 transition-opacity" style={{ width: '23%' }}></div>
              </div>
            </div>
            {/* Stacked Progress Bar */}
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-4">Category Breakdown</div>
              <div className="h-6 w-full flex rounded-lg overflow-hidden shadow-inner cursor-pointer">
                <div className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white px-2 truncate hover:opacity-90 transition-opacity" style={{ width: '25%' }}>Apparels</div>
                <div className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white px-2 truncate hover:opacity-90 transition-opacity" style={{ width: '24%' }}>Electronics</div>
                <div className="bg-orange-500 h-full flex items-center justify-center text-[10px] font-bold text-white px-2 truncate hover:opacity-90 transition-opacity" style={{ width: '30%' }}>Groceries</div>
                <div className="bg-slate-400 h-full flex items-center justify-center text-[10px] font-bold text-white px-2 truncate hover:opacity-90 transition-opacity" style={{ width: '21%' }}>Others</div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Apparels (25%)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Electronics (24%)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Groceries (30%)</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Others (21%)</div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Right Card: Fulfillment */}
        <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 p-5 md:p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Fulfillment & Inventory Status</h2>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={15} data={fulfillmentData}>
                <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} />
                <Tooltip cursor={{fill: 'transparent'}} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none hover:scale-110 transition-transform">
              <PackageCheck size={24} className="text-slate-400 mx-auto" />
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-2 text-[10px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div> Out for Delivery</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#06b6d4]"></div> In-Transit</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#84cc16]"></div> Ready</div>
          </div>
        </section>
      </div>
    </div>
  );
}
