export const USER_ROLES = {
  ADMIN: 'admin',
  RETAILER: 'retailer',
  CUSTOMER: 'customer',
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  OUT_OF_STOCK: 'out_of_stock',
  INACTIVE: 'inactive',
} as const;

export const PRODUCT_UNITS = ['kg', 'pcs', 'pack', 'liter'] as const;
