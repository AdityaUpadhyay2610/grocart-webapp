import { ref, get, push, query, orderByChild, equalTo, update } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Order } from "../models/Order";
import { CartItem } from "../models/CartItem";

export const fetchOrders = async (userId) => {
  if (!userId) return [];
  try {
    const ordersRef = ref(database, 'orders');
    const q = query(ordersRef, orderByChild('customerId'), equalTo(userId));
    const snapshot = await get(q);
    if (!snapshot.exists()) return [];

    const rawData = snapshot.val();
    
    // Convert object of objects into list of Orders
    return Object.entries(rawData).map(([key, data]) => {
      const items = (data.items || []).map(item => new CartItem({
        id: item.id || 0,
        itemName: item.itemName || "",
        itemPrice: Number(item.itemPrice) || 0,
        itemCost: Number(item.itemCost) || 0,
        imageUrl: item.imageUrl || "",
        quantity: Number(item.quantity) || 1,
        retailerId: item.retailerId || ""
      }));
      
      return new Order({
        id: key, 
        items,
        timestamp: Number(data.timestamp) || Date.now(),
        totalPaid: Number(data.totalPaid) || 0,
        couponDiscount: Number(data.couponDiscount) || 0,
        status: data.status || 'placed'
      });
    });
  } catch (error) {
    console.error(`Failed to fetch orders for user ${userId}:`, error);
    return [];
  }
};

export const placeOrder = async (userId, order) => {
  if (!userId || !order) return null;
  try {
    const newOrderRef = push(ref(database, 'orders'));
    const orderId = newOrderRef.key;
    
    const itemsData = order.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemCost: item.itemCost || 0,
      imageUrl: item.imageUrl,
      quantity: item.quantity,
      retailerId: item.retailerId || ""
    }));

    const updates = {};
    
    // 1. Save the order
    updates[`/orders/${orderId}`] = {
      id: orderId,
      customerId: userId,
      items: itemsData,
      timestamp: order.timestamp,
      totalPaid: order.totalPaid,
      couponDiscount: order.couponDiscount,
      status: 'placed'
    };

    // 2. Aggregate revenue per retailer and stock updates
    const productsSnap = await get(ref(database, 'products'));
    const productsData = productsSnap.exists() ? productsSnap.val() : {};

    const analyticsSnap = await get(ref(database, 'retailer_analytics'));
    const analyticsData = analyticsSnap.exists() ? analyticsSnap.val() : {};

    const platformSnap = await get(ref(database, 'platform_analytics'));
    const platformData = platformSnap.exists() ? platformSnap.val() : { totalGMV: 0, totalPlatformProfit: 0, totalOrders: 0 };
    
    let totalGMV = 0;
    
    for (const item of itemsData) {
      if (item.id && productsData[item.id]) {
        const currentStock = productsData[item.id].stockQuantity || 0;
        updates[`/products/${item.id}/stockQuantity`] = Math.max(0, currentStock - item.quantity);
        if (currentStock - item.quantity <= 0) {
           updates[`/products/${item.id}/status`] = 'out_of_stock';
        }
      }

      if (item.retailerId) {
        const rev = item.itemPrice * item.quantity;
        const cost = (item.itemCost || 0) * item.quantity;
        totalGMV += rev;

        if (!updates[`/retailer_analytics/${item.retailerId}`]) {
           const existing = analyticsData[item.retailerId] || { totalRevenue: 0, totalCost: 0, grossProfit: 0, totalOrdersFulfilled: 0 };
           updates[`/retailer_analytics/${item.retailerId}`] = { ...existing };
        }
        
        updates[`/retailer_analytics/${item.retailerId}`].totalRevenue += rev;
        updates[`/retailer_analytics/${item.retailerId}`].totalCost += cost;
        updates[`/retailer_analytics/${item.retailerId}`].grossProfit += (rev - cost);
        updates[`/retailer_analytics/${item.retailerId}`].totalOrdersFulfilled += 1;
      }
    }

    updates[`/platform_analytics/totalGMV`] = (platformData.totalGMV || 0) + totalGMV;
    updates[`/platform_analytics/totalOrders`] = (platformData.totalOrders || 0) + 1;

    await update(ref(database), updates);
    return orderId;
  } catch (error) {
    console.error(`Failed to place order for user ${userId}:`, error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId) return;
  try {
    if (newStatus === 'cancelled' || newStatus === 'returned') {
      const orderSnap = await get(ref(database, `/orders/${orderId}`));
      if (!orderSnap.exists()) return;
      const order = orderSnap.val();

      const productsSnap = await get(ref(database, 'products'));
      const productsData = productsSnap.exists() ? productsSnap.val() : {};

      const analyticsSnap = await get(ref(database, 'retailer_analytics'));
      const analyticsData = analyticsSnap.exists() ? analyticsSnap.val() : {};

      const platformSnap = await get(ref(database, 'platform_analytics'));
      const platformData = platformSnap.exists() ? platformSnap.val() : { totalGMV: 0, totalOrders: 0 };

      const updates = {};
      let totalGMV = 0;

      for (const item of order.items || []) {
        // Revert Stock
        if (item.id && productsData[item.id]) {
          const currentStock = productsData[item.id].stockQuantity || 0;
          updates[`/products/${item.id}/stockQuantity`] = currentStock + item.quantity;
          if (currentStock + item.quantity > 0 && productsData[item.id].status === 'out_of_stock') {
             updates[`/products/${item.id}/status`] = 'active';
          }
        }

        // Revert Revenue
        if (item.retailerId) {
          const rev = item.itemPrice * item.quantity;
          const cost = (item.itemCost || 0) * item.quantity;
          totalGMV += rev;

          if (!updates[`/retailer_analytics/${item.retailerId}`]) {
             const existing = analyticsData[item.retailerId] || { totalRevenue: 0, totalCost: 0, grossProfit: 0, totalOrdersFulfilled: 0 };
             updates[`/retailer_analytics/${item.retailerId}`] = { ...existing };
          }
          
          updates[`/retailer_analytics/${item.retailerId}`].totalRevenue = Math.max(0, updates[`/retailer_analytics/${item.retailerId}`].totalRevenue - rev);
          updates[`/retailer_analytics/${item.retailerId}`].totalCost = Math.max(0, updates[`/retailer_analytics/${item.retailerId}`].totalCost - cost);
          updates[`/retailer_analytics/${item.retailerId}`].grossProfit = updates[`/retailer_analytics/${item.retailerId}`].totalRevenue - updates[`/retailer_analytics/${item.retailerId}`].totalCost;
          updates[`/retailer_analytics/${item.retailerId}`].totalOrdersFulfilled = Math.max(0, updates[`/retailer_analytics/${item.retailerId}`].totalOrdersFulfilled - 1);
        }
      }

      // Revert Platform Analytics
      updates[`/platform_analytics/totalGMV`] = Math.max(0, (platformData.totalGMV || 0) - totalGMV);
      updates[`/platform_analytics/totalOrders`] = Math.max(0, (platformData.totalOrders || 0) - 1);

      // Remove the order from database
      updates[`/orders/${orderId}`] = null;

      await update(ref(database), updates);
    } else {
      await update(ref(database), {
        [`/orders/${orderId}/status`]: newStatus
      });
    }
  } catch (error) {
    console.error(`Failed to update order ${orderId} to ${newStatus}:`, error);
    throw error;
  }
};
