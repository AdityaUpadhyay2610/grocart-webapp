export const COUPON_OFFERS = [
  { code: 'SAVE10', description: '10% off on orders above ₹200', discountPercent: 10, minOrder: 200 },
  { code: 'FRESH20', description: '20% off on orders above ₹500', discountPercent: 20, minOrder: 500 },
  { code: 'GROCART5', description: 'Flat 5% off on all orders', discountPercent: 5, minOrder: 0 },
  { code: 'FIRST50', description: '50% off — Max ₹100 (New User)', discountPercent: 50, minOrder: 100 },
  { code: 'FESTIVE15', description: 'Festive 15% off above ₹300', discountPercent: 15, minOrder: 300 }
];

export const calculateItemTotal = (cartItems) => {
  return cartItems.reduce((sum, item) => {
    const discountedPrice = Math.floor(item.itemPrice * 75 / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);
};

export const calculateHandlingCharge = (itemTotal) => {
  return Math.floor(itemTotal * 0.01);
};

export const getDeliveryFee = () => {
  return 30; // Hardcoded flat delivery fee
};

export const calculateCouponDiscount = (coupon, itemTotal) => {
  if (!coupon) return 0;
  if (itemTotal < coupon.minOrder) return 0;
  
  let discount = Math.floor((itemTotal * coupon.discountPercent) / 100);
  
  // Custom rule for FIRST50: Max ₹100
  if (coupon.code === 'FIRST50' && discount > 100) {
    discount = 100;
  }
  
  return discount;
};

export const calculateGrandTotal = (itemTotal, handlingCharge, deliveryFee, couponDiscount) => {
  return itemTotal + handlingCharge + deliveryFee - couponDiscount;
};

export const applyCoupon = (code, itemTotal) => {
  const found = COUPON_OFFERS.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!found) {
    return { error: 'Invalid coupon code', coupon: null };
  }
  if (itemTotal < found.minOrder) {
    return { error: `Minimum order ₹${found.minOrder} required`, coupon: null };
  }
  return { error: null, coupon: found };
};
