import { ref, get } from "firebase/database";
import { database } from "../config/firebaseConfig";
import { Product } from "../models/Product";

export const fetchProducts = async () => {
  try {
    const itemsRef = ref(database, "items");
    const snapshot = await get(itemsRef);
    if (!snapshot.exists()) {
      console.warn("No products found in Firebase database.");
      return [];
    }

    const rawData = snapshot.val();
    // Firebase Realtime DB can return an array or a map/object of items.
    const list = Array.isArray(rawData) 
      ? rawData 
      : (typeof rawData === "object" ? Object.values(rawData) : []);

    return list
      .filter(item => item !== null && item !== undefined)
      .map(item => new Product({
        id: item.id || 0,
        itemName: item.itemName || "",
        itemCategory: item.itemCategory || "",
        itemQuantity: item.itemQuantity || "",
        itemPrice: Number(item.itemPrice) || 0,
        imageUrl: item.imageUrl || ""
      }));
  } catch (error) {
    console.error("Failed to fetch products from infrastructure:", error);
    throw error;
  }
};
