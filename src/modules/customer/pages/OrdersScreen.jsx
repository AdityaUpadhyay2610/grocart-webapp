import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useOrders } from "../hooks/useOrders";
import { useCart } from "../state/CartContext";
import { formatINR, calculateGST } from "@global/utils/calculations";
import { Download, Check, Phone, MessageSquare, MapPin, X, ArrowRight, ShieldCheck, Clock, RotateCcw, FastForward, Package, Sparkles } from "lucide-react";

const TOTAL_ORDER_SECONDS = 15 * 60; // 15 minutes = 900 seconds

export const OrdersScreen = React.memo(() => {
  const { orders = [], isLoading, updateOrderStatus } = useOrders();
  const { addToCart } = useCart();

  const [activeOrderIndex, setActiveOrderIndex] = useState(0);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [supportModal, setSupportModal] = useState(false);

  // 15-minute live countdown timer state in seconds (starts at 15:00 = 900s)
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_ORDER_SECONDS);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [orders]);

  // Fallback demo order if no orders in Firebase yet
  const activeOrder = useMemo(() => {
    if (sortedOrders.length > 0) {
      return sortedOrders[activeOrderIndex] || sortedOrders[0];
    }
    return {
      id: "GC-89421",
      timestamp: Date.now(),
      status: "placed", // initial status
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

  // Timer interval: counts down every second across 15 minutes
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused]);

  // Reset timer when switching active orders
  useEffect(() => {
    if (activeOrder?.timestamp) {
      const elapsed = Math.floor((Date.now() - activeOrder.timestamp) / 1000);
      if (elapsed >= 0 && elapsed < TOTAL_ORDER_SECONDS) {
        setRemainingSeconds(TOTAL_ORDER_SECONDS - elapsed);
      } else {
        setRemainingSeconds(TOTAL_ORDER_SECONDS);
      }
    } else {
      setRemainingSeconds(TOTAL_ORDER_SECONDS);
    }
  }, [activeOrder]);

  // Derive dynamic order status based on remaining time in 15-minute window
  const currentStage = useMemo(() => {
    // Stage 1: Order Placed (Minutes 15:00 - 12:00 left / 0-3 mins elapsed)
    if (remainingSeconds > 12 * 60) {
      return {
        step: 1,
        key: "placed",
        label: "Order Placed",
        badge: "Order Confirmed",
        color: "text-primary bg-primary/15",
        progressPct: 15,
        statusText: "Dark Store is picking your organic items",
        driverText: "Assigning delivery driver at Dark Store Hub 04",
        driverSubtext: "1.8 miles away • Estimated 15 mins to doorstep",
        timeEstimate: `${Math.ceil(remainingSeconds / 60)} mins`
      };
    }
    // Stage 2: Order Packed (Minutes 12:00 - 08:00 left / 3-7 mins elapsed)
    if (remainingSeconds > 8 * 60) {
      return {
        step: 2,
        key: "packed",
        label: "Order Packed",
        badge: "Packed & Ready",
        color: "text-amber-600 bg-amber-500/15",
        progressPct: 45,
        statusText: "Items freshly packed in eco-bags and handed to courier",
        driverText: "Driver assigned & vehicle loaded",
        driverSubtext: "1.4 miles away • Estimated 10 mins to doorstep",
        timeEstimate: `${Math.ceil(remainingSeconds / 60)} mins`
      };
    }
    // Stage 3: Out for Delivery (Minutes 08:00 - 01:00 left / 7-14 mins elapsed)
    if (remainingSeconds > 60) {
      return {
        step: 3,
        key: "out_for_delivery",
        label: "Out for Delivery",
        badge: "Out for Delivery",
        color: "text-emerald-600 bg-emerald-500/15",
        progressPct: 80,
        statusText: "Michael is on his electric scooter heading to your doorstep",
        driverText: "Michael is on his way (Electric Scooter)",
        driverSubtext: "0.6 miles away • Arriving soon",
        timeEstimate: `${Math.ceil(remainingSeconds / 60)} mins`
      };
    }
    // Stage 4: Delivered (Last 1 min / 0s remaining)
    return {
      step: 4,
      key: "delivered",
      label: "Delivered",
      badge: "Delivered Successfully",
      color: "text-green-600 bg-green-500/15",
      progressPct: 100,
      statusText: "Order arrived at your doorstep. Enjoy your fresh groceries!",
      driverText: "Order Delivered at Doorstep",
      driverSubtext: "Package handed over safely • 0 mins",
      timeEstimate: "Arrived"
    };
  }, [remainingSeconds]);

  // Fast-forward or set timer stage for quick preview
  const jumpToStage = (seconds) => {
    setRemainingSeconds(seconds);
  };

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
            body { font-family: sans-serif; padding: 30px; color: #111; max-width: 420px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; color: #006C49; font-weight: 900; }
            .divider { border-top: 1px dashed #ccc; margin: 15px 0; }
            .info { width: 100%; font-size: 12px; margin-bottom: 10px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .totals { width: 100%; font-size: 13px; }
            .total-row { font-weight: bold; font-size: 16px; color: #006C49; }
            .footer { text-align: center; font-size: 11px; color: #888; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GroCart</h1>
            <p style="font-size: 12px; color: #666; margin: 4px 0;">Organic Quick-Commerce Delivery</p>
          </div>
          <div class="divider"></div>
          <table class="info">
            <tr><td><strong>Invoice #:</strong> ${orderId}</td></tr>
            <tr><td><strong>Date:</strong> ${dateStr}</td></tr>
            <tr><td><strong>Delivery Address:</strong> ${order.deliveryAddress || "Customer Address"}</td></tr>
          </table>
          <div class="divider"></div>
          <table class="items">
            <thead>
              <tr style="border-bottom: 1px solid #eee; text-align: left; font-size: 12px; color: #888;">
                <th style="padding-bottom: 6px;">ITEM</th>
                <th style="text-align: right; padding-bottom: 6px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div class="divider"></div>
          <table class="totals">
            <tr><td>Items Subtotal:</td><td style="text-align: right;">${formatINR(subtotal)}</td></tr>
            <tr><td>GST (5%):</td><td style="text-align: right;">${formatINR(gst)}</td></tr>
            <tr><td>Delivery:</td><td style="text-align: right;">${delivery === 0 ? "FREE" : formatINR(delivery)}</td></tr>
            <tr><td>Handling Fee:</td><td style="text-align: right;">${formatINR(handling)}</td></tr>
            ${discount > 0 ? `<tr style="color: #006C49;"><td>Discount:</td><td style="text-align: right;">-${formatINR(discount)}</td></tr>` : ''}
            <tr><td colspan="2"><div style="border-top: 1px solid #ddd; margin: 8px 0;"></div></td></tr>
            <tr class="total-row"><td>TOTAL PAID:</td><td style="text-align: right;">${formatINR(total)}</td></tr>
          </table>
          <div class="footer">
            <p>🌿 100% Sustainably Packed & Sourced</p>
            <p>Thank you for choosing GroCart!</p>
          </div>
          <script>
            window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const handleReorder = (order) => {
    if (!order?.items) return;
    order.items.forEach(item => addToCart(item));
    alert("All items from this order have been added to your cart!");
  };

  const currentOrderId = activeOrder?.id 
    ? (activeOrder.id.startsWith("GC-") ? activeOrder.id : `GC-${activeOrder.id.substring(activeOrder.id.length - 5).toUpperCase()}`) 
    : "GC-89421";

  return (
    <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-10 pb-32 select-none min-h-screen text-left animate-fade-in gap-8">
      
      {/* ── 1. HEADER WITH 15-MINUTE TIMER & INVOICE BUTTON ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-surface-variant/40 pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display-lg text-on-surface text-2xl sm:text-3xl font-black">
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
          {/* Live 15-Min Timer Countdown Pill */}
          <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 px-3.5 py-2 rounded-2xl shadow-xs">
            <Clock size={16} className="text-primary animate-spin" style={{ animationDuration: '6s' }} />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary">15-Min Delivery ETA</span>
              <span className="text-sm font-black font-mono text-on-surface">{formattedTimer} remaining</span>
            </div>
          </div>

          <button
            onClick={() => handlePrintInvoice(activeOrder)}
            className="px-4 py-2.5 bg-surface-container-lowest border border-surface-variant/50 hover:border-primary text-on-surface hover:text-primary rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Invoice</span>
          </button>
        </div>
      </div>

      {/* ── 2. MAIN 12-COLUMN LAYOUT (8 cols Tracking + 4 cols Bill & Help) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── Left: Tracking Stepper, Live Map, & Items Accordion (8 cols) ── */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* 4-Step Tracking Stepper Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 border border-surface-variant/40 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-base font-bold text-on-surface">Delivery Progress</h3>
              <span className="text-xs font-bold text-primary font-mono">{formattedTimer} left</span>
            </div>
            
            <div className="relative flex items-center justify-between">
              {/* Connecting Bar */}
              <div className="absolute top-4 left-6 right-6 h-1 bg-surface-variant/40 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-4 left-6 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-700" 
                style={{ width: `${currentStage.progressPct}%` }}
              />

              {/* Step 1: Order Placed */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  currentStage.step >= 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-low border border-surface-variant text-slate-text'
                }`}>
                  <Check size={16} className="stroke-[3]" />
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 1 ? 'text-on-surface' : 'text-slate-text'}`}>
                  Order Placed
                </span>
                <span className="text-[10px] text-slate-text font-medium">Initial Status</span>
              </div>

              {/* Step 2: Order Packed */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${
                  currentStage.step >= 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-low border border-surface-variant text-slate-text'
                }`}>
                  {currentStage.step >= 2 ? <Check size={16} className="stroke-[3]" /> : <Package size={14} />}
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 2 ? 'text-on-surface' : 'text-slate-text'}`}>
                  Order Packed
                </span>
                <span className="text-[10px] text-slate-text font-medium">3-7 mins</span>
              </div>

              {/* Step 3: Out for Delivery */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  currentStage.step === 3 
                    ? 'bg-primary-container text-white shadow-emerald-500/30 animate-bounce' 
                    : currentStage.step > 3 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface-container-low border border-surface-variant text-slate-text'
                }`}>
                  {currentStage.step > 3 ? (
                    <Check size={16} className="stroke-[3]" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                  )}
                </div>
                <span className={`font-label-md text-xs font-bold ${currentStage.step >= 3 ? 'text-primary font-black' : 'text-slate-text'}`}>
                  Out for Delivery
                </span>
                <span className="text-[10px] text-slate-text font-medium">7-14 mins</span>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  currentStage.step >= 4 
                    ? 'bg-primary text-on-primary shadow-md' 
                    : 'bg-surface-container-low border-2 border-surface-variant/60 text-slate-text'
                }`}>
                  {currentStage.step >= 4 ? (
                    <Check size={16} className="stroke-[3]" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px]">home</span>
                  )}
                </div>
                <span className={`font-label-md text-xs ${currentStage.step >= 4 ? 'text-green-600 font-black' : 'text-slate-text font-medium'}`}>
                  Delivered
                </span>
                <span className="text-[10px] text-slate-text font-medium">15 mins</span>
              </div>
            </div>
          </div>

          {/* Live Tracking Map Preview Card */}
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-surface-variant/40 shadow-sm relative flex flex-col min-h-[300px]">
            {/* Stylized Map View */}
            <div className="h-72 w-full bg-[#e5f5ed] dark:bg-[#0c1f17] relative overflow-hidden flex items-center justify-center">
              {/* Map grid lines overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#006c4910_1px,transparent_1px),linear-gradient(to_bottom,#006c4910_1px,transparent_1px)] bg-[size:28px_28px]" />
              
              {/* Route Line SVG */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M 120 220 Q 250 140, 420 180 T 700 90" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="5" 
                  strokeDasharray="8 6"
                  className={currentStage.step >= 3 ? "animate-pulse" : "opacity-40"}
                />
              </svg>

              {/* Destination Pin */}
              <div className="absolute top-16 right-24 flex flex-col items-center z-10">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                  currentStage.step === 4 ? 'bg-green-600 text-white' : 'bg-primary text-on-primary'
                }`}>
                  <MapPin size={18} />
                </div>
                <span className="px-2 py-0.5 bg-white dark:bg-[#111724] rounded text-[10px] font-bold text-on-surface shadow-xs mt-1">
                  Delivery Address
                </span>
              </div>

              {/* Moving Delivery Driver Marker (Active during Stage 3 & 4) */}
              <div className={`absolute transition-all duration-1000 flex flex-col items-center z-20 ${
                currentStage.step === 1 ? 'top-48 left-28 opacity-75' :
                currentStage.step === 2 ? 'top-40 left-36 opacity-90' :
                currentStage.step === 3 ? 'top-32 left-1/2 animate-pulse' :
                'top-20 right-28'
              }`}>
                <div className="w-11 h-11 bg-primary-container text-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-white">
                  {currentStage.step === 4 ? (
                    <Check size={22} className="stroke-[3]" />
                  ) : currentStage.step <= 2 ? (
                    <Package size={22} />
                  ) : (
                    <span className="material-symbols-outlined text-[24px]">electric_scooter</span>
                  )}
                </div>
              </div>

              {/* Floating Driver Callout Banner */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-[#111724]/90 backdrop-blur-md rounded-2xl p-4 border border-surface-variant/40 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                    MK
                  </div>
                  <div>
                    <h4 className="font-headline-md text-sm font-bold text-on-surface">{currentStage.driverText}</h4>
                    <p className="font-body-md text-xs text-on-surface-variant">{currentStage.driverSubtext}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setSupportModal(true)}
                    className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Phone size={14} />
                    <span>Call Driver</span>
                  </button>
                  <button 
                    onClick={() => setShowRouteModal(true)}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer"
                  >
                    View Full Route
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Order Products List */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-base font-bold text-on-surface">Items in This Order</h3>
            <div className="divide-y divide-surface-variant/20">
              {activeOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.itemName} 
                      className="w-12 h-12 rounded-xl object-cover bg-surface-container-low border border-surface-variant/30"
                      onError={(e) => { e.target.src = "https://placehold.co/80x80/f1f5f9/10b981?text=Produce"; }}
                    />
                    <div>
                      <h4 className="font-headline-md text-sm font-bold text-on-surface">{item.itemName}</h4>
                      <p className="text-xs text-on-surface-variant">{item.itemQuantity || '500g'} • Qty: {item.quantity || 1}</p>
                    </div>
                  </div>
                  <span className="font-headline-md text-sm font-black text-on-surface">
                    {formatINR(item.itemPrice * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Itemized Bill, Payment, & Support (4 cols) ── */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
          
          {/* Bill Breakdown Card */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-4">
            <h3 className="font-headline-md text-base font-bold text-on-surface border-b border-surface-variant/30 pb-3">
              Payment Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-on-surface">{formatINR(orderSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-on-surface">{formatINR(orderGst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-bold text-primary">
                  {activeOrder.deliveryFee === 0 ? "FREE" : formatINR(activeOrder.deliveryFee || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Handling Fee</span>
                <span className="font-bold text-on-surface">{formatINR(activeOrder.handlingCharge || 15)}</span>
              </div>
              {activeOrder.couponDiscount > 0 && (
                <div className="flex justify-between font-bold text-primary">
                  <span>Coupon Discount</span>
                  <span>-{formatINR(activeOrder.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between items-baseline pt-3 border-t border-surface-variant/30 text-base font-black text-on-surface">
                <span>Total Paid</span>
                <span className="text-lg text-primary">{formatINR(orderTotal)}</span>
              </div>
            </div>

            {/* Payment Method Badge */}
            <div className="mt-2 bg-surface-container-low rounded-xl p-3 flex items-center justify-between border border-surface-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">account_balance_wallet</span>
                <span className="text-xs font-bold text-on-surface">{activeOrder.paymentMethod || "Cash on Delivery (COD)"}</span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase">PAID</span>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-gradient-to-br from-surface-tint to-primary rounded-3xl p-6 text-white shadow-md flex flex-col gap-3">
            <h4 className="font-headline-md text-base font-extrabold">Need Help with your Order?</h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Our 24/7 customer care team is available to assist with replacements, refunds, or delivery instructions.
            </p>
            <button
              onClick={() => setSupportModal(true)}
              className="mt-1 w-full py-2.5 bg-white text-primary font-label-md text-xs font-bold rounded-xl hover:bg-surface-container-lowest transition-all cursor-pointer shadow-sm"
            >
              Contact Support
            </button>
          </div>

          {/* Past Orders Mini-List (if multiple orders exist) */}
          {sortedOrders.length > 1 && (
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-variant/40 shadow-sm flex flex-col gap-3">
              <h4 className="font-headline-md text-sm font-bold text-on-surface">Other Recent Orders</h4>
              <div className="divide-y divide-surface-variant/20">
                {sortedOrders.slice(1, 4).map((ord, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-on-surface">#{ord.id ? ord.id.substring(ord.id.length - 6).toUpperCase() : `GC-${idx}`}</p>
                      <p className="text-[10px] text-slate-text">{formatTimestamp(ord.timestamp)}</p>
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

      {/* ── FULL ROUTE MODAL ── */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-surface-variant/40 text-left">
            <div className="flex justify-between items-center pb-4 border-b border-surface-variant/30">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">navigation</span>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Live Delivery Route</h3>
              </div>
              <button onClick={() => setShowRouteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
                <div>
                  <p className="font-bold text-on-surface">Dispatched from GroCart Dark Store 04</p>
                  <p className="text-on-surface-variant">DLF Phase 2 Hub, Gurugram</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">2</div>
                <div>
                  <p className="font-bold text-on-surface">In Transit via Golf Course Road</p>
                  <p className="text-primary font-semibold">Driver currently en route (Speed: 28 km/h)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">3</div>
                <div>
                  <p className="font-bold text-on-surface">Destination</p>
                  <p className="text-on-surface-variant">{activeOrder.deliveryAddress || "Customer Residence"}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRouteModal(false)}
              className="mt-2 w-full py-2.5 bg-primary text-on-primary font-label-md rounded-xl font-bold cursor-pointer"
            >
              Close Route
            </button>
          </div>
        </div>
      )}

      {/* ── SUPPORT MODAL ── */}
      {supportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-surface-variant/40 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Phone size={24} />
            </div>
            <h3 className="font-headline-md text-lg font-bold text-on-surface">Contact Delivery Driver</h3>
            <p className="text-xs text-on-surface-variant mt-1">Michael is assigned to your delivery. You can reach him at:</p>
            <p className="font-headline-md text-base font-black text-primary mt-3">+91 98765 43210</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSupportModal(false)}
                className="flex-1 py-2.5 bg-surface-container-low text-on-surface font-label-md text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
              <a
                href="tel:+919876543210"
                className="flex-1 py-2.5 bg-primary text-on-primary font-label-md text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer"
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
