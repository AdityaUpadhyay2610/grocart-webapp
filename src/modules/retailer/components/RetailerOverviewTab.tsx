import React from 'react';
import { ShoppingCart, Truck, Box, DollarSign, Check, Copy, Package, LayoutGrid, PackageCheck } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis, AreaChart, Area } from 'recharts';

interface RetailerOverviewTabProps {
  stats: any;
  user: any;
  products?: any[];
  orders?: any[];
}

// Mock KPI data
const kpiData = [
  { name: 'SLA Pack Rate', value: 90, color: '#a855f7', label: '18/20' }, // Purple
  { name: 'Fulfillment Health', value: 95, color: '#10b981', label: '95%' }, // Green
  { name: 'Pending Invoices', value: 12, color: '#f59e0b', label: '02/16' }, // Yellow
];

// Mock Chart Data for sparkline
const sparklineData = [
  { demands: 1500, earnings: 800, investment: 1200, stocks: 2000 },
  { demands: 2300, earnings: 1400, investment: 1500, stocks: 1800 },
  { demands: 3400, earnings: 2200, investment: 1800, stocks: 1600 },
  { demands: 2800, earnings: 2700, investment: 1600, stocks: 1400 },
  { demands: 3800, earnings: 3400, investment: 2100, stocks: 1200 },
  { demands: 4200, earnings: 3900, investment: 2500, stocks: 900 },
  { demands: 4800, earnings: 4500, investment: 2800, stocks: 800 }
];

export function RetailerOverviewTab({ stats, user, products, orders }: RetailerOverviewTabProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  // Compute Live Stock Counters
  const totalItems = products?.length || 0;
  const totalStocks = products?.reduce((sum, p) => sum + (Number(p.stockQuantity) || 0), 0) || 0;
  const totalStockValue = products?.reduce((sum, p) => sum + ((Number(p.stockQuantity) || 0) * (Number(p.sellingPrice) || 0)), 0) || 0;
  
  let orderedStocks = 0;
  let completedOrderStocks = 0;
  let totalSoldValue = 0;

  orders?.forEach(order => {
    const itemsArr = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
    const retailerItems = itemsArr.filter((item: any) => item.retailerId === user?.uid);
    const orderQuantity = retailerItems.reduce((sum, item: any) => sum + (Number(item.quantity) || 0), 0);
    const orderValue = retailerItems.reduce((sum, item: any) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);
    
    if (order.status === 'delivered') {
      completedOrderStocks += orderQuantity;
      totalSoldValue += orderValue;
    } else if (order.status !== 'cancelled' && order.status !== 'returned') {
      orderedStocks += orderQuantity;
    }
  });

  const copyVendorId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      
      {/* User Profile Widget */}
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700 shadow-sm relative overflow-hidden">
          <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Store')}&background=0ea5e9&color=fff&size=128`} alt={user?.name} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white leading-tight">{user?.name || 'Amrita'}</h2>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            Vendor ID: <span className="truncate max-w-[100px] sm:max-w-none">{user?.uid || 'LhGJ4SxfO9d2KCFzaMT5WPPdh1e2'}</span>
            <button onClick={copyVendorId} className="hover:text-emerald-600 transition-colors bg-white/50 dark:bg-slate-800/50 p-1 rounded-md border border-slate-200/50 dark:border-slate-700/50 shadow-sm shrink-0">
              {isCopied ? <Check size={12} className="text-emerald-500"/> : <Copy size={12}/>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Updates Widget */}
        <section className="xl:col-span-2 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-6">Order Updates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-[1.5rem] border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mb-4">
                <DollarSign size={18} className="text-emerald-500"/>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">₹{stats?.totalRevenue?.toFixed(2) || '2380.00'}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Revenue Generated</div>
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-[1.5rem] border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
              <div className="h-10 w-10 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center shrink-0 mb-4">
                <Truck size={18} className="text-teal-500"/>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stats?.totalOrdersFulfilled || 18}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Completed Shipments</div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-[1.5rem] border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
              <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0 mb-4">
                <Box size={18} className="text-rose-500"/>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{stats?.activeListings || 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Active Listings</div>
              </div>
            </div>
          </div>
        </section>

        {/* Scorecard Widget */}
        <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-6">Seller Scorecard</h3>
          <div className="grid grid-cols-3 gap-2 h-full content-center">
            {kpiData.map((kpi, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center">
                <div className="h-20 w-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[kpi]} startAngle={90} endAngle={-270} barSize={8}>
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar background={{ fill: 'rgba(148, 163, 184, 0.2)' }} dataKey="value" cornerRadius={10} fill={kpi.color} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none">{kpi.label}</span>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-tight">{kpi.name}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Live Stock Counters Widget */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-6 flex items-center gap-2">
          Live Stock Counters
          <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Live</span>
          </div>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
              <LayoutGrid size={16} className="text-blue-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{totalItems}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Items</div>
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-3">
              <Box size={16} className="text-purple-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{totalStocks}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total Stocks</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-3">
              <Package size={16} className="text-amber-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{orderedStocks}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Ordered Stocks</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-3">
              <PackageCheck size={16} className="text-emerald-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">{completedOrderStocks}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Sold Stocks</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-3">
              <DollarSign size={16} className="text-indigo-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">₹{totalStockValue.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Stock Value</div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-white dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="h-8 w-8 rounded-full bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center mb-3">
              <DollarSign size={16} className="text-pink-500"/>
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white leading-tight">₹{totalSoldValue.toFixed(2)}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Sold Value</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mini Business Insights */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Sales Performance Insights</h3>
          <div className="flex gap-4 text-[10px] font-bold">
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-rose-400"></div> Selling Demands</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-400"></div> Total Earnings</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-purple-400"></div> Total Investment</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-400"></div> Total Stocks</span>
          </div>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDemands" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorStocks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="demands" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorDemands)" />
              <Area type="monotone" dataKey="earnings" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
              <Area type="monotone" dataKey="investment" stroke="#c084fc" strokeWidth={3} fillOpacity={1} fill="url(#colorInvestment)" />
              <Area type="monotone" dataKey="stocks" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorStocks)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
