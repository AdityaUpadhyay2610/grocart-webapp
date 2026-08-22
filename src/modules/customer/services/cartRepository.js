import { ref, get, set, remove } from "firebase/database";
import { database } from '@global/config/firebaseConfig';
import { CartItem } from '@global/models/CartItem';

export const fetchCart = async (userId) => {
  if (!userId) return [];
  if (userId === "guest_user") {
    try {
      const localData = localStorage.getItem("grocart_guest_cart");
      if (!localData) return [];
      const list = JSON.parse(localData);
      return list
        .filter(item => item !== null && item !== undefined)
        .map(item => new CartItem({
          id: item.id || 0,
          itemName: item.itemName || "",
          itemPrice: Number(item.itemPrice) || 0,
          imageUrl: item.imageUrl || "",
          quantity: Number(item.quantity) || 1,
          itemCost: Number(item.itemCost) || 0,
          itemStock: Number(item.itemStock) || 0,
          retailerId: item.retailerId || ""
        }));
    } catch (e) {
      console.error("Failed to fetch guest cart from local storage:", e);
      return [];
    }
  }
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
        quantity: Number(item.quantity) || 1,
        itemCost: Number(item.itemCost) || 0,
        itemStock: Number(item.itemStock) || 0,
        retailerId: item.retailerId || ""
      }));
  } catch (error) {
    console.error(`Failed to fetch cart for user ${userId}:`, error);
    return [];
  }
};

export const saveCartItem = async (userId, cartItem) => {
  if (!userId || !cartItem) return;
  if (userId === "guest_user") {
    try {
      const localData = localStorage.getItem("grocart_guest_cart");
      let list = localData ? JSON.parse(localData) : [];
      const idx = list.findIndex(item => item.id === cartItem.id);
      if (idx > -1) {
        list[idx] = cartItem;
      } else {
        list.push(cartItem);
      }
      localStorage.setItem("grocart_guest_cart", JSON.stringify(list));
      return;
    } catch (e) {
      console.error("Failed to save guest cart item in local storage:", e);
      throw e;
    }
  }
  try {
    const itemRef = ref(database, `carts/${userId}/${cartItem.id}`);
    await set(itemRef, {
      id: cartItem.id,
      itemName: cartItem.itemName,
      itemPrice: cartItem.itemPrice,
      imageUrl: cartItem.imageUrl,
      quantity: cartItem.quantity,
      itemCost: cartItem.itemCost || 0,
      itemStock: cartItem.itemStock || 0,
      retailerId: cartItem.retailerId || ""
    });
  } catch (error) {
    console.error(`Failed to save cart item for user ${userId}:`, error);
    throw error;
  }
};

export const removeCartItem = async (userId, itemId) => {
  if (!userId || !itemId) return;
  if (userId === "guest_user") {
    try {
      const localData = localStorage.getItem("grocart_guest_cart");
      if (!localData) return;
      let list = JSON.parse(localData);
      list = list.filter(item => item.id !== itemId);
      localStorage.setItem("grocart_guest_cart", JSON.stringify(list));
      return;
    } catch (e) {
      console.error("Failed to remove guest cart item from local storage:", e);
      throw e;
    }
  }
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
  if (userId === "guest_user") {
    localStorage.removeItem("grocart_guest_cart");
    return;
  }
  try {
    const cartRef = ref(database, `carts/${userId}`);
    await remove(cartRef);
  } catch (error) {
    console.error(`Failed to clear cart for user ${userId}:`, error);
    throw error;
  }
};
