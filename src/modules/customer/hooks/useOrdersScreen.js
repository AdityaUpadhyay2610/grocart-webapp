import { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "./useOrders";
import { useCart } from "../state/CartContext";
import { calculateGST } from "@global/utils/calculations";
import { TOTAL_ORDER_SECONDS, DEMO_ORDER } from "../constants/ordersConstants";

export function useOrdersScreen() {
  const { orders = [] } = useOrders();
  const { addToCart } = useCart();

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [supportModal, setSupportModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showAllItems, setShowAllItems] = useState(false);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [orders]);

  useEffect(() => {
    if (sortedOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(sortedOrders[0].id);
    }
  }, [sortedOrders, selectedOrderId]);

  const activeOrder = useMemo(() => {
    if (sortedOrders.length === 0) return DEMO_ORDER;
    const found = sortedOrders.find((o) => o.id === selectedOrderId);
    return found || sortedOrders[0];
  }, [sortedOrders, selectedOrderId]);

  useEffect(() => {
    setShowAllItems(false);
    if (!activeOrder?.timestamp) {
      setRemainingSeconds(0);
      return;
    }

    const elapsedSeconds = Math.floor((Date.now() - Number(activeOrder.timestamp)) / 1000);
    if (elapsedSeconds >= 0 && elapsedSeconds < TOTAL_ORDER_SECONDS) {
      setRemainingSeconds(TOTAL_ORDER_SECONDS - elapsedSeconds);
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRemainingSeconds(0);
    }
  }, [activeOrder]);

  const progressPercent = useMemo(() => {
    if (activeOrder.status === "delivered") return 100;
    if (activeOrder.status === "cancelled") return 0;
    const elapsed = TOTAL_ORDER_SECONDS - remainingSeconds;
    return Math.min(100, Math.max(10, Math.round((elapsed / TOTAL_ORDER_SECONDS) * 100)));
  }, [activeOrder.status, remainingSeconds]);

  const orderSubtotal = useMemo(() => {
    return (activeOrder.items || []).reduce((acc, item) => {
      const price = Number(item.itemPrice || item.price || 0);
      const qty = Number(item.quantity || 1);
      return acc + price * qty;
    }, 0);
  }, [activeOrder.items]);

  const gst = useMemo(() => calculateGST(orderSubtotal), [orderSubtotal]);

  const totalPaid = useMemo(() => {
    if (activeOrder.totalPaid !== undefined && activeOrder.totalPaid > 0) {
      return activeOrder.totalPaid;
    }
    const discount = Number(activeOrder.couponDiscount || 0);
    const delivery = Number(activeOrder.deliveryFee || 0);
    const handling = Number(activeOrder.handlingCharge || 15);
    return Math.max(0, orderSubtotal - discount + delivery + handling);
  }, [activeOrder, orderSubtotal]);

  const orderSavings = useMemo(() => {
    return (activeOrder.items || []).reduce((acc, item) => {
      const original = (item.itemPrice || 0) * 1.15;
      const actual = item.itemPrice || 0;
      return acc + (original - actual) * (item.quantity || 1);
    }, Number(activeOrder.couponDiscount || 0));
  }, [activeOrder]);

  const handleReorder = useCallback(() => {
    if (!activeOrder?.items?.length) return;
    activeOrder.items.forEach((item) => {
      addToCart({
        id: item.id || item.productId,
        productId: item.productId || item.id,
        itemName: item.itemName || item.title,
        itemPrice: item.itemPrice || item.price,
        itemQuantity: item.itemQuantity || item.unit || "500g",
        imageUrl: item.imageUrl,
        quantity: item.quantity || 1
      });
    });
    alert("Items from this order have been added to your cart!");
  }, [activeOrder, addToCart]);

  return {
    sortedOrders,
    activeOrder,
    selectedOrderId,
    setSelectedOrderId,
    supportModal,
    setSupportModal,
    remainingSeconds,
    showAllItems,
    setShowAllItems,
    progressPercent,
    orderSubtotal,
    gst,
    totalPaid,
    orderSavings,
    handleReorder
  };
}

