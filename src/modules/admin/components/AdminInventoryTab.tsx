import React from 'react';
import { Box, Search, Store, ChevronUp, ChevronDown } from 'lucide-react';

interface AdminInventoryTabProps {
  companyFilter: string;
  setCompanyFilter: (v: string) => void;
  visibleVendors: string[];
  expandedVendors: Record<string, boolean>;
  groupedProducts: Record<string, any[]>;
  toggleVendor: (vendor: string) => void;
}

export function AdminInventoryTab({
  companyFilter, setCompanyFilter, visibleVendors,
  expandedVendors, groupedProducts, toggleVendor
}: AdminInventoryTabProps) {
  return (
    <section className="bg-white dark:bg-[#111724] rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-800/80 overflow-hidden animate-fade-in mt-6">
      <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Box size={18} className="text-slate-500"/> Multi-Vendor Catalog
        </h2>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)}
            placeholder="Search products..." 
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#111724] border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none shadow-sm transition-shadow"
          />
        </div>
      </div>

      {/* Grouped Catalog View */}
      <div className="divide-y divide-slate-100">
        {visibleVendors.map(vendorName => {
          const isExpanded = expandedVendors[vendorName] ?? true;
          const vendorProducts = groupedProducts[vendorName] || [];
          const displayedProducts = isExpanded ? vendorProducts.slice(0, 5) : [];
          
          return (
            <div key={vendorName} className="bg-white dark:bg-[#111724]">
              {/* Vendor Header (Click to toggle) */}
              <div 
                className="px-4 md:px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 dark:bg-slate-800/80 transition-colors"
                onClick={() => toggleVendor(vendorName)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{vendorName}</h3>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{vendorProducts.length} Items Listed</div>
                  </div>
                </div>
                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Dropdown Content */}
              {isExpanded && (
                <div className="px-4 md:px-6 pb-4 animate-fade-in">
                  {/* Desktop Table for Vendor Products */}
                  <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing</th>
                          <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stock Level</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedProducts.map(p => {
                          const margin = p.sellingPrice - p.costPrice;
                          const marginPercent = p.costPrice > 0 ? (margin / p.costPrice) * 100 : 100;
                          return (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:bg-slate-800/50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">{p.title}</div>
                                <div className="text-xs text-slate-500">ID: {p.id.slice(0, 8)}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                                  {p.categoryName || p.categoryId}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-bold text-slate-900 dark:text-white">₹{p.sellingPrice}</div>
                                <div className="text-[10px] font-bold text-emerald-600">Margin: {marginPercent.toFixed(1)}%</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                  p.stockQuantity > 20 ? 'bg-emerald-100 text-emerald-800' :
                                  p.stockQuantity > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {p.stockQuantity} {p.unit}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards for Vendor Products */}
                  <div className="md:hidden grid grid-cols-1 gap-3">
                    {displayedProducts.map(p => (
                      <div key={p.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="font-bold text-slate-900 dark:text-white text-sm mb-1">{p.title}</div>
                        <div className="flex justify-between items-center text-xs text-slate-600 mb-2">
                          <span>{p.categoryName || p.categoryId}</span>
                          <span className="font-bold text-emerald-600">₹{p.sellingPrice}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Stock:</span>
                          <span className={`font-bold ${p.stockQuantity > 20 ? 'text-emerald-600' : p.stockQuantity > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                            {p.stockQuantity} {p.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {vendorProducts.length > 5 && (
                    <div className="text-center pt-4">
                      <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All {vendorProducts.length} Items</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {visibleVendors.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-bold">No products found.</div>
        )}
      </div>
    </section>
  );
}
