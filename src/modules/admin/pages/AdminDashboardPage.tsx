import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { authApi } from "@global/services/api/authApi";
import { clearSession, setUserProfile } from "@global/store/authSlice";

import { useAdminData } from '../hooks/useAdminData';
import { AdminLayout } from '../components/AdminLayout';
import { AdminOverviewTab } from '../components/AdminOverviewTab';
import { AdminUsersTab } from '../components/AdminUsersTab';
import { AdminInventoryTab } from '../components/AdminInventoryTab';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    users, usersLoading, handleDeleteUser, platformStats, allProducts,
    retailers, customers, validProducts, orphanedProducts,
    totalCatalogValue, totalCatalogCost, potentialProfit
  } = useAdminData();

  // State
  const [activeTab, setActiveTab] = useState('overview');

  // Admin Create State
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Filters State
  const [companyFilter, setCompanyFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Catalog Grouping State
  const [expandedVendors, setExpandedVendors] = useState<Record<string, boolean>>({});
  const [visibleVendorsCount, setVisibleVendorsCount] = useState(5);

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      const newProfile = await authApi.registerUser(adminEmail, adminPassword, adminName, 'admin');
      dispatch(setUserProfile(newProfile));
      setAdminName(''); setAdminEmail(''); setAdminPassword('');
      alert(`Successfully created and logged in as ${adminName}.`);
    } catch (error: any) {
      alert(error.message || 'Failed to create admin.');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          (u.storeName || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter || (roleFilter === 'customer' && !u.role);
    return matchesSearch && matchesRole;
  });

  const filteredProducts = validProducts.filter((p: any) => 
    p.retailerStoreName?.toLowerCase().includes(companyFilter.toLowerCase()) ||
    p.title.toLowerCase().includes(companyFilter.toLowerCase())
  );

  // Group products by Vendor for the Catalog View
  const groupedProducts = filteredProducts.reduce((acc: any, p: any) => {
    const store = p.retailerStoreName || 'Unknown Vendor';
    if (!acc[store]) acc[store] = [];
    acc[store].push(p);
    return acc;
  }, {});

  const vendorNames = Object.keys(groupedProducts).sort();
  const visibleVendors = vendorNames.slice(0, visibleVendorsCount);

  const toggleVendor = (vendor: string) => {
    setExpandedVendors(prev => ({ ...prev, [vendor]: !prev[vendor] }));
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      handleLogout={handleLogout}
      adminName="Super User"
    >
      {(activeTab === 'overview' || activeTab === 'settings') && (
        <AdminOverviewTab 
          platformStats={platformStats} 
          retailers={retailers} 
          customers={customers} 
        />
      )}

      {(activeTab === 'users' || activeTab === 'retailers' || activeTab === 'overview') && (
        <AdminUsersTab 
          userSearch={userSearch} 
          setUserSearch={setUserSearch} 
          filteredUsers={filteredUsers} 
          handleDeleteUser={handleDeleteUser}
          
          adminName={adminName}
          setAdminName={setAdminName}
          adminEmail={adminEmail}
          setAdminEmail={setAdminEmail}
          adminPassword={adminPassword}
          setAdminPassword={setAdminPassword}
          showPassword={showPassword}
          isCreatingAdmin={isCreatingAdmin}
          handleCreateAdmin={handleCreateAdmin}
        />
      )}

      {(activeTab === 'inventory' || activeTab === 'overview') && (
        <>
          <AdminInventoryTab 
            companyFilter={companyFilter} 
            setCompanyFilter={setCompanyFilter}
            visibleVendors={visibleVendors}
            expandedVendors={expandedVendors}
            groupedProducts={groupedProducts}
            toggleVendor={toggleVendor}
          />
          {vendorNames.length > visibleVendorsCount && (
            <div className="p-4 text-center mt-4">
              <button 
                onClick={() => setVisibleVendorsCount(prev => prev + 5)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-sm"
              >
                Load More Retailers
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </AdminLayout>
  );
}
