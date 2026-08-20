import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOrders } from "../hooks/useOrders";
import { Download, Construction, CheckCircle, ShoppingBag, Clock, Package, Bike, Home, Check, ChevronDown, ChevronUp } from "lucide-react";

export const OrdersScreen = React.memo(() => {
  const { orders, isLoading, isError, updateOrderStatus } = useOrders();
  const [showWipDialog, setShowWipDialog] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  
  // Track overridden start times when a user clicks "Track Order" or for the auto-expanded order
  const [trackingStartTimeOverrides, setTrackingStartTimeOverrides] = useState({});
  const [now, setNow] = useState(Date.now());

  // Update timer every 4 seconds for live tracking ticks
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Show the WIP dialog once when orders load for the first time
  useEffect(() => {
    if (orders && orders.length > 0) {
      setShowWipDialog(true);
      // Auto expand the latest order for tracking
      const sorted = [...orders].sort((a, b) => b.timestamp - a.timestamp);
      if (sorted.length > 0) {
        const latestOrder = sorted[0];
        setExpandedOrderId(latestOrder.timestamp);
        // Initialize its tracking start time to now so it starts from 0/Confirmed
        setTrackingStartTimeOverrides(prev => ({
          ...prev,
          [latestOrder.timestamp]: Date.now()
        }));
      }
    }
  }, [orders]);

  const handleTrackClick = useCallback((order) => {
    const isCurrentlyExpanded = expandedOrderId === order.timestamp;
    if (!isCurrentlyExpanded) {
      setExpandedOrderId(order.timestamp);
      // Reset/initialize tracking start time to now
      setTrackingStartTimeOverrides(prev => ({
        ...prev,
        [order.timestamp]: Date.now()
      }));
    } else {
      setExpandedOrderId(null);
    }
  }, [expandedOrderId]);

  const handleDismissWip = useCallback(() => {
    setShowWipDialog(false);
  }, []);

  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }, []);

  const formatTimeOnly = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }, []);

  // Web-friendly native Invoice PDF/Print generator
  const handlePrintInvoice = useCallback((order) => {
    const receiptNum = String(order.timestamp).substring(String(order.timestamp).length - 6);
    const dateStr = formatTimestamp(order.timestamp);
    
    const subtotal = order.items.reduce((sum, item) => {
      const discountedPrice = Math.round(item.itemPrice);
      return sum + (discountedPrice * item.quantity);
    }, 0);
    const handling = Math.floor(subtotal * 0.01);
    const delivery = 30;
    const totalPaid = order.totalPaid || (subtotal + handling + delivery - order.couponDiscount);

    // Build print HTML document mimicking narrow receipt tape
    const printWindow = window.open("", "_blank", "width=450,height=700");
    if (!printWindow) {
      alert("Please allow pop-ups to download/print the invoice.");
      return;
    }

    const itemsRows = order.items.map(item => {
      const discountedPrice = Math.round(item.itemPrice);
      const rowTotal = Math.round(discountedPrice * item.quantity);
      return `
        <tr>
          <td style="padding: 6px 0; font-family: monospace; font-size: 13px;">
            ${item.quantity}x ${item.itemName.substring(0, 20)}${item.itemName.length > 20 ? '...' : ''}
            <div style="font-size: 11px; color: gray; margin-left: 20px;">@ Rs. ${discountedPrice} each</div>
          </td>
          <td style="text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; vertical-align: top; padding: 6px 0;">
            Rs. ${rowTotal}
          </td>
        </tr>
      `;
    }).join("");

    const couponRow = order.couponDiscount > 0 ? `
      <tr>
        <td style="padding: 4px 0; font-family: monospace; font-size: 13px; color: #10b981;">Coupon Savings:</td>
        <td style="text-align: right; font-family: monospace; font-size: 13px; color: #10b981; font-weight: bold;">- Rs. ${order.couponDiscount}</td>
      </tr>
    ` : "";

    printWindow.document.write(`
      <html>
        <head>
          <title>GroCart Invoice #${receiptNum}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; }
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 20px;
              color: #000;
              width: 380px;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 25px; }
            .header h1 { margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 2px; color: #10b981; }
            .header p { margin: 4px 0; font-size: 12px; color: #555; }
            .divider { border-top: 1px dashed #bbb; margin: 15px 0; }
            .info-table { width: 100%; font-size: 12px; margin-bottom: 15px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            .totals-table { width: 100%; font-size: 13px; margin-top: 10px; }
            .total-paid-row { background-color: #f0fdf4; font-weight: bold; font-size: 15px; }
            .footer { text-align: center; font-size: 11px; color: #555; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GROCART</h1>
            <p>Fresh Groceries at your door</p>
            <p>123 Market Street, Cityville</p>
            <p>Tel: +1 234 567 8900</p>
          </div>
          
          <div class="divider"></div>
          
          <table class="info-table">
            <tr><td>Receipt #: ${order.id ? order.id.substring(order.id.length - 8).toUpperCase() : receiptNum}</td></tr>
            <tr><td>Date: ${dateStr}</td></tr>
          </table>
          
          <div class="divider"></div>
          
          <table class="items-table">
            <thead>
              <tr style="border-bottom: 1px dashed #bbb;">
                <th style="text-align: left; font-size: 13px; padding-bottom: 5px;">Qty & Item</th>
                <th style="text-align: right; font-size: 13px; padding-bottom: 5px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <table class="totals-table">
            <tr>
              <td style="padding: 4px 0; font-family: monospace; font-size: 13px;">Subtotal:</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px;">Rs. ${subtotal}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-family: monospace; font-size: 13px;">Handling (1%):</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px;">Rs. ${handling}</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-family: monospace; font-size: 13px;">Delivery Fee:</td>
              <td style="text-align: right; font-family: monospace; font-size: 13px;">Rs. ${delivery}</td>
            </tr>
            ${couponRow}
            <tr><td colspan="2"><div style="border-top: 1px dashed #bbb; margin: 8px 0;"></div></td></tr>
            <tr class="total-paid-row">
              <td style="padding: 8px; font-family: monospace; font-size: 14px; font-weight: bold;">TOTAL PAID:</td>
              <td style="text-align: right; font-family: monospace; font-size: 14px; font-weight: bold; padding: 8px; color: #10b981;">Rs. ${totalPaid}</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>Thank you for shopping with GroCart!</p>
            <p>Please come again.</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, [formatTimestamp]);

  const renderTimelineNode = (stageType, label, isCompleted, timeStr) => {
    let NodeIcon = Clock;
    if (stageType === "Placed") NodeIcon = CheckCircle;
    else if (stageType === "Packed") NodeIcon = Package;
    else if (stageType === "Delivery") NodeIcon = Bike;
    else if (stageType === "Delivered") NodeIcon = Home;

    return (
      <div className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 md:space-y-2 z-20 flex-1 w-full md:w-auto relative">
        {/* Circle Icon wrapper */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${
          isCompleted 
            ? "bg-primary-500 border-primary-500 text-white" 
            : "bg-white dark:bg-[#111724] border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500"
        }`}>
          {isCompleted ? <Check size={15} className="stroke-[3]" /> : <NodeIcon size={15} />}
        </div>
        
        {/* Label and timing detail */}
        <div className="text-left md:text-center">
          <p className={`text-xs font-black leading-tight ${isCompleted ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}`}>
            {label}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5 tracking-tight">{timeStr}</p>
        </div>
      </div>
    );
  };

  const getEstTimeStr = (stageType, timestamp, elapsedMins) => {
    if (stageType === "Placed") {
      return formatTimeOnly(timestamp);
    }
    if (stageType === "Packed") {
      return elapsedMins >= 1 ? formatTimeOnly(timestamp + 60000) : "Est: 1 min";
    }
    if (stageType === "Delivery") {
      return elapsedMins >= 2.5 ? formatTimeOnly(timestamp + 150000) : "Est: 3 mins";
    }
    if (stageType === "Delivered") {
      return elapsedMins >= 5 ? formatTimeOnly(timestamp + 300000) : "Est: 5 mins";
    }
    return "";
  };

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent relative px-4 animate-fade-in">
      {/* WIP Modal Alert */}
      {showWipDialog && (
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center space-y-4 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-gradient-to-tr from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-500/10 dark:shadow-none">
              <Construction className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Order Placed! 🎉</h3>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 w-full text-left">
              <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold leading-relaxed">
                Your Order will Deliver Soon When App is Ready with Production.....
              </p>
              <div className="flex items-center justify-center space-x-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-primary-600 dark:text-primary-400">
                <span className="text-sm">🚧</span>
                <span className="text-xs font-black uppercase tracking-wider">Work In Progress</span>
              </div>
            </div>

            <button
              onClick={handleDismissWip}
              className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer shadow-md"
            >
              <CheckCircle size={16} />
              <span>Got it!</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex flex-col space-y-6 pt-4 text-left">
          <h2 className="text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Order History</h2>

          {/* List Format Container */}
          <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm dark:shadow-none divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {orders.slice().sort((a, b) => b.timestamp - a.timestamp).map(order => {
              const subtotal = order.items.reduce((sum, item) => {
                const discountedPrice = Math.round(item.itemPrice);
                return sum + (discountedPrice * item.quantity);
              }, 0);
              const handling = Math.floor(subtotal * 0.01);
              const delivery = 30;
              const displayTotal = order.totalPaid || (subtotal + handling + delivery - order.couponDiscount);
              const shortId = order.id ? order.id.substring(order.id.length - 8).toUpperCase() : String(order.timestamp).substring(String(order.timestamp).length - 6);

              const isExpanded = expandedOrderId === order.timestamp;
              const startTime = trackingStartTimeOverrides[order.timestamp] || order.timestamp;
              const elapsedMins = (now - startTime) / (60 * 1000);

              return (
                <div 
                  key={order.timestamp}
                  className="p-6 transition-colors flex flex-col gap-5 text-left"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left Column: Order metadata and item pills list */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">Order #{shortId}</span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold">•</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{formatTimestamp(order.timestamp)}</span>
                      </div>

                      {/* Inline item pills list */}
                      <div className="flex flex-wrap gap-2 text-left">
                        {order.items.map(item => {
                          return (
                            <div 
                              key={item.id} 
                              className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 border border-slate-100/50 dark:border-slate-800/60 rounded-full pl-1.5 pr-3 py-1 text-xs text-left"
                            >
                              <img 
                                src={item.imageUrl} 
                                alt={item.itemName} 
                                className="w-5 h-5 object-cover rounded-full bg-white dark:bg-[#111724] flex-shrink-0"
                                onError={(e) => { e.target.src = "https://placehold.co/20x20/f1f5f9/10b981?text=I"; }}
                              />
                              <span className="font-black text-primary-600 dark:text-primary-400">{item.quantity}x</span>
                              <span className="text-slate-600 dark:text-slate-355 font-semibold truncate max-w-[120px]">{item.itemName}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: Total paid amount and Action buttons */}
                    <div className="flex items-center justify-between md:justify-end space-x-6 border-t border-slate-50 dark:border-slate-800/40 pt-4 md:border-none md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Paid</span>
                        <span className="text-lg font-black text-primary-600 dark:text-primary-400 font-mono">₹{displayTotal}</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        {order.status !== 'cancelled' && order.status !== 'returned' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to ${order.status === 'delivered' ? 'return' : 'cancel'} this order?`)) {
                                updateOrderStatus(order.id, order.status === 'delivered' ? 'returned' : 'cancelled');
                              }
                            }}
                            className="px-4 py-2 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-450 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-black rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                          >
                            <span>{order.status === 'delivered' ? 'Return Order' : 'Cancel Order'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleTrackClick(order)}
                          className="px-4 py-2 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-xs font-black rounded-xl flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <span>Track Order</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="px-4 py-2 border border-primary-100 dark:border-primary-900/50 text-primary-600 dark:text-primary-450 hover:bg-primary-50 dark:hover:bg-primary-950/20 text-xs font-black rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Download size={14} />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Order Tracking Timeline */}
                  {isExpanded && (
                    <div className="mt-2 p-5 bg-slate-50 dark:bg-[#0c101a] border border-slate-100 dark:border-slate-800/60 rounded-2xl animate-fade-in text-left">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/40 pb-3">
                        <h4 className="text-[11px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-wider">Live Delivery Tracker</h4>
                        {order.status === 'cancelled' || order.status === 'returned' ? (
                          <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-0.5 rounded-md">
                            ORDER {order.status.toUpperCase()}
                          </span>
                        ) : elapsedMins < 5 ? (
                          <span className="text-[10px] font-black text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/20 px-2 py-0.5 rounded-md animate-pulse">
                            ARRIVING IN {Math.ceil(5 - elapsedMins)} MIN{Math.ceil(5 - elapsedMins) > 1 ? 'S' : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-accent-600 dark:text-accent-450 bg-accent-50 dark:bg-accent-950/20 px-2.5 py-0.5 rounded-md animate-pulse">
                            PENDING DELIVERY (APP IN DEV)
                          </span>
                        )}
                      </div>

                      {/* Timeline Nodes Row */}
                      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 my-6 px-2">
                        
                        {/* Background connecting bar (Desktop only) */}
                        <div className="absolute top-4.5 left-0 right-0 h-[3px] bg-slate-200 dark:bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
                        
                        {/* Active connecting bar (Desktop only) - Maximum progress is Out for Delivery (66%) */}
                        <div 
                          className="absolute top-4.5 left-0 h-[3px] bg-primary-500 -translate-y-1/2 hidden md:block z-10 transition-all duration-700"
                          style={{
                            width: `${
                              elapsedMins >= 2.5 ? 66 :
                              elapsedMins >= 1 ? 33 : 0
                            }%`
                          }}
                        />

                        {/* Stage 1: Order Placed */}
                        {renderTimelineNode("Placed", "Order Confirmed", true, getEstTimeStr("Placed", startTime, elapsedMins))}

                        {/* Stage 2: Packed */}
                        {renderTimelineNode("Packed", "Packed & Prepared", elapsedMins >= 1, getEstTimeStr("Packed", startTime, elapsedMins))}

                        {/* Stage 3: Out for Delivery */}
                        {renderTimelineNode("Delivery", "Out for Delivery", elapsedMins >= 2.5, getEstTimeStr("Delivery", startTime, elapsedMins))}

                        {/* Stage 4: Delivered (Stays uncompleted as actual delivery is suspended) */}
                        {renderTimelineNode("Delivered", "Delivered", false, "Pending")}

                      </div>

                      {/* Rider Details (Only shown when order is Out for Delivery) */}
                      {elapsedMins >= 2.5 && (
                        <div className="mt-5 p-4 bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center space-x-3.5 text-left">
                            <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                              <Bike size={20} className="animate-bounce" />
                            </div>
                            <div className="text-left">
                              <h5 className="text-xs font-black text-slate-850 dark:text-slate-200">Ramesh Kumar (Delivery Agent)</h5>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Mobile: +91 98765 43210</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-xs font-black text-primary-600 dark:text-primary-400">
                            <span className="relative flex h-2 w-2 mr-0.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            <span>{elapsedMins >= 5 ? "Arriving shortly (Actual delivery suspended)" : "On the way (Scooter delivery)"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center min-h-[calc(100vh-140px)]">
          <img src="/empty_box.webp" alt="No Orders" className="w-40 h-40 object-contain mb-6 opacity-60" />
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">No Orders Yet</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xs mx-auto font-semibold">
            Your shopping journey hasn't started yet. Let's find something fresh for you!
          </p>
        </div>
      )}
    </div>
  );
});

OrdersScreen.displayName = "OrdersScreen";
