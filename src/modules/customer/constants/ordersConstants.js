export const TOTAL_ORDER_SECONDS = 15 * 60;

export const DEMO_ORDER = {
  id: "GC-89421",
  timestamp: Date.now() - 3600000,
  status: "delivered",
  deliveryAddress: "742 Evergreen Terrace, Sector 45, Gurugram 122003",
  paymentMethod: "Cash on Delivery (COD)",
  items: [
    { id: "demo-1", itemName: "Organic Gala Apples", itemQuantity: "1 kg", itemPrice: 180, quantity: 2, imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80" },
    { id: "demo-2", itemName: "Farm Fresh Whole Milk", itemQuantity: "1 L", itemPrice: 75, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
    { id: "demo-3", itemName: "Artisan Sourdough Loaf", itemQuantity: "400g", itemPrice: 120, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80" }
  ],
  couponDiscount: 35,
  deliveryFee: 0,
  handlingCharge: 15
};

