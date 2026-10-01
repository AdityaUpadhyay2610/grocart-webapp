import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

import { clearSession } from '@global/store/authSlice';
import { authApi } from '@global/services/api/authApi';
import { ProductItem, ProductCategory } from '@global/models';
import { DEFAULT_CATEGORIES } from '@global/utils/constants';
import * as XLSX from 'xlsx';
import { storefrontApi } from '@global/services/api/appApis';

import { useRetailerOperations } from '../hooks/useRetailerOperations';
import { RetailerLayout } from '../components/RetailerLayout';
import { RetailerOverviewTab } from '../components/RetailerOverviewTab';
import { RetailerAnalyticsTab } from '../components/RetailerAnalyticsTab';
import { RetailerOrdersTab } from '../components/RetailerOrdersTab';
import { RetailerInventoryTab } from '../components/RetailerInventoryTab';
import { RetailerSettingsTab } from '../components/RetailerSettingsTab';
import { EditProductModal } from '../components/EditProductModal';
import { useToast } from '@global/context/ToastContext';



export default function RetailerOperationsPage() {
  const user = useSelector((state: any) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    products, isLoadingProducts, stats, orders, isLoadingOrders,
    createMutation, deleteMutation
  } = useRetailerOperations(user);

  // Layout State
  const [activeTab, setActiveTab] = useState('all');

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
  
  const [categories, setCategories] = React.useState<ProductCategory[]>(DEFAULT_CATEGORIES as ProductCategory[]);
  const prevCategoriesRef = React.useRef<ProductCategory[] | null>(null);

  React.useEffect(() => {
    const unsubscribe = storefrontApi.subscribeToCategories((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        
        if (prevCategoriesRef.current !== null) {
          // Find which categories are new
          const newCats = data.filter(d => !prevCategoriesRef.current!.find(p => p.id === d.id));
          if (newCats.length > 0) {
            const names = newCats.map(c => c.name).join(', ');
            showToast(`Admin added new categories: ${names}`, "success");
          }
        }
        prevCategoriesRef.current = data;
      }
    });
    return () => unsubscribe();
  }, [showToast]);

  // Publish form state
  const defaultForm = {
    id: undefined,
    createdAt: undefined,
    title: '',
    categoryId: (categories.length > 0 ? categories[0].id : DEFAULT_CATEGORIES[0].id),
    categoryName: (categories.length > 0 ? categories[0].name : DEFAULT_CATEGORIES[0].name),
    unit: 'pcs' as 'pcs' | 'kg' | 'pack' | 'liter',
    imageUrl: '',
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    description: ''
  };
  const [forms, setForms] = useState<Partial<ProductItem>[]>([{ ...defaultForm }]);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [progress, setProgress] = useState<{ type: 'import' | 'delete' | null, current: number, total: number }>({ type: null, current: 0, total: 0 });
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logoutUser(); // Clear backend refresh token cookie
    } catch (e) {
      console.warn('Logout API error (continuing):', e);
    }
    dispatch(clearSession());
    navigate('/login');
  };


  const handleCategoryChange = (index: number, id: string) => {
    const cat = categories.find(c => String(c.id) === id);
    if (cat) {
      const newForms = [...forms];
      newForms[index] = { ...newForms[index], categoryId: id, categoryName: cat.name };
      setForms(newForms);
    }
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e: React.FormEvent, updatedData: Partial<ProductItem>) => {
    e.preventDefault();
    if (!user || !editingProduct) return;
    
    const updatedProd: ProductItem = {
      ...editingProduct,
      ...updatedData,
      imageUrl: updatedData.imageUrl || '',
      status: (Number(updatedData.stockQuantity) || 0) > 0 ? 'active' : 'out_of_stock',
      updatedAt: Date.now(),
    };
    
    await createMutation.mutateAsync(updatedProd);
    setEditingProduct(null);
    showToast("Product updated successfully", "success");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const newProd: ProductItem = {
        id: `prod_${Date.now()}_${i}`,
        retailerId: user.uid,
        retailerStoreName: user.storeName || user.name,
        title: form.title!,
        categoryId: String(form.categoryId),
        categoryName: form.categoryName!,
        unit: (form.unit || 'pcs') as 'kg' | 'pcs' | 'pack' | 'liter',
        imageUrl: form.imageUrl || '',
        costPrice: Number(form.costPrice) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        stockQuantity: Number(form.stockQuantity) || 0,
        description: form.description || '',
        status: (Number(form.stockQuantity) || 0) > 0 ? 'active' : 'out_of_stock',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createMutation.mutateAsync(newProd);
    }
    setForms([{ ...defaultForm }]);
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        'Title': 'Organic Whole Milk 1L',
        'Category ID': categories[0]?.id || 'dairy',
        'Cost Price': 40,
        'Selling Price': 45,
        'Stock': 50,
        'Unit': 'liter',
        'Unit Size': 1,
        'Image URL': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
        'Description': 'Farm fresh organic whole milk'
      },
      {
        'Title': 'Fresh Cavendish Bananas 1kg',
        'Category ID': categories[1]?.id || categories[0]?.id || 'fruits',
        'Cost Price': 30,
        'Selling Price': 40,
        'Stock': 80,
        'Unit': 'kg',
        'Unit Size': 1,
        'Image URL': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
        'Description': 'Sweet and ripe premium bananas'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'GroCart_Product_Template.xlsx');
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        
        if (!Array.isArray(json) || json.length === 0) {
          throw new Error("The uploaded Excel file does not contain any product rows.");
        }

        const findField = (row: any, ...keys: string[]) => {
          const normalizedRow: Record<string, any> = {};
          for (const k of Object.keys(row)) {
            normalizedRow[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = row[k];
          }
          for (const key of keys) {
            const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanKey in normalizedRow && normalizedRow[cleanKey] !== undefined && normalizedRow[cleanKey] !== null && String(normalizedRow[cleanKey]).trim() !== '') {
              return normalizedRow[cleanKey];
            }
          }
          return undefined;
        };

        const parseNumber = (val: any, fallback = 0): number => {
          if (val === undefined || val === null || val === '') return fallback;
          if (typeof val === 'number') return isNaN(val) ? fallback : val;
          const cleaned = String(val).replace(/[^0-9.-]/g, '');
          const num = Number(cleaned);
          return isNaN(num) ? fallback : num;
        };

        const ALLOWED_UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'liter', 'dozen', 'pack', 'bunch', 'bottle', 'box', 'bag'];

        setIsBulkUploading(true);
        setProgress({ type: 'import', current: 0, total: json.length });
        
        for (let i = 0; i < json.length; i++) {
          const item = json[i];
          const rawTitle = findField(item, 'title', 'producttitle', 'productname', 'name', 'itemname', 'item');
          const title = String(rawTitle || '').trim();
          if (!title) {
            throw new Error(`Row ${i + 1} is missing a Product Title.`);
          }

          const rawCat = String(findField(item, 'categoryid', 'category', 'categoryname') || '').trim();
          const matchedCategory = categories.find(c => 
            String(c.id).toLowerCase() === rawCat.toLowerCase() || 
            c.name.toLowerCase() === rawCat.toLowerCase()
          ) || categories[0];
          const categoryId = matchedCategory ? String(matchedCategory.id) : (rawCat || 'general');
          const categoryName = matchedCategory ? matchedCategory.name : (rawCat || 'General');

          const costPrice = Math.max(0, parseNumber(findField(item, 'costprice', 'cost', 'buyingprice'), 0));
          const sellingPrice = Math.max(0, parseNumber(findField(item, 'sellingprice', 'price', 'mrp'), costPrice));
          const stockQuantity = Math.max(0, Math.floor(parseNumber(findField(item, 'stock', 'stockquantity', 'quantity', 'qty'), 0)));
          
          const rawUnit = String(findField(item, 'unit', 'uom') || 'pcs').toLowerCase().trim();
          const unit = ALLOWED_UNITS.includes(rawUnit) ? rawUnit : 'pcs';
          const unitSize = parseNumber(findField(item, 'unitsize', 'size'), 1);
          const imageUrl = String(findField(item, 'imageurl', 'image', 'photo', 'picture') || '').trim();
          const description = String(findField(item, 'description', 'desc', 'details') || '').trim();

          const newProd: ProductItem = {
            id: `prod_${Date.now()}_${i}`,
            retailerId: user.uid,
            retailerStoreName: user.storeName || user.name,
            title,
            categoryId,
            categoryName,
            unit: unit as any,
            unitSize,
            imageUrl,
            costPrice,
            sellingPrice,
            stockQuantity,
            description,
            status: stockQuantity > 0 ? 'active' : 'out_of_stock',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await createMutation.mutateAsync(newProd);
          setProgress({ type: 'import', current: i + 1, total: json.length });
        }
        setIsBulkUploading(false);
        setTimeout(() => setProgress({ type: null, current: 0, total: 0 }), 500);
        showToast(`Successfully imported ${json.length} product${json.length > 1 ? 's' : ''}!`, "success");
        e.target.value = '';
      } catch (err: any) {
        setIsBulkUploading(false);
        setProgress({ type: null, current: 0, total: 0 });
        const errorMsg = err?.response?.data?.message || err?.message || "Failed to parse Excel file. Ensure it matches the expected structure.";
        showToast(errorMsg, "error");
        console.error("Bulk upload error:", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleRemoveAll = () => {
    if (window.confirm('Are you sure you want to remove ALL your items? This cannot be undone.')) {
      const deleteProcess = async () => {
        setProgress({ type: 'delete', current: 0, total: products.length });
        for (let i = 0; i < products.length; i++) {
          await deleteMutation.mutateAsync(products[i].id);
          setProgress({ type: 'delete', current: i + 1, total: products.length });
        }
        setTimeout(() => setProgress({ type: null, current: 0, total: 0 }), 500);
      };
      deleteProcess();
    }
  };

  return (
    <RetailerLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      handleLogout={handleLogout} 
      storeName={user?.storeName || user?.name || 'Retailer'}
    >
      {progress.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">
              {progress.type === 'import' ? 'Importing Products...' : 'Deleting Inventory...'}
            </h3>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6">
              Please wait while we process your request.
            </p>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${progress.type === 'import' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>{Math.round((progress.current / progress.total) * 100)}%</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'all' || activeTab === 'dashboard') && (
        <RetailerOverviewTab 
          stats={stats}
          user={user}
          products={products}
          orders={orders}
        />
      )}

      {activeTab === 'analytics' && (
        <RetailerAnalyticsTab 
          stats={stats} 
          timeFilter={timeFilter} 
          setTimeFilter={setTimeFilter} 
          products={products}
          orders={orders}
        />
      )}

      {activeTab === 'orders' && (
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

      {activeTab === 'inventory' && (
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
          forms={forms}
          setForms={setForms}
          handleCategoryChange={handleCategoryChange}
          CATEGORIES={categories}
          handleEditProduct={handleEditProduct}
          handleDownloadTemplate={handleDownloadTemplate}
        />
      )}

      {activeTab === 'settings' && (
        <RetailerSettingsTab user={user} />
      )}

      {editingProduct && (
        <EditProductModal 
          product={editingProduct} 
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
          isSaving={createMutation.isPending}
        />
      )}
    </RetailerLayout>
  );
}
