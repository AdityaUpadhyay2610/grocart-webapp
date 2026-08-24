import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, storefrontApi } from '@global/services/api/appApis';
import { useSelector } from 'react-redux';

export const useAdminData = () => {
  const queryClient = useQueryClient();
  const user = useSelector((state: any) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: adminApi.fetchAllUsers,
    enabled: isAdmin,
    retry: false
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
    enabled: isAdmin,
    retry: false
  });

  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['admin-all-products'],
    queryFn: storefrontApi.fetchAllProducts,
  });

  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: adminApi.fetchAllOrders,
    enabled: isAdmin,
    retry: false
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-all-categories'],
    queryFn: storefrontApi.fetchCategories,
  });

  const createCategoryMutation = useMutation({
    mutationFn: adminApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-categories'] });
    }
  });

  // Derived Data
  const retailers = users.filter((u: any) => u.role === 'retailer');
  const customers = users.filter((u: any) => u.role === 'customer' || !u.role);
  
  const validUserIds = new Set(users.map((u: any) => u.uid));
  const validProducts = allProducts.filter((p: any) => validUserIds.has(p.retailerId));
  const orphanedProducts = allProducts.filter((p: any) => !validUserIds.has(p.retailerId));

  const totalCatalogValue = validProducts.reduce((sum: number, p: any) => sum + (p.sellingPrice * p.stockQuantity), 0);
  const totalCatalogCost = validProducts.reduce((sum: number, p: any) => sum + (p.costPrice * p.stockQuantity), 0);
  const potentialProfit = totalCatalogValue - totalCatalogCost;

  return {
    users,
    usersLoading,
    deleteUserMutation,
    handleDeleteUser,
    platformStats,
    allProducts,
    productsLoading,
    categories,
    categoriesLoading,
    createCategoryMutation,
    retailers,
    customers,
    validProducts,
    orphanedProducts,
    totalCatalogValue,
    totalCatalogCost,
    potentialProfit,
    allOrders,
    ordersLoading
  };
};
