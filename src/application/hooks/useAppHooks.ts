import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, addToCart, removeFromCart, clearCart, setUserProfile, clearSession } from '../store';
import { storefrontApi, retailerApi, adminApi } from '../../infrastructure/api/appApis';
import { authApi } from '../../infrastructure/api/authApi';
import { ProductItem, UserRole } from '../../domain/models';

export const useStorefront = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.cart);

  const productsQuery = useQuery({
    queryKey: ['storefront-products'],
    queryFn: storefrontApi.fetchAllProducts,
  });

  const categoriesQuery = useQuery({
    queryKey: ['storefront-categories'],
    queryFn: storefrontApi.fetchCategories,
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    categories: categoriesQuery.data || [],
    cartItems: cart.items,
    addToCart: (product: ProductItem) => dispatch(addToCart(product)),
    removeFromCart: (productId: string) => dispatch(removeFromCart(productId)),
    clearCart: () => dispatch(clearCart()),
  };
};

export const useRetailer = (retailerId?: string) => {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ['retailer-products', retailerId],
    queryFn: () => (retailerId ? retailerApi.fetchInventory(retailerId) : Promise.resolve([])),
    enabled: !!retailerId,
  });

  const analyticsQuery = useQuery({
    queryKey: ['retailer-stats', retailerId],
    queryFn: () => (retailerId ? retailerApi.fetchAnalytics(retailerId) : Promise.resolve(null)),
    enabled: !!retailerId,
  });

  const saveProductMutation = useMutation({
    mutationFn: (newProduct: ProductItem) => retailerApi.saveProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retailer-products', retailerId] });
      queryClient.invalidateQueries({ queryKey: ['retailer-stats', retailerId] });
    },
  });

  return {
    inventory: inventoryQuery.data || [],
    isInventoryLoading: inventoryQuery.isLoading,
    analytics: analyticsQuery.data || null,
    saveProduct: saveProductMutation.mutate,
    isSavingProduct: saveProductMutation.isPending,
  };
};

export const useAdmin = () => {
  const usersQuery = useQuery({
    queryKey: ['admin-all-users'],
    queryFn: adminApi.fetchAllUsers,
  });

  const platformStatsQuery = useQuery({
    queryKey: ['admin-platform-stats'],
    queryFn: adminApi.fetchPlatformAnalytics,
  });

  return {
    users: usersQuery.data || [],
    isUsersLoading: usersQuery.isLoading,
    platformStats: platformStatsQuery.data || null,
  };
};

export const useAuthSession = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  return {
    ...authState,
    setUserProfile: (profile: any) => dispatch(setUserProfile(profile)),
    logout: async () => {
      await authApi.logoutUser();
      dispatch(clearSession());
    },
  };
};
