import React, { useState } from 'react';
import { Search, ChevronDown, RefreshCw } from 'lucide-react';
import { ProductCategory } from '@global/models';
import { useToast } from '@global/context/ToastContext';

interface AdminCategoriesTabProps {
  categories: ProductCategory[];
  categoriesLoading: boolean;
  createCategoryMutation: any;
}

export function AdminCategoriesTab({ categories, categoriesLoading, createCategoryMutation }: AdminCategoriesTabProps) {
  const [form, setForm] = useState({ id: '', name: '', description: '', image: '' });
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.id || !form.name) return;
    
    createCategoryMutation.mutate(
      {
        id: form.id.toLowerCase().replace(/\s+/g, '-'),
        name: form.name,
        description: form.description || '',
        image: form.image || 'https://placehold.co/400x300?text=Category'
      },
      {
        onSuccess: () => {
          setForm({ id: '', name: '', description: '', image: '' });
          showToast('Category created successfully!', 'success');
        }
      }
    );
  };

  // Mock subcategories and fill rates for the UI
  const mockCategories = categories.length > 0 ? categories : [
    { id: 'fresh-fruits', name: 'Fresh Fruits', color: 'bg-emerald-50 text-emerald-600', fill: 85, icon: '🍏', sub: ['Apples, Bananas, Berries', 'Citrus'] },
    { id: 'bread-biscuits', name: 'Bread and Biscuits', color: 'bg-amber-50 text-amber-600', fill: 70, icon: '🍞', sub: ['Bread-and-and, Biscuits', 'Daxidres'] },
    { id: 'sweet-tooth', name: 'Sweet Tooth', color: 'bg-pink-50 text-pink-600', fill: 60, icon: '🍬', sub: ['Sweet, Tooth, Biscuits', 'Bath-wnets'] },
    { id: 'bath-body', name: 'Bath and Body', color: 'bg-blue-50 text-blue-600', fill: 59, icon: '🧼', sub: ['Bath-and-Body', 'Wonertoners'] },
  ];

  const sortedCategories = [...mockCategories];
  if (sortOrder === 'latest') {
    sortedCategories.reverse();
  }

  return (
    <div className="animate-fade-in relative">
      {/* Background Pattern - Absolute positioned to fill the tab area behind glass elements */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.15] dark:opacity-5 pointer-events-none rounded-3xl"
        style={{
          // backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)'
        }}
      />

      <div className="relative z-10 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight px-2">Advanced Category Taxonomy Management</h2>

        {/* Add New Category Glass Panel */}
        <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-8">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Add New Category</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Category ID</label>
                <input 
                  required 
                  value={form.id} 
                  onChange={e => setForm({ ...form, id: e.target.value })} 
                  className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                  placeholder="Category ID (e.g. FRESH_FRUITS)" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Display Name</label>
                <input 
                  required 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                  placeholder="Display Name" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Description (Optional)</label>
              <input 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                className="w-full rounded-xl border border-white dark:border-slate-700/50 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none bg-white/80 dark:bg-slate-800/80 shadow-sm" 
                placeholder="Description (Optional)" 
              />
            </div>

            <button 
              type="submit" 
              disabled={createCategoryMutation.isPending} 
              className="w-full rounded-xl bg-blue-600 py-3.5 px-8 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 active:scale-[0.99] disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {createCategoryMutation.isPending ? <RefreshCw size={18} className="animate-spin"/> : 'Create Category'}
            </button>
          </form>
        </section>

        {/* Taxonomy Builder Grid */}
        <section className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white/50 dark:border-slate-700/50 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Taxonomy Builder</h3>
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Global Search" 
                  className="w-full pl-9 pr-3 py-2 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700/50 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 outline-none transition-colors shadow-sm"
                />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
                className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700/50 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm cursor-pointer hover:bg-white transition-colors"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
              <button className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-white dark:border-slate-700/50 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 shadow-sm hover:bg-white transition-colors shrink-0">
                <span>Bulk Actions</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesLoading ? (
              <div className="col-span-full py-12 text-center flex justify-center text-blue-600">
                <RefreshCw size={24} className="animate-spin" />
              </div>
            ) : (
              sortedCategories.map((cat: any, i: number) => {
                const fillRate = cat.fill || Math.floor(Math.random() * 50) + 40;
                const colors = [
                  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-500', bar: 'bg-emerald-500' },
                  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-500', bar: 'bg-amber-500' },
                  { bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-500', bar: 'bg-pink-500' },
                  { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-500', bar: 'bg-blue-500' },
                ];
                const theme = colors[i % 4];

                return (
                  <div key={cat.id || i} className="bg-white/80 dark:bg-slate-800/80 rounded-3xl p-6 border border-white dark:border-slate-700/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                    {/* Watermark Icon */}
                    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${theme.bg} flex items-center justify-center opacity-50 group-hover:scale-110 transition-transform duration-500`}>
                      <span className="text-4xl">{cat.icon || '📦'}</span>
                    </div>

                    <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 relative z-10">{cat.name}</h4>
                    
                    <div className="mb-6 relative z-10">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Category Fill Rate</span>
                        <span className={`text-lg font-black ${theme.text}`}>{fillRate}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${theme.bar} rounded-full`} style={{ width: `${fillRate}%` }} />
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                      {(cat.sub || ['Subcategory 1', 'Subcategory 2']).map((sub: string, idx: number) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                          <span className="text-slate-300 dark:text-slate-600 text-lg leading-none">›</span>
                          <span className="truncate">{sub}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
