export const COUPON_OFFERS = [
  { code: 'GROCART10', description: '10% off on all fresh grocery orders', discountPercent: 10, minOrder: 100 },
  { code: 'SAVE10', description: '10% off on orders above ₹200', discountPercent: 10, minOrder: 200 },
  { code: 'FRESH20', description: '20% off on orders above ₹500', discountPercent: 20, minOrder: 500 },
  { code: 'GROCART5', description: 'Flat 5% off on all orders', discountPercent: 5, minOrder: 0 },
  { code: 'FIRST50', description: '50% off — Max ₹100 (New User)', discountPercent: 50, minOrder: 100 },
  { code: 'FESTIVE15', description: 'Festive 15% off above ₹300', discountPercent: 15, minOrder: 300 }
];

/**
 * Formats a number into Indian Rupee currency standard
 * e.g. 124999.5 -> "₹1,24,999.50" or 249 -> "₹249.00"
 */
export const formatINR = (amount, showDecimals = true) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2
  }).format(num);
};

export const calculateItemTotal = (cartItems) => {
  const total = cartItems.reduce((sum, item) => {
    return sum + ((Number(item.itemPrice) || 0) * (item.quantity || 1));
  }, 0);
  return Number(total.toFixed(2));
};

export const calculateHandlingCharge = (itemTotal) => {
  return Math.floor(itemTotal * 0.01);
};

export const getDeliveryFee = (itemTotal = 0) => {
  if (itemTotal > 500) return 0; // Free delivery above 500
  return 30; // Flat delivery fee in INR
};

export const calculateGST = (itemTotal, ratePercent = 5) => {
  return Number(((itemTotal * ratePercent) / 100).toFixed(2));
};

export const calculateEcoSavings = (cartItems) => {
  const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const lbsSaved = (totalQty * 1.5).toFixed(1);
  const progressPercent = Math.min(100, Math.round((totalQty / 5) * 60) || 60);
  return {
    lbsSaved: totalQty > 0 ? lbsSaved : '4.5',
    progressPercent: totalQty > 0 ? progressPercent : 60
  };
};

export const calculateCouponDiscount = (coupon, itemTotal) => {
  if (!coupon) return 0;
  if (itemTotal < coupon.minOrder) return 0;
  
  let discount = Number(((itemTotal * coupon.discountPercent) / 100).toFixed(2));
  
  // Custom rule for FIRST50: Max ₹100
  if (coupon.code === 'FIRST50' && discount > 100) {
    discount = 100;
  }
  
  return discount;
};

export const calculateGrandTotal = (itemTotal, handlingCharge, deliveryFee, couponDiscount, gst = 0) => {
  const grand = itemTotal + handlingCharge + deliveryFee + gst - couponDiscount;
  return Number(Math.max(0, grand).toFixed(2));
};

export const applyCoupon = (code, itemTotal) => {
  if (!code) return { error: 'Please enter a coupon code', coupon: null };
  const found = COUPON_OFFERS.find(c => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!found) {
    return { error: 'Invalid coupon code', coupon: null };
  }
  if (itemTotal < found.minOrder) {
    return { error: `Minimum order ${formatINR(found.minOrder, false)} required`, coupon: null };
  }
  return { error: null, coupon: found };
};

/**
 * Standard unit options per product category / unit type
 */
export const getAvailableUnits = (product) => {
  if (!product) return ["250g", "500g", "1 kg", "2 kg"];
  const cat = (product.itemCategory || "").toLowerCase();
  const rawUnit = (product.itemQuantity || product.unit || "").toLowerCase();

  if (rawUnit.includes("ml") || rawUnit.includes("liter") || rawUnit.includes("1 l") || cat.includes("beverage") || cat.includes("dairy")) {
    return ["250 ml", "500 ml", "1 L", "2 L"];
  }

  if (rawUnit.includes("pc") || rawUnit.includes("dozen") || rawUnit.includes("pack") || cat.includes("bakery") || cat.includes("munchies")) {
    return ["1 pc", "6 pcs", "12 pcs", "1 Pack"];
  }

  return ["250g", "500g", "1 kg", "2 kg", "5 kg"];
};

/**
 * Calculates unit multiplier relative to 500g / 500ml / standard base unit
 */
const getUnitMultiplier = (unitStr) => {
  if (!unitStr) return 1.0;
  const u = unitStr.toLowerCase().trim();

  // Weights (normalized to 500g base = 1.0)
  if (u === "100g") return 0.25;
  if (u === "250g") return 0.5;
  if (u === "500g") return 1.0;
  if (u === "1 kg" || u === "1kg") return 1.95;
  if (u === "2 kg" || u === "2kg") return 3.8;
  if (u === "5 kg" || u === "5kg") return 9.2;

  // Liquids (normalized to 500ml base = 1.0)
  if (u === "200 ml" || u === "200ml") return 0.45;
  if (u === "250 ml" || u === "250ml") return 0.5;
  if (u === "500 ml" || u === "500ml") return 1.0;
  if (u === "1 l" || u === "1l" || u === "1 liter" || u === "1 gallon") return 1.95;
  if (u === "2 l" || u === "2l" || u === "2 liters") return 3.8;

  // Pieces / Count
  if (u === "1 pc" || u === "1pc") return 0.2;
  if (u === "6 pcs" || u === "6pcs" || u === "half dozen") return 1.0;
  if (u === "12 pcs" || u === "12pcs" || u === "1 dozen" || u === "1 dozen") return 1.9;
  if (u === "1 pack" || u === "1pack" || u === "2 pack, organic") return 1.0;

  return 1.0;
};

/**
 * Calculates price rise/drop based on selected unit compared to base item price
 */
export const calculateUnitPrice = (basePrice, selectedUnit, baseQuantity = "500g") => {
  const price = Number(basePrice) || 0;
  if (!selectedUnit || selectedUnit === baseQuantity) return price;

  const targetMult = getUnitMultiplier(selectedUnit);
  const baseMult = getUnitMultiplier(baseQuantity);

  const ratio = targetMult / (baseMult || 1.0);
  const computed = Math.round(price * ratio);
  return Math.max(5, computed);
};


