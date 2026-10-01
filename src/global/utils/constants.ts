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

export interface DefaultCategory {
  id: string;
  name: string;
  description?: string;
  image?: string;
  slug?: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { id: 'fresh-fruits', name: 'Fresh Fruits', description: 'Fresh fruits and seasonal produce', image: '/fruits.webp', slug: 'fresh-fruits' },
  { id: 'fresh-vegetables', name: 'Fresh Vegetables', description: 'Farm-fresh vegetables and greens', image: '/vegetables.webp', slug: 'fresh-vegetables' },
  { id: 'dairy', name: 'Dairy', description: 'Milk, cheese, butter, and eggs', image: '/dairy.webp', slug: 'dairy' },
  { id: 'meat', name: 'Meat', description: 'Fresh chicken, meat, and poultry', image: 'https://cdn-icons-png.flaticon.com/512/1046/1046774.png', slug: 'meat' },
  { id: 'seafood', name: 'Seafood', description: 'Fresh seafood and fish', image: 'https://cdn-icons-png.flaticon.com/512/2347/2347311.png', slug: 'seafood' },
  { id: 'bread-biscuits', name: 'Bread and Biscuits', description: 'Breads, buns, and cookies', image: '/bread.webp', slug: 'bread-biscuits' },
  { id: 'beverages', name: 'Beverages', description: 'Juices, water, tea, and coffee', image: '/beverages.webp', slug: 'beverages' },
  { id: 'munchies', name: 'Munchies', description: 'Chips, crisps, and namkeen', image: '/munchies.webp', slug: 'munchies' },
  { id: 'packed-food', name: 'Packed Food', description: 'Packaged & instant food items', image: '/packaged.webp', slug: 'packed-food' },
  { id: 'chocolates', name: 'Chocolates', description: 'Chocolates, candies, and sweets', image: '/chocolates.webp', slug: 'chocolates' },
  { id: 'sweet-tooth', name: 'Sweet Tooth', description: 'Sweets, desserts, and traditional treats', image: '/sweet.webp', slug: 'sweet-tooth' },
  { id: 'frozen-food', name: 'Frozen Food', description: 'Ready-to-cook meals, frozen snacks & ice cream', image: '/deserts.webp', slug: 'frozen-food' },
  { id: 'breakfast-cereals', name: 'Breakfast & Cereals', description: 'Oats, muesli, flakes, and breakfast mixes', image: '/breakfast.webp', slug: 'breakfast-cereals' },
  { id: 'kitchen-essentials', name: 'Kitchen Essentials', description: 'Spices, oils, cookware & kitchen staples', image: '/kitchen.webp', slug: 'kitchen-essentials' },
  { id: 'cleaning-essentials', name: 'Cleaning Essentials', description: 'Detergents, floor cleaners & disinfectants', image: '/clean.webp', slug: 'cleaning-essentials' },
  { id: 'home-care', name: 'Home Care', description: 'Air fresheners, garbage bags & home essentials', image: '/decore.webp', slug: 'home-care' },
  { id: 'bath-body', name: 'Bath and Body', description: 'Soaps, body washes, shampoos & skin care', image: '/bathbody.jpg', slug: 'bath-body' },
  { id: 'pharmacy', name: 'Pharmacy', description: 'Over-the-counter medicine, wellness & hygiene', image: '/pharmacy.webp', slug: 'pharmacy' },
  { id: 'stationery', name: 'Stationery', description: 'Pens, notebooks, office and school supplies', image: '/stationary.webp', slug: 'stationery' },
  { id: 'pet-supplies', name: 'Pet Supplies', description: 'Food and accessories for dogs, cats and pets', image: '/pet_food.webp', slug: 'pet-supplies' },
  { id: 'beauty', name: 'Beauty', description: 'Cosmetics, skincare & makeup essentials', image: 'https://cdn-icons-png.flaticon.com/512/3120/3120531.png', slug: 'beauty' },
  { id: 'fragrances', name: 'Fragrances', description: 'Perfumes, body mists & deodorants', image: 'https://cdn-icons-png.flaticon.com/512/3120/3120616.png', slug: 'fragrances' },
  { id: 'mens-clothing', name: "Men's Clothing", description: 'Apparel and daily wear for men', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050229.png', slug: 'mens-clothing' },
  { id: 'womens-clothing', name: "Women's Clothing", description: 'Apparel and daily wear for women', image: 'https://cdn-icons-png.flaticon.com/512/3050/3050244.png', slug: 'womens-clothing' },
  { id: 'electronics', name: 'Electronics', description: 'Electronics & Gadgets', image: 'https://cdn-icons-png.flaticon.com/512/2777/2777142.png', slug: 'electronics' },
  { id: 'jewelery', name: 'Jewelery', description: 'Jewelry & Accessories', image: 'https://cdn-icons-png.flaticon.com/512/3081/3081648.png', slug: 'jewelery' },
  { id: 'furniture', name: 'Furniture', description: 'Home Furniture', image: 'https://cdn-icons-png.flaticon.com/512/2635/2635445.png', slug: 'furniture' }
];
