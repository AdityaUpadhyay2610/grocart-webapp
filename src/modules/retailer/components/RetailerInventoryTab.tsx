import React from 'react';
import { ChevronUp, ChevronDown, Plus, Upload, FileJson, X, Search, Trash2, RefreshCw, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';

const getUniqueImageUrl = (url: string, id: string, title?: string) => {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent((title || 'Product').trim())}&background=random&color=fff&size=400&font-size=0.33&length=2&bold=true`;
  if (!url) return fallback;
  if (typeof url === 'string' && (url.includes("loremflickr.com") || url.includes("pollinations.ai"))) {
    return fallback;
  }
  return url;
};

interface RetailerInventoryTabProps {
  products: any[];
  isLoading: boolean;
  inventorySearch: string;
  setInventorySearch: (val: string) => void;
  isPublishExpanded: boolean;
  setIsPublishExpanded: (val: boolean) => void;
  isInventoryExpanded: boolean;
  setIsInventoryExpanded: (val: boolean) => void;
  showAllInventory: boolean;
  setShowAllInventory: (val: boolean) => void;
  showJsonFormat: boolean;
  setShowJsonFormat: (val: boolean) => void;
  handleBulkUpload: (e: any) => void;
  handleCreate: (e: any) => void;
  handleRemoveAll: () => void;
  deleteMutation: any;
  createMutation: any;
  forms: any[];
  setForms: (val: any[]) => void;
  handleCategoryChange: (index: number, val: string) => void;
  CATEGORIES: any[];
  handleEditProduct: (product: any) => void;
}

export function RetailerInventoryTab({
  products, isLoading, inventorySearch, setInventorySearch,
  isPublishExpanded, setIsPublishExpanded,
  isInventoryExpanded, setIsInventoryExpanded,
  showAllInventory, setShowAllInventory,
  showJsonFormat, setShowJsonFormat,
  handleBulkUpload, handleCreate, handleRemoveAll,
  deleteMutation, createMutation, forms, setForms,
  handleCategoryChange, CATEGORIES, handleEditProduct
}: RetailerInventoryTabProps) {

  const [sortOrder, setSortOrder] = React.useState<'latest' | 'oldest'>('latest');

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (p.categoryName || '').toLowerCase().includes(inventorySearch.toLowerCase())
  );

  const sortedProducts = [...filteredProducts];
  if (sortOrder === 'latest') {
    sortedProducts.reverse();
  }

  const displayedProducts = showAllInventory ? sortedProducts : sortedProducts.slice(0, 5);

  return (
    <div className="animate-fade-in relative z-10 space-y-6">
      <div className="px-2 mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Inventory Manager</h2>
      </div>

      {/* PRODUCT PUBLISHING */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 print:hidden">
        <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsPublishExpanded(!isPublishExpanded)}>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-colors">
            <Plus size={16} /> Publish New Product
          </button>
          {isPublishExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
        </div>

        {isPublishExpanded && (
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 mb-5">
              <button type="button" onClick={() => setShowJsonFormat(!showJsonFormat)} className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                <FileJson size={14} /> {showJsonFormat ? 'Hide Template' : 'Excel Template'}
              </button>
              <div className="relative overflow-hidden inline-block">
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleBulkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <button type="button" className="text-xs font-bold text-slate-700 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
                  <Upload size={14} /> Bulk Import
                </button>
              </div>
            </div>

            {showJsonFormat && (
              <div className="mb-5 bg-slate-800 rounded-lg p-3 text-[11px] text-emerald-400 overflow-x-auto relative">
                <button type="button" onClick={() => setShowJsonFormat(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={14}/></button>
                <div className="font-bold mb-2 text-white">Excel columns expected:</div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="py-1 px-2">Title</th>
                      <th className="py-1 px-2">Category ID</th>
                      <th className="py-1 px-2">Cost Price</th>
                      <th className="py-1 px-2">Selling Price</th>
                      <th className="py-1 px-2">Stock</th>
                      <th className="py-1 px-2">Unit</th>
                      <th className="py-1 px-2">Unit Size</th>
                      <th className="py-1 px-2">Image URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-1 px-2">Milk 1L</td>
                      <td className="py-1 px-2">dairy</td>
                      <td className="py-1 px-2">40</td>
                      <td className="py-1 px-2">45</td>
                      <td className="py-1 px-2">50</td>
                      <td className="py-1 px-2">liter</td>
                      <td className="py-1 px-2">1</td>
                      <td className="py-1 px-2">http...</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <div className="font-bold mb-2 text-white">Valid Category IDs to use in Excel:</div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c, i) => (
                      <div key={`cat-${c.id}-${i}`} className="bg-slate-700 text-slate-200 px-2 py-1 rounded text-[10px] border border-slate-600">
                        <strong className="text-emerald-400">{c.id}</strong> <span className="opacity-60">-</span> {c.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreate}>
              {forms.map((form: any, index: number) => (
                <div key={`form-${index}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/80 relative">
                  {forms.length > 1 && (
                    <button type="button" onClick={() => setForms(forms.filter((_: any, i: number) => i !== index))} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Product Title</label>
                    <input required value={form.title} onChange={(e) => { const f = [...forms]; f[index].title = e.target.value; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                    <select value={form.categoryId} onChange={(e) => handleCategoryChange(index, e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 cursor-pointer transition-all">
                      {CATEGORIES.map((c, i) => <option key={`opt-${c.id}-${i}`} value={String(c.id)}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-4">
                      <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                      <select value={form.unit} onChange={(e) => { const f = [...forms]; f[index].unit = e.target.value; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50">
                        <option value="pcs">Pcs</option><option value="kg">Kg</option><option value="liter">L</option>
                      </select>
                      </div>
                      <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit Size</label>
                      <input type="number" step="0.01" min="0.01" required value={form.unitSize === 0 ? '' : form.unitSize} onChange={(e) => { const f = [...forms]; f[index].unitSize = parseFloat(e.target.value) || 1; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                      </div>
                      <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Initial Stock</label>
                      <input type="number" min="0" required value={form.stockQuantity === 0 && form.stockQuantity !== '0' ? '' : form.stockQuantity} onChange={(e) => { const f = [...forms]; f[index].stockQuantity = parseInt(e.target.value, 10) || 0; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Cost Price (₹)</label>
                    <input type="number" step="0.01" min="0" required value={form.costPrice === 0 ? '' : form.costPrice} onChange={(e) => { const f = [...forms]; f[index].costPrice = parseFloat(e.target.value) || 0; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Selling Price (₹)</label>
                    <input type="number" step="0.01" min="0" required value={form.sellingPrice === 0 ? '' : form.sellingPrice} onChange={(e) => { const f = [...forms]; f[index].sellingPrice = parseFloat(e.target.value) || 0; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image URL (Optional)</label>
                    <input placeholder="Leave empty for auto-generated image" value={form.imageUrl} onChange={(e) => { const f = [...forms]; f[index].imageUrl = e.target.value; setForms(f); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-end items-center">
                <button type="button" onClick={() => setForms([...forms, { title: '', categoryId: CATEGORIES.length > 0 ? CATEGORIES[0].id : '', categoryName: CATEGORIES.length > 0 ? CATEGORIES[0].name : '', unit: 'pcs', unitSize: 1, imageUrl: '', costPrice: 0, sellingPrice: 0, stockQuantity: 0, description: '' }])} className="w-full sm:w-max rounded-lg bg-slate-100 dark:bg-slate-700 py-2.5 px-6 text-sm font-bold tracking-wide text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all flex justify-center items-center gap-2">
                  <Plus size={16} strokeWidth={3} /> Add More
                </button>
                <button type="submit" disabled={createMutation.isPending} className="w-full sm:w-max rounded-lg bg-blue-600 py-2.5 px-8 text-sm font-bold tracking-wide text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {createMutation.isPending ? <RefreshCw size={16} className="animate-spin"/> : <CheckCircle2 size={16} strokeWidth={3} />} Submit Products
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* INVENTORY MANAGEMENT */}
      <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-6 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Inventory List <span className="bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-xs border border-white/50 dark:border-slate-700/50">{products.length}</span>
            </h3>
            {isInventoryExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
          </div>
          
          {isInventoryExpanded && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search..." 
                  className="w-full pl-9 pr-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
                className="px-3 py-2 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm cursor-pointer hover:bg-white transition-colors"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
              {products.length > 0 && (
                <button onClick={handleRemoveAll} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-100" title="Remove All">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {isInventoryExpanded && (
          <div>
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 flex justify-center items-center gap-2 font-semibold text-sm">
                <RefreshCw size={18} className="animate-spin text-blue-600"/> Loading...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-medium text-sm border border-dashed border-slate-200 rounded-xl">
                No items match your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {displayedProducts.map((item, i) => (
                  <div key={`prod-${item.id}-${i}`} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white dark:border-slate-700/50 rounded-[1.5rem] overflow-hidden flex flex-col group shadow-sm hover:shadow-md transition-all">
                    <div className="h-32 w-full relative bg-slate-100 dark:bg-slate-700">
                      <img 
                        src={getUniqueImageUrl(item.imageUrl, item.id, item.title)} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent((item.title || 'P').substring(0,2).toUpperCase())}`; }} 
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditProduct(item); }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete?')) deleteMutation.mutate(item.id); }} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-500 hover:text-red-500 rounded-full p-1.5 shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{item.categoryName || 'Product'}</div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-3 line-clamp-2">{item.title}</h3>
                      
                      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-end justify-between">
                        <div>
                          <div className="text-lg font-black text-slate-900 dark:text-white leading-none">
                            ₹{item.sellingPrice} <span className="text-xs font-bold text-slate-500">/ {item.unitSize || 1} {item.unit}</span>
                          </div>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-wider ${item.stockQuantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          STOCK: {item.stockQuantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredProducts.length > 5 && (
              <div className="pt-4 flex justify-center mt-2">
                <button onClick={() => setShowAllInventory(!showAllInventory)} className="text-xs font-bold text-blue-600 hover:underline">
                  {showAllInventory ? 'Show Less' : `View All ${filteredProducts.length} Items`}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
