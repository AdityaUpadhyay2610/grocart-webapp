export type UserRole = 'admin' | 'retailer' | 'customer';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  storeName?: string;
  phoneNumber?: string;
  address?: string;
  createdAt: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface ProductItem {
  id: string;
  retailerId: string;
  retailerStoreName: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;       // Base acquisition cost
  sellingPrice: number;    // Public catalog price
  stockQuantity: number;   // Unit inventory
  unit: 'kg' | 'pcs' | 'pack' | 'liter';
  imageUrl: string;        // External CDN/Image URL
  status: 'active' | 'out_of_stock' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  retailerId: string;
  title: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  items: Record<string, OrderItem>;
  totalAmount: number;
  status: 'placed' | 'processing' | 'delivered' | 'cancelled';
  createdAt: number;
}

export interface RetailerAnalytics {
  retailerId: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalOrdersFulfilled: number;
  lastUpdated: number;
}

export interface PlatformAnalytics {
  totalGMV: number;
  totalPlatformProfit: number;
  totalRetailers: number;
  totalOrders: number;
}
