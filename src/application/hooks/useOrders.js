import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchOrders } from "../../infrastructure/repositories/orderRepository";

export const useOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    try {
      const history = await fetchOrders(user.id);
      setOrders(history);
    } catch (e) {
      console.error("Failed to load orders history in hook:", e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    isError,
    loadOrders
  };
};
