import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useOrders } from "../hooks/useOrders";
import { Download, Construction, CheckCircle, ShoppingBag } from "lucide-react";

export const OrdersScreen = React.memo(() => {
  const { orders, isLoading, isError } = useOrders();
  const [showWipDialog, setShowWipDialog] = useState(false);

  // Show the WIP dialog once when orders load for the first time
  useEffect(() => {
    if (orders && orders.length > 0) {
      setShowWipDialog(true);
    }
  }, [orders]);

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

  // Web-friendly native Invoice PDF/Print generator
  const handlePrintInvoice = useCallback((order) => {
    const receiptNum = String(order.timestamp).substring(String(order.timestamp).length - 6);
    const dateStr = formatTimestamp(order.timestamp);
    
    const subtotal = order.items.reduce((sum, item) => {
      const discountedPrice = Math.floor(item.itemPrice * 75 / 100);
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
      const discountedPrice = Math.floor(item.itemPrice * 75 / 100);
      const rowTotal = discountedPrice * item.quantity;
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
        <td style="padding: 4px 0; font-family: monospace; font-size: 13px; color: #16a34a;">Coupon Savings:</td>
        <td style="text-align: right; font-family: monospace; font-size: 13px; color: #16a34a; font-weight: bold;">- Rs. ${order.couponDiscount}</td>
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
            .header h1 { margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 2px; }
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
              <td style="text-align: right; font-family: monospace; font-size: 14px; font-weight: bold; padding: 8px; color: #16a34a;">Rs. ${totalPaid}</td>
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

  return (
    <div className="flex flex-col pb-28 select-none w-full max-w-7xl mx-auto min-h-screen bg-transparent relative px-4">
      {/* WIP Modal Alert */}
      {showWipDialog && (
        <div className="fixed inset-0 w-full h-full bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center p-6 animate-fade-in pointer-events-auto">
          <div className="bg-white dark:bg-[#111724] rounded-3xl p-6 w-full max-w-sm flex flex-col items-center text-center space-y-4 shadow-xl border border-gray-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-gradient-to-tr from-cyan-600 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-200 dark:shadow-none">
              <Construction className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">Order Placed! 🎉</h3>
            
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 w-full">
              <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold leading-relaxed">
                Your Order will Deliver Soon When App is Ready with Production.....
              </p>
              <div className="flex items-center justify-center space-x-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-violet-600 dark:text-violet-400">
                <span className="text-sm">🚧</span>
                <span className="text-xs font-black uppercase tracking-wider">Work In Progress</span>
              </div>
            </div>

            <button
              onClick={handleDismissWip}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer shadow-md"
            >
              <CheckCircle size={16} />
              <span>Got it!</span>
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length > 0 ? (
        <div className="flex flex-col space-y-6 pt-4 text-left">
          <h2 className="text-3xl font-black text-slate-850 dark:text-slate-100 tracking-tight">Order History</h2>

          {/* List Format Container */}
          <div className="bg-white dark:bg-[#111724] border border-slate-100 dark:border-slate-800/80 rounded-3xl shadow-sm dark:shadow-none divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
            {orders.slice().reverse().map(order => {
              const subtotal = order.items.reduce((sum, item) => {
                const discountedPrice = Math.floor(item.itemPrice * 75 / 100);
                return sum + (discountedPrice * item.quantity);
              }, 0);
              const handling = Math.floor(subtotal * 0.01);
              const delivery = 30;
              const displayTotal = order.totalPaid || (subtotal + handling + delivery - order.couponDiscount);
              const shortId = order.id ? order.id.substring(order.id.length - 8).toUpperCase() : String(order.timestamp).substring(String(order.timestamp).length - 6);

              return (
                <div 
                  key={order.timestamp}
                  className="p-6 hover:bg-slate-55/20 dark:hover:bg-slate-800/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left Column: Order metadata and item pills list */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">Order #{shortId}</span>
                      <span className="text-[11px] text-gray-400 dark:text-slate-500 font-bold">•</span>
                      <span className="text-xs text-gray-400 dark:text-slate-450 font-semibold">{formatTimestamp(order.timestamp)}</span>
                    </div>

                    {/* Inline item pills list */}
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(item => {
                        const itemDiscounted = Math.floor(item.itemPrice * 75 / 100);
                        return (
                          <div 
                            key={item.id} 
                            className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 rounded-full pl-1.5 pr-3 py-1 text-xs"
                          >
                            <img 
                              src={item.imageUrl} 
                              alt={item.itemName} 
                              className="w-5 h-5 object-cover rounded-full bg-white dark:bg-[#151C2C] flex-shrink-0"
                              onError={(e) => { e.target.src = "https://placehold.co/20x20/f1f5f9/7c3aed?text=I"; }}
                            />
                            <span className="font-black text-violet-600 dark:text-violet-400">{item.quantity}x</span>
                            <span className="text-slate-600 dark:text-slate-350 font-semibold truncate max-w-[120px]">{item.itemName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Total paid amount and Action buttons */}
                  <div className="flex items-center justify-between md:justify-end space-x-6 border-t border-slate-50 dark:border-slate-800/40 pt-4 md:border-none md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="block text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Paid</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{displayTotal}</span>
                    </div>

                    <button
                      onClick={() => handlePrintInvoice(order)}
                      className="px-4 py-2 border border-cyan-200 dark:border-violet-900/50 text-violet-600 dark:text-violet-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 text-xs font-black rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Download size={14} />
                      <span>Invoice</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center min-h-[calc(100vh-140px)]">
          <img src="/empty_box.webp" alt="No Orders" className="w-40 h-40 object-contain mb-6 opacity-60" />
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-200">No Orders Yet</h3>
          <p className="text-sm text-gray-400 dark:text-slate-400 mt-2 max-w-xs mx-auto">
            Your shopping journey hasn't started yet. Let's find something for you!
          </p>
        </div>
      )}
    </div>
  );
});

OrdersScreen.displayName = "OrdersScreen";

