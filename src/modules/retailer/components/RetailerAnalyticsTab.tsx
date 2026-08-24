import React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface RetailerAnalyticsTabProps {
  stats: any;
  timeFilter: 'all' | 'today' | 'week' | 'month';
  setTimeFilter: (val: 'all' | 'today' | 'week' | 'month') => void;
  products?: any[];
  orders?: any[];
}

// Mock Chart Data for Stacked Area Chart (Pending real time-series aggregation)
const businessChartData = [
  { name: 'Jan', investment: 50000, stocks: 30000, earnings: 10000, demand: 5000 },
  { name: 'Feb', investment: 60000, stocks: 40000, earnings: 15000, demand: 8000 },
  { name: 'Mar', investment: 80000, stocks: 50000, earnings: 25000, demand: 12000 },
  { name: 'Apr', investment: 120000, stocks: 80000, earnings: 50000, demand: 25000 },
  { name: 'May', investment: 180000, stocks: 120000, earnings: 120000, demand: 50000 },
  { name: 'Jun', investment: 250000, stocks: 180000, earnings: 320000, demand: 90000 },
];

export function RetailerAnalyticsTab({ stats, timeFilter, setTimeFilter, products = [], orders = [] }: RetailerAnalyticsTabProps) {
  
  // Real Calculations
  const totalInvestment = products.reduce((acc, p) => acc + (Number(p.costPrice || 0) * Number(p.stockQuantity || 0)), 0);
  const totalStocksValuation = products.reduce((acc, p) => acc + (Number(p.sellingPrice || 0) * Number(p.stockQuantity || 0)), 0);
  
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalEarnings = deliveredOrders.reduce((acc, o) => acc + (Number(o.totalAmount || 0)), 0);
  
  // Approximate Profitability margin
  const profitability = totalStocksValuation > 0 
    ? (((totalStocksValuation - totalInvestment) / totalStocksValuation) * 100).toFixed(1) + '%'
    : '0%';

  const recentOrdersCount = orders.filter(o => (Date.now() - (o.createdAt || 0)) < 7 * 24 * 60 * 60 * 1000).length;
  const sellingDemands = recentOrdersCount > 10 ? 'High' : (recentOrdersCount > 3 ? 'Medium' : 'Low');

  const businessInsights = [
    { id: 1, metric: 'Total Investment', value: `₹${totalInvestment.toLocaleString('en-IN')}`, description: 'Capital invested in current inventory', trend: '+5.2%', isPositive: true },
    { id: 2, metric: 'Total Stocks', value: `₹${totalStocksValuation.toLocaleString('en-IN')}`, description: 'Current valuation of warehouse stocks', trend: '+2.1%', isPositive: true },
    { id: 3, metric: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, description: 'Total revenue realized to date', trend: '+12.5%', isPositive: true },
    { id: 4, metric: 'Profitability', value: profitability, description: 'Projected gross margin on inventory', trend: '+3.4%', isPositive: true },
    { id: 5, metric: 'Selling Demands', value: sellingDemands, description: 'Based on 7-day order velocity', trend: recentOrdersCount > 0 ? '+15.0%' : '0%', isPositive: recentOrdersCount > 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      
      {/* Title */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Sales Reports</h2>
      </div>

      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
            <span className="text-xl font-black text-indigo-500">$</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">Business & Investment Insights</h3>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overview of your financial performance and inventory value over time</p>
          </div>
        </div>

        {/* Stacked Area Chart */}
        <div className="h-[400px] w-full mb-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={businessChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} tickFormatter={(val) => `₹${val/1000}k`} dx={-10} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: '#475569', top: -10 }}/>
              <Area type="monotone" dataKey="demand" stackId="1" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#colorDemand)" name="Selling Demands" />
              <Area type="monotone" dataKey="earnings" stackId="1" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" name="Total Earnings" />
              <Area type="monotone" dataKey="investment" stackId="1" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorInvestment)" name="Total Investment" />
              <Area type="monotone" dataKey="stocks" stackId="1" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorStocks)" name="Total Stocks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 dark:border-slate-700/50">
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Metric</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Value</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Description</th>
                <th className="py-4 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50 dark:divide-slate-700/30">
              {businessInsights.map((insight) => (
                <tr key={insight.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-5 px-4">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{insight.metric}</span>
                  </td>
                  <td className="py-5 px-4">
                    <span className="font-black text-slate-900 dark:text-white text-base">{insight.value}</span>
                  </td>
                  <td className="py-5 px-4 hidden sm:table-cell">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{insight.description}</span>
                  </td>
                  <td className="py-5 px-4 text-right">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black tracking-wider ${
                      insight.isPositive 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    }`}>
                      <TrendingUp size={12} className={!insight.isPositive ? 'rotate-180' : ''} />
                      {insight.trend}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
