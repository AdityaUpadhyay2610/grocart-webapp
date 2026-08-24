import React from 'react';
import { IndianRupee, Users, ClipboardList, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

interface AdminOverviewTabProps {
  platformStats: any;
  retailers: any[];
  customers: any[];
  allOrders?: any[];
}

// Mock data for charts
const revenueData = [
  { name: 'Day 1', revenue: 200, efficiency: 150 },
  { name: 'Day 5', revenue: 350, efficiency: 250 },
  { name: 'Day 10', revenue: 280, efficiency: 200 },
  { name: 'Day 15', revenue: 400, efficiency: 280 },
  { name: 'Day 20', revenue: 380, efficiency: 300 },
  { name: 'Day 25', revenue: 650, efficiency: 450 },
  { name: 'Day 30', revenue: 500, efficiency: 350 },
];

const slaData = [{ name: 'Active Store SLA', value: 92, fill: '#10B981' }];
const catalogData = [{ name: 'Catalog Approval Rate', value: 88, fill: '#10B981' }];

const GaugeChart = ({ data, label, subLabel }: any) => {
  return (
    <div className="flex flex-col items-center">
      <div className="h-40 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" cy="70%" 
            innerRadius="70%" outerRadius="100%" 
            barSize={16} 
            data={data} 
            startAngle={180} endAngle={0}
          >
            <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={8} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center">
          <span className="text-3xl font-black text-slate-800 dark:text-white leading-none">{data[0].value}</span>
          <span className="text-xs font-bold text-slate-400">/100</span>
        </div>
      </div>
      <div className="text-center mt-[-10px]">
        <div className="text-emerald-500 font-bold text-[10px] uppercase tracking-wider mb-1">Green</div>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{label}</div>
        <div className="text-[10px] text-slate-500">{subLabel}</div>
      </div>
    </div>
  );
};

export function AdminOverviewTab({ platformStats, retailers, customers, allOrders = [] }: AdminOverviewTabProps) {
  // Compute Real Data
  const realGmv = allOrders.filter(o => !['cancelled', 'returned'].includes(o.status)).reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const platformMargin = realGmv * 0.03; // Assuming 3% platform fee
  
  const activeOrders = allOrders.filter(o => !['delivered', 'cancelled', 'returned'].includes(o.status));
  const ordersInQueue = activeOrders.length;
  
  const latestOrders = [...allOrders].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in relative z-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">Executive Dashboard</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Platform Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total GMV */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <IndianRupee size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total GMV</div>
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">₹{realGmv.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-[10px] font-semibold text-slate-400">Total Order Value</div>
            </div>
          </div>

          {/* Platform Margin */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <IndianRupee size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Platform Margin</div>
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">₹{platformMargin.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="text-[10px] font-semibold text-slate-400">Net Yield (3%)</div>
            </div>
          </div>

          {/* Total Shoppers */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Users size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Shoppers</div>
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{customers.length}</div>
              <div className="text-[10px] font-semibold text-slate-400">Registered Users</div>
            </div>
          </div>

          {/* Orders in Queue */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Orders in Queue</div>
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{ordersInQueue}</div>
              <div className="text-[10px] font-semibold text-slate-400">Active Pipeline</div>
            </div>
          </div>

          {/* Active Pros */}
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Partners</div>
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{retailers.length}</div>
              <div className="text-[10px] font-semibold text-slate-400">Registered Retailers</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Details Gauges */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">Performance Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col justify-center">
              <GaugeChart data={slaData} label="Active Store SLA" subLabel="92%" />
            </div>
            <div className="flex flex-col justify-center">
              <GaugeChart data={catalogData} label="Catalog Approval Rate" subLabel="88%" />
            </div>
          </div>
        </div>

        {/* Live Order Stream */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Live Order Stream</h3>
          <div className="flex-1 overflow-y-auto space-y-3">
            {latestOrders.length > 0 ? (
              latestOrders.map((order, i) => {
                const itemCount = Array.isArray(order.items) ? order.items.length : Object.keys(order.items || {}).length;
                return (
                  <div key={order.id || i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700/50 rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">Order #{order.id.slice(-6)}</div>
                      <div className="text-[10px] text-slate-500">{itemCount} items, ₹{order.totalAmount}</div>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full text-[10px] uppercase font-black">
                      {order.status || 'Pending'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No recent orders.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Revenue vs Fulfillment Efficiency (Last 30 Days)</h3>
            <div className="flex space-x-4 text-xs font-bold">
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full"></div><span className="text-emerald-600">Revenue</span></div>
              <div className="flex items-center space-x-1.5"><div className="w-2 h-2 bg-blue-300 rounded-full"></div><span className="text-blue-400">Efficiency</span></div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#93C5FD" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#93C5FD" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `₹${value}k`} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="efficiency" stroke="#93C5FD" strokeWidth={3} fillOpacity={1} fill="url(#colorEfficiency)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Distribution */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-8">Sales Distribution & Categories</h3>
          
          <div className="mb-4">
            <div className="h-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full rounded-full shadow-sm" style={{ width: '65%' }}></div>
            </div>
          </div>
          <div className="flex justify-between text-xs font-bold">
            <span className="text-emerald-600">ONLINE (65%)</span>
            <span className="text-slate-400">OFFLINE (35%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
