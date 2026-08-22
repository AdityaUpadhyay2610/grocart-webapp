import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { Check, Copy } from 'lucide-react';

import { clearSession } from '@global/store/authSlice';
import { ProductItem } from '@global/models';

import { useRetailerOperations } from '../hooks/useRetailerOperations';
import { RetailerLayout } from '../components/RetailerLayout';
import { RetailerAnalyticsTab } from '../components/RetailerAnalyticsTab';
import { RetailerOrdersTab } from '../components/RetailerOrdersTab';
import { RetailerInventoryTab } from '../components/RetailerInventoryTab';

const CATEGORIES = [
  { id: 'dairy', name: 'Dairy & Milk' },
  { id: 'vegetables', name: 'Fresh Vegetables' },
  { id: 'fruits', name: 'Fresh Fruits' },
  { id: 'snacks', name: 'Snacks & Munchies' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'staples', name: 'Daily Staples' }
];

export default function RetailerOperationsPage() {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    products, isLoadingProducts, stats, orders, isLoadingOrders,
    createMutation, deleteMutation
  } = useRetailerOperations(user);

  // Layout State
  const [activeTab, setActiveTab] = useState('all');
  const [isCopied, setIsCopied] = useState(false);
  
  // Analytics State
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('week');

  // Orders State
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [showAllOrders, setShowAllOrders] = useState(false);

  // Inventory State
  const [isInventoryExpanded, setIsInventoryExpanded] = useState(true);
  const [isPublishExpanded, setIsPublishExpanded] = useState(false);
  const [showJsonFormat, setShowJsonFormat] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [showAllInventory, setShowAllInventory] = useState(false);
  
  // Publish form state
  const [form, setForm] = useState<Partial<ProductItem>>({
    title: '', categoryId: CATEGORIES[0].id, categoryName: CATEGORIES[0].name,
    unit: 'pcs', imageUrl: '', costPrice: 0, sellingPrice: 0, stockQuantity: 0, description: ''
  });
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleLogout = () => {
    dispatch(clearSession());
    navigate('/login');
  };

  const copyVendorId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCategoryChange = (id: string) => {
    const cat = CATEGORIES.find(c => String(c.id) === id);
    if (cat) setForm({ ...form, categoryId: id, categoryName: cat.name });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newProd: ProductItem = {
      id: `prod_${Date.now()}`,
      retailerId: user.uid,
      retailerStoreName: user.storeName || user.name,
      title: form.title!,
      categoryId: String(form.categoryId),
      categoryName: form.categoryName!,
      unit: form.unit || 'pcs',
      imageUrl: form.imageUrl || '',
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      description: form.description || '',
      status: (Number(form.stockQuantity) || 0) > 0 ? 'active' : 'out_of_stock',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    createMutation.mutate(newProd, {
      onSuccess: () => {
        setForm({
          title: '', categoryId: CATEGORIES[0].id, categoryName: CATEGORIES[0].name,
          unit: 'pcs', imageUrl: '', costPrice: 0, sellingPrice: 0, stockQuantity: 0, description: ''
        });
      }
    });
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
        e.target.value = '';
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
      products.forEach(p => deleteMutation.mutate(p.id));
    }
  };

  return (
    <RetailerLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      handleLogout={handleLogout} 
      storeName={user?.storeName || user?.name || 'Retailer'}
    >
      <div className="flex items-center gap-3 mb-6 bg-blue-50 p-3 rounded-xl border border-blue-100 hidden md:flex w-max shadow-sm">
        <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow-inner">
          {user?.storeName?.charAt(0) || user?.name?.charAt(0) || 'S'}
        </div>
        <div>
          <div className="text-sm font-black text-slate-800 leading-tight">{user?.name}</div>
          <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
            Vendor ID: {user?.uid}
            <button onClick={copyVendorId} className="hover:text-blue-600 ml-1 bg-white p-1 rounded border border-slate-200">
              {isCopied ? <Check size={10} className="text-emerald-500"/> : <Copy size={10}/>}
            </button>
          </div>
        </div>
      </div>

      {(activeTab === 'all' || activeTab === 'dashboard' || activeTab === 'analytics') && (
        <RetailerAnalyticsTab 
          stats={stats} 
          timeFilter={timeFilter} 
          setTimeFilter={setTimeFilter} 
        />
      )}

      {(activeTab === 'all' || activeTab === 'dashboard' || activeTab === 'orders') && (
        <RetailerOrdersTab 
          user={user}
          orders={orders}
          isLoadingOrders={isLoadingOrders}
          timeFilter={timeFilter}
          isOrdersExpanded={isOrdersExpanded}
          setIsOrdersExpanded={setIsOrdersExpanded}
          showAllOrders={showAllOrders}
          setShowAllOrders={setShowAllOrders}
        />
      )}

      {(activeTab === 'all' || activeTab === 'inventory') && (
        <RetailerInventoryTab 
          products={products}
          isLoading={isLoadingProducts}
          inventorySearch={inventorySearch}
          setInventorySearch={setInventorySearch}
          isPublishExpanded={isPublishExpanded}
          setIsPublishExpanded={setIsPublishExpanded}
          isInventoryExpanded={isInventoryExpanded}
          setIsInventoryExpanded={setIsInventoryExpanded}
          showAllInventory={showAllInventory}
          setShowAllInventory={setShowAllInventory}
          showJsonFormat={showJsonFormat}
          setShowJsonFormat={setShowJsonFormat}
          handleBulkUpload={handleBulkUpload}
          handleCreate={handleCreate}
          handleRemoveAll={handleRemoveAll}
          deleteMutation={deleteMutation}
          createMutation={createMutation}
          form={form}
          setForm={setForm}
          handleCategoryChange={handleCategoryChange}
          CATEGORIES={CATEGORIES}
        />
      )}
    </RetailerLayout>
  );
}
