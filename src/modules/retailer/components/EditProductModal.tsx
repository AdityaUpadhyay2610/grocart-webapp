import React, { useState } from 'react';
import { ProductItem, ProductCategory } from '@global/models';
import { X, Save, RefreshCw } from 'lucide-react';

interface EditProductModalProps {
  product: ProductItem;
  categories: ProductCategory[];
  onClose: () => void;
  onSave: (e: React.FormEvent, updatedData: Partial<ProductItem>) => void;
  isSaving: boolean;
}

export function EditProductModal({ product, categories, onClose, onSave, isSaving }: EditProductModalProps) {
  const [form, setForm] = useState({
    title: product.title || '',
    categoryId: product.categoryId || '',
    unit: product.unit || 'pcs',
    unitSize: product.unitSize || 1,
    stockQuantity: product.stockQuantity || 0,
    costPrice: product.costPrice || 0,
    sellingPrice: product.sellingPrice || 0,
    imageUrl: product.imageUrl || '',
  });

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const cat = categories.find(c => String(c.id) === id);
    if (cat) {
      setForm(prev => ({ ...prev, categoryId: id, categoryName: cat.name }));
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl shadow-2xl border border-white/50 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800/80">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Edit Product</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="edit-product-form" onSubmit={(e) => onSave(e, form)} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Product Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Category</label>
                <select value={form.categoryId} onChange={handleCategoryChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50">
                  {categories.map((c, i) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50">
                    <option value="pcs">Pcs</option><option value="kg">Kg</option><option value="liter">L</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Unit Size</label>
                  <input type="number" step="0.01" min="0.01" required value={form.unitSize} onChange={(e) => setForm({ ...form, unitSize: parseFloat(e.target.value) || 1 })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Stock</label>
                  <input type="number" min="0" required value={form.stockQuantity === 0 ? '' : form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Cost Price (₹)</label>
                <input type="number" step="0.01" min="0" required value={form.costPrice === 0 ? '' : form.costPrice} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Selling Price (₹)</label>
                <input type="number" step="0.01" min="0" required value={form.sellingPrice === 0 ? '' : form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image URL (Optional)</label>
                <input placeholder="Leave empty for auto-generated image" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:border-blue-500 outline-none bg-slate-50 dark:bg-slate-800/50" />
              </div>
              
              {form.imageUrl && (
                <div className="sm:col-span-2 mt-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Image Preview</p>
                  <div className="h-32 w-32 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/64748b?text=N/A`} />
                  </div>
                </div>
              )}

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-b-[2rem]">
          <button onClick={onClose} type="button" className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button form="edit-product-form" type="submit" disabled={isSaving} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
        
      </div>
    </div>
  );
}
