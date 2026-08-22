import React from 'react';
import { ShoppingCart, Truck, Box } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface RetailerAnalyticsTabProps {
  stats: any;
  timeFilter: 'all' | 'today' | 'week' | 'month';
  setTimeFilter: (val: 'all' | 'today' | 'week' | 'month') => void;
}

// Mock KPI data
const kpiData = [
  { name: 'SLA Pack Rate', value: 90, color: '#f59e0b', label: '18/20', sub: 'Orders Packed in Time' }, // Yellow
  { name: 'Fulfillment Health', value: 95, color: '#10b981', label: '95%', sub: 'Ready for Dispatch' }, // Green
  { name: 'Pending Invoices', value: 15, color: '#f97316', label: '02/16', sub: 'Action Required' }, // Orange
];

export function RetailerAnalyticsTab({ stats, timeFilter, setTimeFilter }: RetailerAnalyticsTabProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-6 print:hidden animate-fade-in">
      {/* Order Updates / Metrics */}
      <section className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-150/60 p-5">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Order Updates</h2>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-emerald-500 cursor-pointer">
            <option value="today">Daily</option>
            <option value="week">Weekly</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <ShoppingCart size={20} className="text-blue-600"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Revenue Generated</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Truck size={20} className="text-emerald-600"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{stats?.totalOrdersFulfilled || 0}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Completed Shipments</div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <Box size={20} className="text-orange-600"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{stats?.activeListings || 0}</div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Active Listings</div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Gauges */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-150/60 p-5 w-full xl:w-1/3">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-5">Seller Scorecard</h2>
        <div className="grid grid-cols-3 gap-2">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center group">
              <div className="h-16 w-16 sm:h-20 sm:w-20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[kpi]} startAngle={90} endAngle={-270} barSize={6}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={10} fill={kpi.color} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">{kpi.label}</span>
                </div>
              </div>
              <div className="text-center mt-2">
                <div className="text-[9px] font-bold text-slate-800 dark:text-slate-100 leading-tight uppercase">{kpi.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
