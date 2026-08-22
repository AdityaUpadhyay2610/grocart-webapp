import React from 'react';
import { ChevronUp, ChevronDown, Plus, Upload, FileJson, X, Search, Trash2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

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
  form: any;
  setForm: (val: any) => void;
  handleCategoryChange: (val: string) => void;
  CATEGORIES: any[];
}

export function RetailerInventoryTab({
  products, isLoading, inventorySearch, setInventorySearch,
  isPublishExpanded, setIsPublishExpanded,
  isInventoryExpanded, setIsInventoryExpanded,
  showAllInventory, setShowAllInventory,
  showJsonFormat, setShowJsonFormat,
  handleBulkUpload, handleCreate, handleRemoveAll,
  deleteMutation, createMutation, form, setForm,
  handleCategoryChange, CATEGORIES
}: RetailerInventoryTabProps) {

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    (p.categoryName || '').toLowerCase().includes(inventorySearch.toLowerCase())
  );
  const displayedProducts = showAllInventory ? filteredProducts : filteredProducts.slice(0, 5);

  return (
    <>
      {/* PRODUCT PUBLISHING */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-150/60 p-5 mt-6 print:hidden">
        <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setIsPublishExpanded(!isPublishExpanded)}>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plus size={18} className="text-blue-600"/> Publish New Product
          </h2>
          {isPublishExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
        </div>

        {isPublishExpanded && (
          <div className="mt-5 border-t border-slate-100 dark:border-slate-800/80 pt-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-end items-end sm:items-center gap-3 mb-5">
              <button onClick={() => setShowJsonFormat(!showJsonFormat)} className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                <FileJson size={14} /> {showJsonFormat ? 'Hide Format' : 'JSON Format'}
              </button>
              <div className="relative overflow-hidden inline-block">
                <input type="file" accept=".json" onChange={handleBulkUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <button className="text-xs font-bold text-slate-700 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
                  <Upload size={14} /> Bulk Import
                </button>
              </div>
            </div>

            {showJsonFormat && (
              <div className="mb-5 bg-slate-800 rounded-lg p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto relative">
                <button onClick={() => setShowJsonFormat(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X size={14}/></button>
                {`[ { "title": "Milk 1L", "categoryId": "dairy", "costPrice": 40, "sellingPrice": 45, "stockQuantity": 50, "unit": "liter", "imageUrl": "..." } ]`}
              </div>
            )}

            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Product Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                <select value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:bg-slate-800 cursor-pointer transition-all">
                  {CATEGORIES.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                  <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as any })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50">
                    <option value="pcs">Pcs</option><option value="kg">Kg</option><option value="liter">L</option>
                  </select>
                  </div>
                  <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Initial Stock</label>
                  <input type="number" min="0" required value={form.stockQuantity === 0 && form.stockQuantity !== '0' ? '' : form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Cost Price (₹)</label>
                <input type="number" step="0.01" min="0" required value={form.costPrice === 0 ? '' : form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Selling Price (₹)</label>
                <input type="number" step="0.01" min="0" required value={form.sellingPrice === 0 ? '' : form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image URL</label>
                <input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-1 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>
              
              <div className="sm:col-span-2 lg:col-span-3">
                <button type="submit" disabled={createMutation.isPending} className="w-full lg:w-max ml-auto rounded-lg bg-blue-600 py-2.5 px-8 text-sm font-bold tracking-wide text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                  {createMutation.isPending ? <RefreshCw size={16} className="animate-spin"/> : <Plus size={16} strokeWidth={3} />} Add to Inventory
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* INVENTORY MANAGEMENT */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-150/60 p-5 mt-6 print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsInventoryExpanded(!isInventoryExpanded)}>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 hover:text-blue-600 transition-colors">
              Inventory List <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs ml-1">{products.length}</span>
            </h2>
            {isInventoryExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
          </div>
          
          {isInventoryExpanded && (
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search inventory..." 
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1"
                />
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedProducts.map(item => (
                  <div key={item.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex gap-3 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group bg-white dark:bg-slate-800 shadow-sm hover:shadow-md">
                    <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100'; }} />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.title}</h3>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">{item.categoryName}</span>
                          <span className="text-[11px] font-black text-slate-900 dark:text-white">
                            ₹{item.sellingPrice.toFixed(2)} <span className="text-[9px] text-slate-500 font-semibold lowercase">/ {item.unit}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] font-black flex items-center gap-1 uppercase ${item.stockQuantity > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.stockQuantity > 0 ? <CheckCircle2 size={10}/> : <AlertCircle size={10}/>} Stock: {item.stockQuantity}
                        </span>
                        <button onClick={() => { if(window.confirm('Delete?')) deleteMutation.mutate(item.id); }} className="text-slate-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <Trash2 size={14} />
                        </button>
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
    </>
  );
}
