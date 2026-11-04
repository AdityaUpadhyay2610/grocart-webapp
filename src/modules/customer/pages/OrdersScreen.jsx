import React, { useState, useEffect, useMemo } from "react";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../state/CartContext";
import { formatINR, calculateGST } from "@global/utils/calculations";
import { printOrderInvoice, formatTimestamp } from "../services/invoiceService";
import { OrderDeliveryTimeline } from "../components/OrderDeliveryTimeline";
import { Download, Clock, Package, ChevronDown, ChevronUp, RotateCcw, Wallet, Phone } from "lucide-react";

const TOTAL_ORDER_SECONDS = 15 * 60;

const DEMO_ORDER = {
  id: "GC-89421",
  timestamp: Date.now() - 3600000,
  status: "delivered",
  deliveryAddress: "742 Evergreen Terrace, Sector 45, Gurugram 122003",
  paymentMethod: "Cash on Delivery (COD)",
  items: [
    { id: "demo-1", itemName: "Organic Gala Apples", itemQuantity: "1 kg", itemPrice: 180, quantity: 2, imageUrl: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80" },
    { id: "demo-2", itemName: "Farm Fresh Whole Milk", itemQuantity: "1 L", itemPrice: 75, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80" },
    { id: "demo-3", itemName: "Artisan Sourdough Loaf", itemQuantity: "400g", itemPrice: 120, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80" }
  ],
  couponDiscount: 35,
  deliveryFee: 0,
  handlingCharge: 15
};

export const OrdersScreen = React.memo(() => {
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
    const found = sortedOrders.find(o => o.id === selectedOrderId);
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
    } else {
      setRemainingSeconds(0);
    }
  }, [activeOrder?.id, activeOrder?.timestamp]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const isDelivered = remainingSeconds === 0;

  const currentStage = useMemo(() => {
    if (isDelivered) {
      return {
        step: 4,
        label: "Delivered",
        badge: "Delivered Successfully",
        color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300",
        progressPct: 100,
        statusText: "Package handed over safely at doorstep",
        driverText: "Delivered",
        driverSubtext: "Order arrived at your doorstep"
      };
    }
    if (remainingSeconds > 12 * 60) {
      return {
        step: 1,
        label: "Order Placed",
        badge: "Order Confirmed",
        color: "text-primary bg-primary/15",
        progressPct: 15,
        statusText: "Store is picking your items",
        driverText: "Driver assigned at Local Store",
        driverSubtext: "Estimated 15 mins to doorstep"
      };
    }
    if (remainingSeconds > 8 * 60) {
      return {
        step: 2,
        label: "Order Packed",
        badge: "Packed & Ready",
        color: "text-amber-600 bg-amber-500/15",
        progressPct: 45,
        statusText: "Items freshly packed in bags",
        driverText: "Driver loaded package & moving out",
        driverSubtext: "Estimated 10 mins to doorstep"
      };
    }
    return {
      step: 3,
      label: "Out for Delivery",
      badge: "Out for Delivery",
      color: "text-emerald-600 bg-emerald-500/15",
      progressPct: 80,
      statusText: "Driver is riding to your doorstep",
      driverText: "Driver on the way",
      driverSubtext: "Arriving shortly"
    };
  }, [remainingSeconds, isDelivered]);

  const minutesRemaining = Math.floor(remainingSeconds / 60);
  const secondsRemaining = remainingSeconds % 60;
  const formattedTimer = `${String(minutesRemaining).padStart(2, "0")}:${String(secondsRemaining).padStart(2, "0")}`;

  const orderSubtotal = useMemo(() => {
    if (!activeOrder?.items) return 0;
    return activeOrder.items.reduce(
      (sum, item) => sum + Number(item.itemPrice || 0) * (item.quantity || 1),
      0
    );
  }, [activeOrder]);

  const orderGst = useMemo(() => calculateGST(orderSubtotal), [orderSubtotal]);
  const orderTotal = useMemo(() => {
    return (
      activeOrder?.totalPaid ||
      orderSubtotal + orderGst + (activeOrder?.deliveryFee || 0) + (activeOrder?.handlingCharge || 15) - (activeOrder?.couponDiscount || 0)
    );
  }, [orderSubtotal, orderGst, activeOrder]);

  const handleReorder = (order) => {
    if (!order?.items) return;
    order.items.forEach(item => {
      addToCart({
        id: item.productId || item.id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity || "500g",
        imageUrl: item.imageUrl,
        quantity: item.quantity || 1
      });
    });
    alert("All items from this order have been added to your cart!");
  };

  const currentOrderId = activeOrder?.id
    ? (activeOrder.id.startsWith("GC-") ? activeOrder.id : `GC-${activeOrder.id.substring(activeOrder.id.length - 5).toUpperCase()}`)
    : "GC-89421";

  const topFiveOrders = sortedOrders.slice(0, 5);
  const dropdownOrders = sortedOrders.slice(5);

  const activeItems = activeOrder?.items || [];
  const visibleItems = showAllItems ? activeItems : activeItems.slice(0, 5);
  const hiddenItemCount = Math.max(0, activeItems.length - 5);

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-variant/40 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display-lg text-on-surface dark:text-white text-2xl sm:text-3xl font-black">
              Order #{currentOrderId}
            </h1>
            <span className={`px-3 py-1 text-xs font-black rounded-full uppercase tracking-wider ${currentStage.color}`}>
              {currentStage.badge}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Placed on <span className="font-bold text-on-surface dark:text-white">{formatTimestamp(activeOrder.timestamp)}</span> • <span className="text-primary font-bold">{currentStage.statusText}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isDelivered && (
            <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 px-3.5 py-2 rounded-2xl shadow-xs">
              <Clock size={16} className="text-primary animate-spin" style={{ animationDuration: "6s" }} />
              <div className="flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">15-Min Delivery ETA</span>
                <span className="text-sm font-black font-mono text-on-surface dark:text-white">{formattedTimer} remaining</span>
              </div>
            </div>
          )}

          <button
            onClick={() => printOrderInvoice(activeOrder)}
            className="px-4 py-2.5 bg-surface-container-low dark:bg-[#171717] border border-surface-variant/50 dark:border-[#262626] hover:border-primary text-on-surface dark:text-white hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download size={16} />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          <OrderDeliveryTimeline
            currentStage={currentStage}
            isDelivered={isDelivered}
            formattedTimer={formattedTimer}
            onCallDriver={() => setSupportModal(true)}
          />

          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/30 dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-primary" />
                <h3 className="text-base font-bold text-on-surface dark:text-white">
                  Items in This Order ({activeItems.length})
                </h3>
              </div>
              <button
                onClick={() => handleReorder(activeOrder)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Reorder Items</span>
              </button>
            </div>

            <div className="divide-y divide-surface-variant/20 dark:divide-[#262626]">
              {visibleItems.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/30 dark:border-[#262626]"
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/f1f5f9/10b981?text=Produce"; }}
                    />
                    <div>
                      <h4 className="text-sm font-bold text-on-surface dark:text-white">{item.itemName}</h4>
                      <p className="text-xs text-on-surface-variant">{item.itemQuantity || "500g"} • Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-on-surface dark:text-white">
                      {formatINR(item.itemPrice * (item.quantity || 1))}
                    </span>
                    <p className="text-[11px] text-on-surface-variant">@{formatINR(item.itemPrice)}/unit</p>
                  </div>
                </div>
              ))}
            </div>

            {hiddenItemCount > 0 && (
              <button
                onClick={() => setShowAllItems(prev => !prev)}
                className="mt-2 py-2 px-4 rounded-xl bg-surface-container dark:bg-[#201f1f] hover:bg-surface-container-high border border-surface-variant/40 dark:border-[#262626] text-xs font-bold text-primary flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {showAllItems ? (
                  <>
                    <ChevronUp size={16} />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    <span>View {hiddenItemCount} more items in this order</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-on-surface dark:text-white border-b border-surface-variant/30 dark:border-[#262626] pb-3">
              Payment Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(orderSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(orderGst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-primary">
                  {activeOrder.deliveryFee === 0 ? "FREE" : formatINR(activeOrder.deliveryFee || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(activeOrder.handlingCharge || 15)}</span>
              </div>
              {activeOrder.couponDiscount > 0 && (
                <div className="flex justify-between font-bold text-primary">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(activeOrder.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-surface-variant/30 dark:border-[#262626] text-base font-black text-on-surface dark:text-white">
                <span>Total Paid</span>
                <span className="text-lg text-primary font-black">{formatINR(orderTotal)}</span>
              </div>
            </div>

            <div className="mt-2 bg-surface-container dark:bg-[#201f1f] rounded-xl p-3 flex items-center justify-between border border-surface-variant/30 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-primary" />
                <span className="text-xs font-bold text-on-surface dark:text-white">{activeOrder.paymentMethod || "Cash on Delivery (COD)"}</span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase">
                {activeOrder.paymentStatus === "paid" ? "PAID" : (activeOrder.paymentMethod === "COD" ? "CASH ON DELIVERY" : "PENDING")}
              </span>
            </div>

            <div className="pt-3 border-t border-surface-variant/30 dark:border-[#262626] text-xs">
              <p className="font-bold text-on-surface dark:text-white mb-1">Delivery Address</p>
              <p className="text-on-surface-variant leading-relaxed">{activeOrder.deliveryAddress || "Customer Residence"}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface-tint to-primary dark:from-[#171717] dark:to-[#171717] border border-transparent dark:border-[#262626] rounded-3xl p-6 text-white shadow-md flex flex-col gap-3">
            <h4 className="text-base font-extrabold text-white">Need Help?</h4>
            <p className="text-xs text-white/90 dark:text-on-surface-variant leading-relaxed">
              Our 24/7 customer care team is available to assist with replacements, refunds, or delivery instructions.
            </p>
            <button
              onClick={() => setSupportModal(true)}
              className="mt-1 w-full py-2.5 bg-white text-primary dark:bg-[#201f1f] dark:text-white dark:border dark:border-[#353534] text-xs font-bold rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-sm"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-surface-variant/40 dark:border-[#262626]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-on-surface dark:text-white">
            Order History ({sortedOrders.length})
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Click any order below to view the items and receipt from that time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topFiveOrders.map((ord) => {
            const isSelected = ord.id === activeOrder.id;
            const ordDisplayId = ord.id ? (ord.id.startsWith("GC-") ? ord.id : `GC-${ord.id.substring(ord.id.length - 5).toUpperCase()}`) : "GC-ORDER";
            const itemCount = ord.items?.length || 0;
            const previewItems = (ord.items || []).slice(0, 3);

            return (
              <div
                key={ord.id}
                onClick={() => setSelectedOrderId(ord.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected 
                    ? "bg-primary/5 dark:bg-primary/10 border-primary shadow-md ring-2 ring-primary/20" 
                    : "bg-surface-container-low dark:bg-[#171717] border-surface-variant/40 dark:border-[#262626] hover:border-primary/50 shadow-xs"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black text-on-surface dark:text-white">
                      #{ordDisplayId}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSelected ? "bg-primary text-black" : "bg-surface-container dark:bg-[#201f1f] text-on-surface-variant"
                    }`}>
                      {isSelected ? "Viewing" : "Delivered"}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface-variant mt-1">
                    {formatTimestamp(ord.timestamp)}
                  </p>
                </div>

                <div className="flex items-center gap-2 py-1">
                  {previewItems.map((it, idx) => (
                    <img
                      key={idx}
                      src={it.imageUrl}
                      alt={it.itemName}
                      title={it.itemName}
                      className="w-9 h-9 rounded-lg object-cover bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/30 dark:border-[#262626]"
                      onError={(e) => { e.target.src = "https://placehold.co/60x60/f1f5f9/10b981?text=Item"; }}
                    />
                  ))}
                  {itemCount > 3 && (
                    <span className="text-[11px] font-bold text-on-surface-variant bg-surface-container dark:bg-[#201f1f] px-2 py-1 rounded-lg">
                      +{itemCount - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-variant/20 dark:border-[#262626]">
                  <span className="text-xs font-bold text-on-surface dark:text-white">
                    {itemCount} {itemCount === 1 ? "item" : "items"} • {formatINR(ord.totalPaid || 0)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReorder(ord);
                    }}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reorder</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {dropdownOrders.length > 0 && (
          <div className="mt-2 bg-surface-container-low dark:bg-[#171717] p-5 rounded-2xl border border-surface-variant/40 dark:border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-on-surface dark:text-white">
                View Older Orders ({dropdownOrders.length} more)
              </p>
              <p className="text-[11px] text-on-surface-variant">
                Select from your older past orders to load its items and invoice
              </p>
            </div>

            <div className="w-full sm:w-auto min-w-[280px]">
              <select
                value={dropdownOrders.some(o => o.id === selectedOrderId) ? selectedOrderId : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedOrderId(e.target.value);
                  }
                }}
                className="w-full bg-surface-container dark:bg-[#201f1f] border border-surface-variant/50 dark:border-[#262626] rounded-xl px-3.5 py-2.5 text-xs font-bold text-on-surface dark:text-white focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="">-- Choose an older order --</option>
                {dropdownOrders.map((ord) => {
                  const ordId = ord.id ? (ord.id.startsWith("GC-") ? ord.id : `GC-${ord.id.substring(ord.id.length - 5).toUpperCase()}`) : "GC-ORDER";
                  const dateText = formatTimestamp(ord.timestamp);
                  const itemsCount = ord.items?.length || 0;
                  const total = formatINR(ord.totalPaid || 0);

                  return (
                    <option key={ord.id} value={ord.id}>
                      #{ordId} • {dateText} • {itemsCount} items ({total})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        )}
      </div>

      {supportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-variant/40 dark:border-[#262626] text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h3 className="text-lg font-bold text-on-surface dark:text-white">Customer Support</h3>
            <p className="text-xs text-on-surface-variant mt-1">Our customer support team is available 24/7 at:</p>
            <p className="text-base font-black text-primary mt-3">+91 98765 43210</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSupportModal(false)}
                className="flex-1 py-2.5 bg-surface-container-low dark:bg-[#201f1f] text-on-surface dark:text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <a
                href="tel:+919876543210"
                className="flex-1 py-2.5 bg-primary text-black text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer"
              >
                Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrdersScreen.displayName = "OrdersScreen";
