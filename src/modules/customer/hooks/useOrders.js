import { useState, useEffect, useCallback } from "react";
import { useAuth } from '@global/context/AuthContext';
import { fetchOrders, updateOrderStatus as dbUpdateOrderStatus } from "../services/orderRepository";

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
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      await dbUpdateOrderStatus(orderId, status);
      await loadOrders(); // Refresh after update
    } catch (e) {
      console.error("Failed to update status:", e);
      alert("Failed to update order status. Please try again.");
    }
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    isError,
    loadOrders,
    updateOrderStatus
  };
};
