import { useState, useEffect, useCallback } from "react";
import { storefrontApi } from "../infrastructure/api/appApis";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const items = await storefrontApi.fetchAllProducts();
      // Map new multi-vendor ProductItem schema to the old Product model format for the UI
      const mappedItems = items.map(item => ({
        id: item.id,
        itemName: item.title,
        itemCategory: item.categoryName || item.categoryId,
        itemPrice: item.sellingPrice,
        itemUnit: item.unit,
        itemStock: item.stockQuantity,
        imageUrl: item.imageUrl,
        retailerStoreName: item.retailerStoreName,
        retailerId: item.retailerId,
        description: item.description,
        itemCost: item.costPrice
      }));
      setProducts(mappedItems);
    } catch (e) {
      console.error("Failed to load products in hook:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    isLoading,
    isError,
    loadProducts
  };
};
