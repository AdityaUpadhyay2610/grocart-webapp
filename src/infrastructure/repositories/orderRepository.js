import { ref, get, push, set } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Order } from "../../domain/models/Order";
import { CartItem } from "../../domain/models/CartItem";

export const fetchOrders = async (userId) => {
  if (!userId) return [];
  try {
    const ordersRef = ref(database, `orders/${userId}`);
    const snapshot = await get(ordersRef);
    if (!snapshot.exists()) return [];

    const rawData = snapshot.val();
    
    // Convert object of objects into list of Orders
    return Object.entries(rawData).map(([key, data]) => {
      const items = (data.items || []).map(item => new CartItem({
        id: item.id || 0,
        itemName: item.itemName || "",
        itemPrice: Number(item.itemPrice) || 0,
        imageUrl: item.imageUrl || "",
        quantity: Number(item.quantity) || 1
      }));
      
      return new Order({
        id: key, // Using Firebase push key as the order ID
        items,
        timestamp: Number(data.timestamp) || Date.now(),
        totalPaid: Number(data.totalPaid) || 0,
        couponDiscount: Number(data.couponDiscount) || 0
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
    const ordersRef = ref(database, `orders/${userId}`);
    const newOrderRef = push(ordersRef);
    
    // Map CartItem instances to plain serializable objects for Firebase
    const itemsData = order.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      imageUrl: item.imageUrl,
      quantity: item.quantity
    }));

    await set(newOrderRef, {
      items: itemsData,
      timestamp: order.timestamp,
      totalPaid: order.totalPaid,
      couponDiscount: order.couponDiscount
    });
    
    return newOrderRef.key;
  } catch (error) {
    console.error(`Failed to place order for user ${userId}:`, error);
    throw error;
  }
};
