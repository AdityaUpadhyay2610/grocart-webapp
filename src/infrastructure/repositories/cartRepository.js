import { ref, get, set, remove } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { CartItem } from "../../domain/models/CartItem";

export const fetchCart = async (userId) => {
  if (!userId) return [];
  try {
    const cartRef = ref(database, `carts/${userId}`);
    const snapshot = await get(cartRef);
    if (!snapshot.exists()) return [];

    const rawData = snapshot.val();
    const list = Array.isArray(rawData) 
      ? rawData 
      : (typeof rawData === "object" ? Object.values(rawData) : []);

    return list
      .filter(item => item !== null && item !== undefined)
      .map(item => new CartItem({
        id: item.id || 0,
        itemName: item.itemName || "",
        itemPrice: Number(item.itemPrice) || 0,
        imageUrl: item.imageUrl || "",
        quantity: Number(item.quantity) || 1
      }));
  } catch (error) {
    console.error(`Failed to fetch cart for user ${userId}:`, error);
    return [];
  }
};

export const saveCartItem = async (userId, cartItem) => {
  if (!userId || !cartItem) return;
  try {
    const itemRef = ref(database, `carts/${userId}/${cartItem.id}`);
    await set(itemRef, {
      id: cartItem.id,
      itemName: cartItem.itemName,
      itemPrice: cartItem.itemPrice,
      imageUrl: cartItem.imageUrl,
      quantity: cartItem.quantity
    });
  } catch (error) {
    console.error(`Failed to save cart item for user ${userId}:`, error);
    throw error;
  }
};

export const removeCartItem = async (userId, itemId) => {
  if (!userId || !itemId) return;
  try {
    const itemRef = ref(database, `carts/${userId}/${itemId}`);
    await remove(itemRef);
  } catch (error) {
    console.error(`Failed to remove cart item ${itemId} for user ${userId}:`, error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  if (!userId) return;
  try {
    const cartRef = ref(database, `carts/${userId}`);
    await remove(cartRef);
  } catch (error) {
    console.error(`Failed to clear cart for user ${userId}:`, error);
    throw error;
  }
};
