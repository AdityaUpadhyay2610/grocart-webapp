import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { adminApi, storefrontApi, retailerApi } from '../../infrastructure/api/appApis';
import { authApi } from '../../infrastructure/api/authApi';
import { clearSession, setUserProfile } from '../../application/store/authSlice';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f59e0b']; // emerald, indigo, amber

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Create Admin Form State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminCreateError, setAdminCreateError] = useState('');
  const [adminCreateSuccess, setAdminCreateSuccess] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: adminApi.fetchAllUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role?: string }) => adminApi.deleteUser(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
    }
  });

  const handleDeleteUser = (userId: string, role?: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user and their data?')) {
      deleteUserMutation.mutate({ userId, role });
    }
  };

  const { data: platformStats } = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: adminApi.fetchPlatformAnalytics,
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: storefrontApi.fetchAllProducts,
  });

  const retailers = users.filter((u) => u.role === 'retailer');
  const customers = users.filter((u) => u.role === 'customer');
  const admins = users.filter((u) => u.role === 'admin');

  // Filter orphaned products
  const validUserIds = new Set(users.map(u => u.uid));
  const validProducts = allProducts.filter(p => validUserIds.has(p.retailerId));
  const orphanedProducts = allProducts.filter(p => !validUserIds.has(p.retailerId));

  const totalCatalogValue = validProducts.reduce((sum, p) => sum + (p.sellingPrice * p.stockQuantity), 0);
  const totalCatalogCost = validProducts.reduce((sum, p) => sum + (p.costPrice * p.stockQuantity), 0);
  const potentialProfit = totalCatalogValue - totalCatalogCost;

  const handleCleanOrphanedData = async () => {
    if (window.confirm(`Are you sure you want to permanently delete ${orphanedProducts.length} orphaned products?`)) {
      try {
        await Promise.all(orphanedProducts.map(p => retailerApi.deleteProduct(p.id)));
        queryClient.invalidateQueries({ queryKey: ['admin-all-products'] });
        alert('Orphaned products successfully cleared.');
      } catch (e) {
        console.error(e);
        alert('Failed to clear some orphaned products.');
      }
    }
  };

  const roleData = [
    { name: 'Customers', value: customers.length },
    { name: 'Retailers', value: retailers.length },
    { name: 'Admins', value: admins.length },
  ].filter(d => d.value > 0);

  // Group products by retailer for BarChart
  const productsByRetailer = validProducts.reduce((acc, p) => {
    const store = p.retailerStoreName || 'Unknown';
    acc[store] = (acc[store] || 0) + p.stockQuantity;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(productsByRetailer).map(([name, stock]) => ({
    name,
    stock,
  }));

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    setAdminCreateError('');
    setAdminCreateSuccess('');

    try {
      const newProfile = await authApi.registerUser(adminEmail, adminPassword, adminName, 'admin');
      // Because Firebase Client SDK automatically logs in the newly created user,
      // we update our Redux store to reflect the new admin's session.
      dispatch(setUserProfile(newProfile));
      
      setAdminCreateSuccess(`Successfully created and logged in as ${adminName}.`);
      setAdminName('');
      setAdminEmail('');
      setAdminPassword('');
      queryClient.invalidateQueries({ queryKey: ['admin-all-users'] });
    } catch (error: any) {
      setAdminCreateError(error.message || 'Failed to create admin.');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Control Center</h1>
            <p className="mt-1 text-sm text-gray-500">Platform-wide GMV, Retailer Oversight, Product Sales & Analytics</p>
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

        {/* Global Platform Metrics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Total GMV</span>
            <p className="mt-2 text-4xl font-black text-gray-900">₹{platformStats?.totalGMV?.toFixed(2) || totalCatalogValue.toFixed(2)}</p>
            <div className="mt-2 flex items-center text-sm text-emerald-600 font-medium">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Projected Value
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-md text-white">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-100">Platform Profit Margin</span>
            <p className="mt-2 text-4xl font-black">₹{platformStats?.totalPlatformProfit?.toFixed(2) || potentialProfit.toFixed(2)}</p>
            <div className="mt-2 text-sm text-emerald-100 font-medium">Expected Return</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Active Retailers</span>
            <p className="mt-2 text-4xl font-black text-indigo-600">{retailers.length}</p>
            <div className="mt-2 text-sm text-gray-400 font-medium">Registered Sellers</div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md">
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-500">Registered Customers</span>
            <p className="mt-2 text-4xl font-black text-amber-500">{customers.length}</p>
            <div className="mt-2 text-sm text-gray-400 font-medium">Total Shoppers</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">User Distribution</h2>
            <div className="h-72">
              {roleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No user data available (Check Firebase Rules)</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Inventory by Retailer</h2>
            <div className="h-72">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="stock" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">No inventory data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Add New Admin Section */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add New Administrator</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new admin account. Note: Creating a new admin will automatically sign you in as the newly created user.</p>
          </div>
          
          {adminCreateError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{adminCreateError}</div>
          )}
          {adminCreateSuccess && (
            <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-600 border border-emerald-100">{adminCreateSuccess}</div>
          )}

          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Admin Name</label>
              <input required value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-shadow" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-shadow" placeholder="admin@domain.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <input required type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-shadow" placeholder="••••••••" />
            </div>
            <div>
              <button type="submit" disabled={isCreatingAdmin} className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold tracking-wide text-white shadow-md hover:bg-amber-600 hover:shadow-lg focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                {isCreatingAdmin ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>

        {/* User Management Directory */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">Platform Users Directory ({users.length})</h2>
          </div>
          {usersLoading ? (
            <div className="p-8 text-center text-sm text-gray-500 flex justify-center items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading user records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="p-5 font-semibold">User Name</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold">Role</th>
                    <th className="p-5 font-semibold text-right">Company Name</th>
                    <th className="p-5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length === 0 && (
                     <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500 italic">No users found. If you expect users here, check your Firebase Security Rules. Admin must have read access on the root '/users' node.</td>
                     </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-gray-900">{u.name}</div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-600/20">
                          Active
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          u.role === 'admin' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' :
                          u.role === 'retailer' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                        }`}>
                          {u.role ? u.role.toUpperCase() : 'CUSTOMER'}
                        </span>
                      </td>
                      <td className="p-5 text-right font-medium text-gray-600">
                        {u.role === 'retailer' ? (u.storeName || '—') : '—'}
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.uid, u.role)}
                          disabled={deleteUserMutation.isPending}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Global Multi-Vendor Products Oversight */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 mt-8">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-800">Multi-Vendor Products Catalog ({validProducts.length})</h2>
              {orphanedProducts.length > 0 && (
                <button
                  onClick={handleCleanOrphanedData}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-200"
                >
                  Clear {orphanedProducts.length} Orphaned Items
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Filter by Company Name..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>
          {productsLoading ? (
            <div className="p-8 text-center text-sm text-gray-500 flex justify-center items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Loading catalog items...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-white text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="p-5 font-semibold">Product Title</th>
                    <th className="p-5 font-semibold">Retailer Store</th>
                    <th className="p-5 font-semibold text-right">Cost Price</th>
                    <th className="p-5 font-semibold text-right">Selling Price</th>
                    <th className="p-5 font-semibold text-right">Margin</th>
                    <th className="p-5 font-semibold text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {validProducts.filter(p => p.retailerStoreName?.toLowerCase().includes(companyFilter.toLowerCase())).map((p) => {
                    const margin = p.sellingPrice - p.costPrice;
                    const marginPercent = p.costPrice > 0 ? (margin / p.costPrice) * 100 : 100;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-5 flex items-center gap-4">
                          <img
                            src={p.imageUrl}
                            alt={p.title}
                            className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-100 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'; }}
                          />
                          <div>
                            <div className="font-bold text-gray-900">{p.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{p.categoryName || p.categoryId}</div>
                          </div>
                        </td>
                        <td className="p-5 font-medium text-indigo-600">{p.retailerStoreName}</td>
                        <td className="p-5 text-right font-medium text-gray-600">₹{p.costPrice.toFixed(2)}</td>
                        <td className="p-5 text-right font-bold text-gray-900">₹{p.sellingPrice.toFixed(2)}</td>
                        <td className="p-5 text-right">
                          <div className={`inline-flex flex-col items-end`}>
                            <span className={`font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {margin >= 0 ? '+' : ''}₹{margin.toFixed(2)}
                            </span>
                            <span className="text-[10px] font-semibold text-gray-400">{marginPercent.toFixed(0)}% ROI</span>
                          </div>
                        </td>
                        <td className="p-5 text-right font-medium text-gray-700">
                          {p.stockQuantity} <span className="text-gray-400 text-xs font-normal">{p.unit}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
