import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../state/CartContext";
import { formatINR, calculateGST } from "@global/utils/calculations";
import { Download, Check, Phone, X, Clock, Package } from "lucide-react";

const TOTAL_ORDER_SECONDS = 15 * 60;

export const OrdersScreen = React.memo(() => {
  const { orders = [] } = useOrders();
  const { addToCart } = useCart();

  const [activeOrderIndex] = useState(0);
  const [supportModal, setSupportModal] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_ORDER_SECONDS);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [orders]);

  const activeOrder = useMemo(() => {
    const nowRef = Date.now();
    if (sortedOrders.length > 0) {
      return sortedOrders[activeOrderIndex] || sortedOrders[0];
    }
    return {
      id: "GC-89421",
      timestamp: nowRef,
      status: "placed",
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
  }, [sortedOrders, activeOrderIndex]);

  // Countdown timer for 15 minute delivery window
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update timer whenever active order changes
  useEffect(() => {
    let newRemaining = TOTAL_ORDER_SECONDS;
    if (activeOrder?.timestamp) {
      const elapsed = Math.floor((Date.now() - activeOrder.timestamp) / 1000);
      if (elapsed >= 0 && elapsed < TOTAL_ORDER_SECONDS) {
        newRemaining = TOTAL_ORDER_SECONDS - elapsed;
      }
    }
    setRemainingSeconds(newRemaining);
  }, [activeOrder?.id]);

  const currentStage = useMemo(() => {
    if (remainingSeconds > 12 * 60) {
      return {
        step: 1,
        label: "Order Placed",
        badge: "Order Confirmed",
        color: "text-primary bg-primary/15",
        progressPct: 15,
        statusText: "Dark Store is picking your fresh items",
        driverText: "Driver assigned at Local Store Hub 04",
        driverSubtext: "1.8 km away • Estimated 15 mins to doorstep"
      };
    }
    if (remainingSeconds > 8 * 60) {
      return {
        step: 2,
        label: "Order Packed",
        badge: "Packed & Ready",
        color: "text-amber-600 bg-amber-500/15",
        progressPct: 45,
        statusText: "Items freshly packed in eco-friendly bags",
        driverText: "Driver loaded package & moving out",
        driverSubtext: "1.2 km away • Estimated 10 mins to doorstep"
      };
    }
    if (remainingSeconds > 60) {
      return {
        step: 3,
        label: "Out for Delivery",
        badge: "Out for Delivery",
        color: "text-emerald-600 bg-emerald-500/15",
        progressPct: 80,
        statusText: "Michael is riding your delivery to your doorstep",
        driverText: "Michael is on his way (Electric Scooter)",
        driverSubtext: "0.5 km away • Arriving in ~5 mins"
      };
    }
    return {
      step: 4,
      label: "Delivered",
      badge: "Delivered Successfully",
      color: "text-green-600 bg-green-500/15",
      progressPct: 100,
      statusText: "Order arrived at your doorstep. Enjoy!",
      driverText: "Order Delivered at Doorstep",
      driverSubtext: "Package handed over safely"
    };
  }, [remainingSeconds]);

  const minutesRemaining = Math.floor(remainingSeconds / 60);
  const secondsRemaining = remainingSeconds % 60;
  const formattedTimer = `${String(minutesRemaining).padStart(2, '0')}:${String(secondsRemaining).padStart(2, '0')}`;

  const orderSubtotal = useMemo(() => {
    if (!activeOrder?.items) return 0;
    return activeOrder.items.reduce((sum, item) => sum + (item.itemPrice * (item.quantity || 1)), 0);
  }, [activeOrder]);

  const orderGst = useMemo(() => calculateGST(orderSubtotal), [orderSubtotal]);
  const orderTotal = useMemo(() => {
    return activeOrder?.totalPaid || (orderSubtotal + orderGst + (activeOrder?.deliveryFee || 0) + (activeOrder?.handlingCharge || 15) - (activeOrder?.couponDiscount || 0));
  }, [orderSubtotal, orderGst, activeOrder]);

  const formatTimestamp = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  const handlePrintInvoice = useCallback((order) => {
    const orderId = order.id ? (order.id.startsWith("GC-") ? order.id : `GC-${order.id.substring(order.id.length - 5).toUpperCase()}`) : "GC-89421";
    const dateStr = formatTimestamp(order.timestamp);
    
    const subtotal = order.items.reduce((sum, item) => sum + (item.itemPrice * (item.quantity || 1)), 0);
    const gst = calculateGST(subtotal);
    const delivery = order.deliveryFee || 0;
    const handling = order.handlingCharge || 15;
    const discount = order.couponDiscount || 0;
    const total = order.totalPaid || (subtotal + gst + delivery + handling - discount);

    const printWindow = window.open("", "_blank", "width=500,height=700");
    if (!printWindow) {
      alert("Please allow pop-ups to download/print the invoice.");
      return;
    }

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">
          ${item.quantity || 1}x ${item.itemName} (${item.itemQuantity || '500g'})
          <div style="font-size: 11px; color: #666;">@ ${formatINR(item.itemPrice)} each</div>
        </td>
        <td style="text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; vertical-align: top; padding: 8px 0;">
          ${formatINR(item.itemPrice * (item.quantity || 1))}
        </td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>GroCart Invoice #${orderId}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; line-height: 1.4; }
            .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px; }
            .logo { font-size: 22px; font-weight: 900; color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            .totals td { padding: 4px 0; font-size: 13px; }
            .grand-total { border-top: 1px dashed #cbd5e1; font-weight: bold; font-size: 15px; padding-top: 8px; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GroCart</div>
            <p style="font-size: 12px; color: #64748b; margin: 4px 0;">Tax Invoice & Cash Receipt</p>
            <p style="font-size: 13px; font-weight: bold; margin: 4px 0;">Order #${orderId}</p>
            <p style="font-size: 11px; color: #64748b; margin: 0;">${dateStr}</p>
          </div>
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: left;">
                <th style="padding-bottom: 6px;">Item</th>
                <th style="text-align: right; padding-bottom: 6px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <table class="totals">
            <tr>
              <td>Items Subtotal</td>
              <td style="text-align: right;">${formatINR(subtotal)}</td>
            </tr>
            <tr>
              <td>GST (5%)</td>
              <td style="text-align: right;">${formatINR(gst)}</td>
            </tr>
            <tr>
              <td>Delivery Partner Fee</td>
              <td style="text-align: right;">${delivery === 0 ? "FREE" : formatINR(delivery)}</td>
            </tr>
            <tr>
              <td>Handling Charge</td>
              <td style="text-align: right;">${formatINR(handling)}</td>
            </tr>
            ${discount > 0 ? `
              <tr style="color: #10b981; font-weight: bold;">
                <td>Coupon Discount</td>
                <td style="text-align: right;">-${formatINR(discount)}</td>
              </tr>
            ` : ""}
            <tr class="grand-total">
              <td>Total Paid (${order.paymentMethod || "COD"})</td>
              <td style="text-align: right; color: #10b981;">${formatINR(total)}</td>
            </tr>
          </table>
          <div class="footer">
            Thank you for ordering with GroCart!<br/>
            FSSAI Lic. No: 10821005000421
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }, []);

  const handleReorder = (order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.productId || item.id,
        itemName: item.itemName,
        itemPrice: item.itemPrice,
        itemQuantity: item.itemQuantity || '500g',
        imageUrl: item.imageUrl,
        quantity: item.quantity || 1
      });
    });
    alert("All items from this order have been added to your cart!");
  };

  const currentOrderId = activeOrder?.id 
    ? (activeOrder.id.startsWith("GC-") ? activeOrder.id : `GC-${activeOrder.id.substring(activeOrder.id.length - 5).toUpperCase()}`) 
    : "GC-89421";

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      
      {/* Header with order info and download invoice */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-variant/40 dark:border-[#262626] pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display-lg text-on-surface dark:text-white text-2xl sm:text-3xl font-black">
              Order #{currentOrderId}
            </h1>
            <span className={`px-3 py-1 font-label-sm text-xs font-black rounded-full uppercase tracking-wider ${currentStage.color}`}>
              {currentStage.badge}
            </span>
          </div>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Placed on {formatTimestamp(activeOrder.timestamp)} • <span className="text-primary font-bold">{currentStage.statusText}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 px-3.5 py-2 rounded-2xl shadow-xs">
            <Clock size={16} className="text-primary animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">15-Min Delivery ETA</span>
              <span className="text-sm font-black font-mono text-on-surface dark:text-white">{formattedTimer} remaining</span>
            </div>
          </div>

          <button
            onClick={() => handlePrintInvoice(activeOrder)}
            className="px-4 py-2.5 bg-surface-container-low dark:bg-[#171717] border border-surface-variant/50 dark:border-[#262626] hover:border-primary text-on-surface dark:text-white hover:text-primary rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left side delivery status & items, right side bill summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Progress Tracker Stepper */}
          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 sm:p-8 border border-surface-variant/40 dark:border-[#262626] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-white">Delivery Progress</h3>
              <span className="text-xs font-bold text-primary font-mono">{formattedTimer} left</span>
            </div>
            
            <div className="relative flex items-center justify-between">
              <div className="absolute top-4 left-6 right-6 h-1 bg-surface-container dark:bg-[#201f1f] -translate-y-1/2 z-0" />
              <div 
                className="absolute top-4 left-6 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700" 
                style={{ width: `${currentStage.progressPct}%` }}
              />

              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  currentStage.step >= 1 ? 'bg-primary text-white dark:text-black' : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
                }`}>
                  <Check size={16} className="stroke-[3]" />
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 1 ? 'text-on-surface dark:text-white' : 'text-on-surface-variant'}`}>
                  Order Placed
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">Initial Status</span>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  currentStage.step >= 2 ? 'bg-primary text-white dark:text-black' : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
                }`}>
                  {currentStage.step >= 2 ? <Check size={16} className="stroke-[3]" /> : <Package size={14} />}
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 2 ? 'text-on-surface dark:text-white' : 'text-on-surface-variant'}`}>
                  Order Packed
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">3-7 mins</span>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  currentStage.step === 3 
                    ? 'bg-primary-container text-white shadow-emerald-500/30 animate-bounce' 
                    : currentStage.step > 3 
                      ? 'bg-primary text-white dark:text-black' 
                      : 'bg-surface-container dark:bg-[#201f1f] border border-surface-variant/40 dark:border-[#262626] text-on-surface-variant'
                }`}>
                  {currentStage.step > 3 ? (
                    <Check size={16} className="stroke-[3]" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  )}
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 3 ? 'text-primary font-black' : 'text-on-surface-variant'}`}>
                  Out for Delivery
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">7-14 mins</span>
              </div>

              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStage.step >= 4 
                    ? 'bg-primary text-white dark:text-black shadow-md' 
                    : 'bg-surface-container dark:bg-[#201f1f] border-2 border-surface-variant/60 dark:border-[#262626] text-on-surface-variant'
                }`}>
                  {currentStage.step >= 4 ? (
                    <Check size={16} className="stroke-[3]" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">home</span>
                  )}
                </div>
                <span className={`font-label-md text-xs ${currentStage.step >= 4 ? 'text-primary font-black' : 'text-on-surface-variant font-medium'}`}>
                  Delivered
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">15 mins</span>
              </div>
            </div>
          </div>

          {/* Delivery Driver & Dispatch Card */}
          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-5 sm:p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 dark:bg-primary/20 flex items-center justify-center text-primary font-black text-base">
                MK
              </div>
              <div>
                <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white">
                  {currentStage.driverText}
                </h4>
                <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                  {currentStage.driverSubtext}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSupportModal(true)}
              className="px-4 py-2.5 bg-surface-container dark:bg-[#201f1f] hover:bg-surface-container-high text-on-surface dark:text-white border border-surface-variant/40 dark:border-[#262626] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Phone size={14} />
              <span>Call Driver</span>
            </button>
          </div>

          {/* Items in this Order list */}
          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-white">Items in This Order</h3>
            <div className="divide-y divide-surface-variant/20 dark:divide-[#262626]">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container-lowest dark:bg-[#0e0e0e] border border-surface-variant/30 dark:border-[#262626]"
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/f1f5f9/10b981?text=Produce"; }}
                    />
                    <div>
                      <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white">{item.itemName}</h4>
                      <p className="text-xs text-on-surface-variant">{item.itemQuantity || '500g'} • Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <span className="font-headline-md text-sm font-black text-on-surface dark:text-white">
                    {formatINR(item.itemPrice * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Bill summary, address, and support */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          
          <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-base font-bold text-on-surface dark:text-white border-b border-surface-variant/30 dark:border-[#262626] pb-3">
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
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
                <span className="text-xs font-bold text-on-surface dark:text-white">{activeOrder.paymentMethod || "Cash on Delivery (COD)"}</span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase">PAID</span>
            </div>

            <div className="pt-3 border-t border-surface-variant/30 dark:border-[#262626] text-xs">
              <p className="font-bold text-on-surface dark:text-white mb-1">Delivery Address</p>
              <p className="text-on-surface-variant leading-relaxed">{activeOrder.deliveryAddress || "Customer Residence"}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-surface-tint to-primary dark:from-[#171717] dark:to-[#171717] border border-transparent dark:border-[#262626] rounded-3xl p-6 text-white shadow-md flex flex-col gap-3">
            <h4 className="font-headline-md text-base font-extrabold text-white">Need Help with your Order?</h4>
            <p className="text-xs text-white/90 dark:text-on-surface-variant leading-relaxed">
              Our 24/7 customer care team is available to assist with replacements, refunds, or delivery instructions.
            </p>
            <button
              onClick={() => setSupportModal(true)}
              className="mt-1 w-full py-2.5 bg-white text-primary dark:bg-[#201f1f] dark:text-white dark:border dark:border-[#353534] font-label-md text-xs font-bold rounded-xl hover:bg-white/90 transition-all cursor-pointer shadow-sm"
            >
              Contact Support
            </button>
          </div>

          {sortedOrders.length > 1 && (
            <div className="bg-surface-container-low dark:bg-[#171717] rounded-3xl p-6 border border-surface-variant/40 dark:border-[#262626] shadow-sm flex flex-col gap-3">
              <h4 className="font-headline-md text-sm font-bold text-on-surface dark:text-white">Other Recent Orders</h4>
              <div className="divide-y divide-surface-variant/20 dark:divide-[#262626]">
                {sortedOrders.slice(1, 4).map((ord, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-on-surface dark:text-white">#{ord.id ? ord.id.substring(ord.id.length - 6).toUpperCase() : `GC-${idx}`}</p>
                      <p className="text-[10px] text-on-surface-variant">{formatTimestamp(ord.timestamp)}</p>
                    </div>
                    <button
                      onClick={() => handleReorder(ord)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      Reorder
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Support Dialog */}
      {supportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#171717] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-variant/40 dark:border-[#262626] text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface dark:text-white">Contact Delivery Driver</h3>
            <p className="text-xs text-on-surface-variant mt-1">Michael is assigned to your delivery. You can reach him at:</p>
            <p className="font-headline-md text-base font-black text-primary mt-3">+91 98765 43210</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSupportModal(false)}
                className="flex-1 py-2.5 bg-surface-container-low dark:bg-[#201f1f] text-on-surface dark:text-white font-label-md text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <a
                href="tel:+919876543210"
                className="flex-1 py-2.5 bg-primary text-black font-label-md text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer"
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
