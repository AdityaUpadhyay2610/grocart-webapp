import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { storefrontApi } from '@global/services/api/appApis';
import { addToCart, RootState } from '@global/store';
import { Link } from 'react-router';

const CATEGORY_FILTERS = [
  { id: 'all', name: 'All Categories' },
  { id: 'produce', name: 'Fresh Produce' },
  { id: 'dairy', name: 'Dairy & Eggs' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'bakery', name: 'Bakery & Bread' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'meat', name: 'Meat & Seafood' },
];

export default function StorefrontHome() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['storefront-products'],
    queryFn: storefrontApi.fetchAllProducts,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const cartTotalCount = Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.retailerStoreName && p.retailerStoreName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-emerald-600">Grocart</span>
          </div>

          <div className="w-full max-w-md">
            <input
              type="text"
              placeholder="Search groceries, brands, stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Cart Badge */}
            <div className="relative flex items-center justify-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              🛒 Cart ({cartTotalCount})
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Hello, {user.name}</span>
                {user.role === 'retailer' && (
                  <Link to="/retailer/dashboard" className="text-xs font-semibold text-emerald-600 hover:underline">
                    Vendor Portal
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-xs font-semibold text-purple-600 hover:underline">
                    Admin Portal
                  </Link>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Category Pills Filter */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <main className="mx-auto max-w-7xl p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Available Products ({filteredProducts.length})</h2>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-gray-500">Loading catalog items...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-500">No active products match your search/filter criteria.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md flex flex-col justify-between">
                <div>
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-44 w-full object-cover bg-gray-50"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'; }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-600 font-bold tracking-wide uppercase">{p.retailerStoreName || 'Grocart Merchant'}</span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{p.unit}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">{p.title}</h3>
                    {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-50 mt-2">
                  <div>
                    <span className="text-lg font-extrabold text-gray-900">${p.sellingPrice.toFixed(2)}</span>
                    <span className="text-xs text-gray-400"> /{p.unit}</span>
                  </div>
                  <button
                    onClick={() => dispatch(addToCart(p))}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm cursor-pointer"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
