import React from "react";
import { formatINR } from "@global/utils/calculations";
import { printOrderInvoice, formatTimestamp } from "../services/invoiceService";
import { OrderDeliveryTimeline } from "../components/OrderDeliveryTimeline";
import { Download, Clock, Package, ChevronDown, ChevronUp, RotateCcw, Wallet, Phone } from "lucide-react";
import { useOrdersScreen } from "../hooks/useOrdersScreen";

export const OrdersScreen = React.memo(() => {
  const {
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
  } = useOrdersScreen();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-surface-variant/40 dark:border-[#262626] gap-2">
        <div>
          <h1 className="font-headline-md text-2xl sm:text-3xl font-black text-on-surface dark:text-white">
            Your Orders
          </h1>
          <p className="text-xs text-on-surface-variant font-medium mt-0.5">
            Track active deliveries and view your order receipts
          </p>
        </div>

        <button
          onClick={() => setSupportModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Phone size={14} />
          <span>Need Help? Contact Support</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Order Selector List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-on-surface-variant px-1">
            Order History ({sortedOrders.length})
          </span>

          {sortedOrders.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low dark:bg-[#141414] rounded-3xl border border-surface-variant/40 dark:border-[#262626] flex flex-col items-center">
              <Package size={36} className="text-on-surface-variant/50 mb-3" />
              <p className="text-sm font-bold text-on-surface dark:text-white">No previous orders</p>
              <p className="text-xs text-on-surface-variant mt-1">Showing sample active delivery demo</p>
            </div>
          ) : (
            sortedOrders.map((order) => {
              const isSelected = (selectedOrderId || sortedOrders[0]?.id) === order.id;
              const isDelivered = order.status === "delivered";
              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isSelected
                      ? "bg-surface-container-high dark:bg-[#1e1e1e] border-primary shadow-md shadow-primary/5"
                      : "bg-surface-container-low dark:bg-[#141414] border-surface-variant/40 dark:border-[#262626] hover:border-surface-variant hover:bg-surface-container dark:hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-xs font-black text-on-surface dark:text-white">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        isDelivered
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : isCancelled
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {order.status || "processing"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium">
                    <span>{formatTimestamp(order.timestamp)}</span>
                    <span className="font-bold text-on-surface dark:text-white">
                      {formatINR(order.totalPaid || order.total_paid || 0)}
                    </span>
                  </div>

                  <div className="text-[11px] text-on-surface-variant/80 truncate">
                    {(order.items || []).map((i) => `${i.itemName || i.item_name} (x${i.quantity})`).join(", ")}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Active Order Details & Timeline */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Timeline Card */}
          <div className="bg-surface-container-lowest dark:bg-[#121212] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-surface-variant/20 dark:border-[#202020]">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface-variant">Active Delivery</span>
                <span className="font-headline-md text-lg font-black text-on-surface dark:text-white">
                  Order #{activeOrder.id.slice(-8).toUpperCase()}
                </span>
              </div>

              {activeOrder.status !== "delivered" && activeOrder.status !== "cancelled" && (
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-xl font-headline-md text-sm font-black animate-pulse">
                  <Clock size={16} />
                  <span>Arriving in {timeString}</span>
                </div>
              )}
            </div>

            {/* Stepper Timeline Visual */}
            <OrderDeliveryTimeline
              status={activeOrder.status}
              progressPercent={progressPercent}
            />

            {/* Delivery Partner Details */}
            <div className="p-4 rounded-2xl bg-surface-container dark:bg-[#1c1c1c] border border-surface-variant/30 dark:border-[#262626] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  🚴
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-on-surface dark:text-white">Ramesh Kumar</span>
                  <span className="text-[10px] text-on-surface-variant font-medium">GroCart Express Delivery Partner (4.9★)</span>
                </div>
              </div>

              <a
                href="tel:+919876543210"
                className="px-3 py-1.5 rounded-xl bg-surface-container-high dark:bg-[#262626] text-xs font-bold text-on-surface dark:text-white hover:text-primary transition-colors flex items-center gap-1.5 border border-surface-variant/40 dark:border-[#333]"
              >
                <Phone size={12} />
                <span>Call Partner</span>
              </a>
            </div>
          </div>

          {/* Items & Invoice Summary */}
          <div className="bg-surface-container-lowest dark:bg-[#121212] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-surface-variant/20 dark:border-[#202020]">
              <span className="font-headline-md text-sm font-black text-on-surface dark:text-white">
                Ordered Items ({(activeOrder.items || []).length})
              </span>
              <button
                onClick={() => printOrderInvoice(activeOrder)}
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Download size={14} />
                <span>Download Invoice (PDF)</span>
              </button>
            </div>

            {/* Order Items List */}
            <div className="flex flex-col divide-y divide-surface-variant/20 dark:divide-[#202020]">
              {(activeOrder.items || [])
                .slice(0, showAllItems ? undefined : 5)
                .map((item, idx) => (
                  <div key={item.id || idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container dark:bg-[#1c1c1c] p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-on-surface dark:text-white">
                          {item.itemName || item.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">
                          Qty: {item.quantity} • {item.itemQuantity || "500g"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-on-surface dark:text-white">
                      {formatINR((item.itemPrice || item.price || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                ))}
            </div>

            {/* Show More Items Toggle */}
            {(activeOrder.items || []).length > 5 && (
              <button
                onClick={() => setShowAllItems(!showAllItems)}
                className="text-xs font-bold text-primary flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
              >
                <span>{showAllItems ? "Show Less" : `View all ${(activeOrder.items || []).length} items`}</span>
                {showAllItems ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}

            {/* Bill Details */}
            <div className="mt-2 pt-4 border-t border-surface-variant/20 dark:border-[#202020] flex flex-col gap-2 text-xs text-on-surface-variant font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-on-surface dark:text-white">{formatINR(orderSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery &amp; Handling</span>
                <span className="font-bold text-primary">
                  {activeOrder.deliveryFee === 0 ? "FREE" : formatINR(activeOrder.deliveryFee || 0)}
                </span>
              </div>
              {Number(activeOrder.couponDiscount || 0) > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Discount</span>
                  <span>-{formatINR(activeOrder.couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-on-surface-variant/70">
                <span>GST (Estimated)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-surface-variant/30 dark:border-[#262626] text-sm font-black text-on-surface dark:text-white">
                <span>Total Paid</span>
                <span className="text-base text-primary font-black">{formatINR(totalPaid)}</span>
              </div>
            </div>

            {/* Action Buttons: Re-order & View Saved */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReorder}
                className="flex-1 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>Order Again</span>
              </button>

              {orderSavings > 0 && (
                <div className="flex items-center gap-1.5 px-4 py-3 bg-surface-container dark:bg-[#1a1a1a] rounded-xl text-xs font-bold text-on-surface-variant">
                  <Wallet size={14} className="text-primary" />
                  <span>Saved {formatINR(orderSavings)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {supportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#1c1c1c] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-surface-variant/40 dark:border-[#333]">
            <h3 className="font-headline-md text-base font-black text-on-surface dark:text-white mb-2">
              GroCart Priority Support
            </h3>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
              Our 24x7 Quick Care team is ready to help you with delays, missing items, or refunds.
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="tel:1800123456"
                className="w-full py-3 bg-primary text-on-primary dark:text-black font-headline-md text-xs font-black rounded-xl"
              >
                Call Toll Free (1800-123-456)
              </a>
              <button
                onClick={() => setSupportModal(false)}
                className="w-full py-2.5 bg-surface-container dark:bg-[#262626] text-on-surface text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrdersScreen.displayName = "OrdersScreen";
