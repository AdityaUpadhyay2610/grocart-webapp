import React from 'react';
import { Search, MoreHorizontal, AlertCircle, X, AlertTriangle, ChevronUp, ChevronDown, Store } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface AdminInventoryTabProps {
  companyFilter: string;
  setCompanyFilter: (v: string) => void;
  visibleVendors: string[];
  expandedVendors: Record<string, boolean>;
  groupedProducts: Record<string, any[]>;
  toggleVendor: (vendor: string) => void;
}

const sparklineData = [
  { value: 10 }, { value: 15 }, { value: 8 }, { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }
];

export function AdminInventoryTab({
  companyFilter, setCompanyFilter, visibleVendors, expandedVendors, groupedProducts, toggleVendor
}: AdminInventoryTabProps) {
  
  const [vendorLimits, setVendorLimits] = React.useState<Record<string, number>>({});
  
  const allProducts = Object.values(groupedProducts).flat();

  return (
    <div className="space-y-8 animate-fade-in text-slate-800 dark:text-slate-200 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Pro Inventory & Master Catalog</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Advanced multi-vendor inventory and catalog management.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
            placeholder="Search products..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent border border-slate-300 dark:border-slate-700 rounded-full text-sm font-semibold text-slate-800 dark:text-slate-200 focus:border-emerald-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        {/* Catalog Health Widget */}
        <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-emerald-500/30 rounded-[2rem] p-6 shadow-lg shadow-emerald-500/5 w-full md:w-[400px]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Catalog Health: <span className="text-emerald-500 dark:text-emerald-400">92% (Excellent)</span></span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Missing Info: 5</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Stock Alerts: 2</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-500"></div> Compensators: 0</span>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">
            Low Stock <X size={14} className="text-slate-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">
            High Margin <X size={14} className="text-slate-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors">
            Near Expiry <X size={14} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Pro Data Table - Vendor Wise */}
      <div className="space-y-6">
        {visibleVendors.map((vendor) => {
          const products = groupedProducts[vendor] || [];
          if (products.length === 0) return null;
          const isExpanded = expandedVendors[vendor] !== false; // default expanded
          const limit = vendorLimits[vendor] || 5;
          const displayedProducts = products.slice(0, limit);
          const hasMore = products.length > limit;

          return (
            <div key={vendor} className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-800 overflow-hidden">
              {/* Vendor Header Row */}
              <div 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                onClick={() => toggleVendor(vendor)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <Store size={22} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">{vendor}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{products.length} Products</span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Retailer</span>
                    </div>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Vendor Products Table */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6 text-center">Sales Velocity</th>
                        <th className="py-4 px-6 text-center">Category</th>
                        <th className="py-4 px-6">Pricing</th>
                        <th className="py-4 px-6">Stock Level</th>
                        <th className="py-4 px-6 text-center">Quick Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                      {displayedProducts.map((p: any, idx: number) => (
                        <tr key={p.id || idx} className="hover:bg-white/40 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 overflow-hidden shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                                <img src={p.images?.[0] || p.imageUrl || p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title || 'Product')}&background=random&color=fff`} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-emerald-500 uppercase mb-0.5">Fresh</div>
                                <div className="font-bold text-slate-900 dark:text-slate-200 text-sm">{p.title}</div>
                                <div className="text-[10px] font-mono text-slate-500">ID: {(p.id || '').slice(0, 12)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 w-48">
                            <div className="flex flex-col items-end w-full">
                              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mb-1"><ArrowUp size={10} /> 12%</span>
                              <div className="h-8 w-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={sparklineData}>
                                    <defs>
                                      <linearGradient id={`colorSpark-${p.id || idx}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill={`url(#colorSpark-${p.id || idx})`} isAnimationActive={false} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-wider rounded-lg">
                              {p.categoryName || p.category || 'FRESH FRUITS'}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-black text-slate-900 dark:text-white text-base">
                              ₹{p.sellingPrice || p.price || 0} <span className="text-[10px] font-bold text-slate-500">/ {p.unitSize ? `${p.unitSize} ${p.unit || 'pcs'}` : (p.unit || p.itemQuantity || p.quantity || '1 pcs')}</span>
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Margin: {p.margin || '28.6'}%</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold rounded-lg mb-1">
                              {p.stockQuantity !== undefined ? `${p.stockQuantity} ${p.unit || 'pcs'}` : p.stock || '45 kg'}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500">{p.status || 'In Stock'}</div>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                              <MoreHorizontal size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {hasMore && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 flex justify-center">
                      <button 
                        onClick={() => setVendorLimits(prev => ({ ...prev, [vendor]: limit + 10 }))}
                        className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all"
                      >
                        Show More Products ({products.length - limit} remaining)
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visibleVendors.length === 0 && (
          <div className="p-12 text-center bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-bold">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Dummy component for ArrowUp used in the sparkline text
const ArrowUp = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);
