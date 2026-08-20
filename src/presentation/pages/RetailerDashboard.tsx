import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../application/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retailerApi } from '../../infrastructure/api/appApis';
import { ProductItem } from '../../domain/models';
import { clearSession } from '../../application/store/authSlice';
import { useNavigate } from 'react-router';

import { CATEGORIES } from '../../models/Categories';

export default function RetailerDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['retailer-products', user?.uid],
    queryFn: () => (user?.uid ? retailerApi.fetchInventory(user.uid) : Promise.resolve([])),
    enabled: !!user?.uid,
  });

  const { data: stats } = useQuery({
    queryKey: ['retailer-stats', user?.uid],
    queryFn: () => (user?.uid ? retailerApi.fetchAnalytics(user.uid) : Promise.resolve(null)),
    enabled: !!user?.uid,
  });

  const [form, setForm] = useState<Partial<ProductItem>>({
    title: '',
    categoryId: String(CATEGORIES[0].id),
    categoryName: CATEGORIES[0].name,
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    unit: 'pcs',
    description: '',
    imageUrl: '',
  });

  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: (newProduct: ProductItem) => retailerApi.saveProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', user?.uid] });
      setForm({ title: '', categoryId: String(CATEGORIES[0].id), categoryName: CATEGORIES[0].name, costPrice: 0, sellingPrice: 0, stockQuantity: 0, unit: 'pcs', description: '', imageUrl: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => retailerApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', user?.uid] });
    },
  });

  const handleCategoryChange = (catId: string) => {
    const selected = CATEGORIES.find(c => String(c.id) === catId);
    setForm({
      ...form,
      categoryId: catId,
      categoryName: selected ? selected.name : CATEGORIES[0].name,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newProd: ProductItem = {
      ...(form as ProductItem),
      id: `prod_${Date.now()}`,
      retailerId: user.uid,
      retailerStoreName: user.storeName || user.name,
      status: (form.stockQuantity || 0) > 0 ? 'active' : 'out_of_stock',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    createMutation.mutate(newProd);
  };
  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) throw new Error("JSON must be an array of products");
        
        setIsBulkUploading(true);
        
        // Process each product sequentially using mutateAsync to ensure completion
        for (let i = 0; i < json.length; i++) {
          const item = json[i];
          const newProd: ProductItem = {
            id: `prod_${Date.now()}_${i}`,
            retailerId: user.uid,
            retailerStoreName: user.storeName || user.name,
            title: item.title,
            categoryId: String(item.categoryId || CATEGORIES[0].id),
            categoryName: CATEGORIES.find(c => String(c.id) === String(item.categoryId))?.name || CATEGORIES[0].name,
            unit: item.unit || 'pcs',
            imageUrl: item.imageUrl || '',
            costPrice: Number(item.costPrice) || 0,
            sellingPrice: Number(item.sellingPrice) || 0,
            stockQuantity: Number(item.stockQuantity) || 0,
            description: item.description || '',
            status: (Number(item.stockQuantity) || 0) > 0 ? 'active' : 'out_of_stock',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await createMutation.mutateAsync(newProd);
        }
        
        setIsBulkUploading(false);
        e.target.value = ''; // Reset input
      } catch (err) {
        setIsBulkUploading(false);
        alert("Failed to parse JSON file. Ensure it matches the expected structure.");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveAll = () => {
    if (window.confirm('Are you sure you want to remove ALL your items? This cannot be undone.')) {
      products.forEach(p => {
        deleteMutation.mutate(p.id);
      });
    }
  };

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Retailer Operations Hub</h1>
            <p className="mt-1 text-sm text-gray-500">Store / Company: <span className="font-semibold text-emerald-600">{user?.storeName || user?.name}</span> | Vendor ID: {user?.uid}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </header>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Revenue</span>
            <p className="mt-2 text-4xl font-black text-gray-900">₹{stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-600 font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Revenue Generated
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-md text-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Gross Margin / Profit</span>
            <p className="mt-2 text-4xl font-black">₹{stats?.grossProfit?.toFixed(2) || '0.00'}</p>
            <div className="mt-2 text-sm text-emerald-100 font-medium">Net Earnings</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Fulfilled Orders</span>
            <p className="mt-2 text-4xl font-black text-indigo-600">{stats?.totalOrdersFulfilled || 0}</p>
            <div className="mt-2 text-sm text-gray-400 font-medium">Completed Shipments</div>
          </div>
        </div>

        {/* Product Publishing Form */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-900">Publish New Product</h2>
            <div className="flex items-center gap-4 bg-gray-50 p-2 px-4 rounded-xl border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Bulk Import (JSON):</span>
              <input type="file" accept=".json" onChange={handleBulkUpload} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
            </div>
          </div>
          
          <details className="mb-6 bg-blue-50 border border-blue-100 rounded-xl p-4 cursor-pointer text-sm">
            <summary className="font-semibold text-blue-800 outline-none">View Expected JSON Format</summary>
            <pre className="mt-3 p-3 bg-white rounded-lg text-xs text-blue-900 overflow-x-auto whitespace-pre-wrap">
{`[
  {
    "title": "Milk 1L",
    "categoryId": "dairy",
    "costPrice": 40,
    "sellingPrice": 45,
    "stockQuantity": 50,
    "unit": "liter",
    "description": "Fresh dairy milk",
    "imageUrl": "https://example.com/milk.jpg"
  }
]`}
            </pre>
          </details>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Product Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="e.g. Organic Bananas" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Category</label>
              <select value={form.categoryId} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow bg-white">
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Selling Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as any })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow bg-white">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="pack">Pack</option>
                <option value="liter">Liter (L)</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Direct Image URL (CDN/Web Link)</label>
              <input required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Cost Price (₹)</label>
              <input type="number" step="0.01" min="0" required value={form.costPrice || ''} onChange={(e) => setForm({ ...form, costPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Selling Price (₹)</label>
              <input type="number" step="0.01" min="0" required value={form.sellingPrice || ''} onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Initial Stock</label>
              <input type="number" min="0" required value={form.stockQuantity || ''} onChange={(e) => setForm({ ...form, stockQuantity: parseInt(e.target.value, 10) || 0 })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="0" />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Product Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow" placeholder="Brief description of the item" />
            </div>
            <div className="md:col-span-3 mt-2">
              <button type="submit" disabled={createMutation.isPending} className="w-full rounded-xl bg-emerald-600 py-4 text-sm font-bold tracking-wide text-white shadow-md hover:bg-emerald-700 hover:shadow-lg focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {createMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Publishing Item...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Publish Product to Live Store
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Product Inventory Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Your Inventory Items ({products.length})</h2>
            {products.length > 0 && (
              <button 
                onClick={handleRemoveAll}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove All
              </button>
            )}
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500 flex justify-center items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading inventory...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="p-5 font-semibold">Item</th>
                    <th className="p-5 font-semibold">Category</th>
                    <th className="p-5 font-semibold text-right">Cost</th>
                    <th className="p-5 font-semibold text-right">Price</th>
                    <th className="p-5 font-semibold text-right">Stock</th>
                    <th className="p-5 font-semibold text-center">Status</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500 italic">No products in your inventory. Publish your first item above!</td>
                    </tr>
                  )}
                  {products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-5 flex items-center gap-4">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-100 shadow-sm"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                        />
                        <div>
                          <div className="font-bold text-gray-900">{item.title}</div>
                          {item.description && <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[12rem]">{item.description}</div>}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                          {item.categoryName || item.categoryId}
                        </span>
                      </td>
                      <td className="p-5 text-right font-medium text-gray-600">₹{item.costPrice.toFixed(2)}</td>
                      <td className="p-5 text-right font-bold text-gray-900">₹{item.sellingPrice.toFixed(2)}</td>
                      <td className="p-5 text-right font-medium text-gray-700">{item.stockQuantity} <span className="text-gray-400 text-xs font-normal">{item.unit}</span></td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.stockQuantity > 0 
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' 
                            : 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                        }`}>
                          {item.stockQuantity > 0 ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => { if (window.confirm('Are you sure you want to delete this product?')) deleteMutation.mutate(item.id); }}
                          className="text-red-600 hover:text-red-900 font-medium text-sm transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isBulkUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-emerald-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Importing Products</h3>
            <p className="text-sm text-gray-500 text-center">Please wait while we upload your items to the store...</p>
          </div>
        </div>
      )}
    </div>
  );
}
