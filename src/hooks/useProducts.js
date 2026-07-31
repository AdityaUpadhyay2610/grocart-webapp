import { useState, useEffect, useCallback } from "react";
import { fetchProducts } from "../services/productRepository";

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const items = await fetchProducts();
      setProducts(items);
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
