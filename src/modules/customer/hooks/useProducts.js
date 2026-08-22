import { useState, useEffect } from "react";
import { storefrontApi } from '@global/services/api/appApis';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);

    try {
      const unsubscribe = storefrontApi.subscribeToProducts((items) => {
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
        setIsLoading(false);
      });

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } catch (e) {
      console.error("Failed to subscribe to products:", e);
      setIsError(true);
      setIsLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    isError,
    loadProducts: () => {} // Kept for backwards compatibility if called manually
  };
};
