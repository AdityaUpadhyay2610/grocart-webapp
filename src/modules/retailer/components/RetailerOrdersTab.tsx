import React from 'react';
import { ChevronUp, ChevronDown, Printer, Download, RefreshCw, PackageSearch, ArrowRight } from 'lucide-react';

interface RetailerOrdersTabProps {
  user: any;
  orders: any[];
  isLoadingOrders: boolean;
  timeFilter: string;
  isOrdersExpanded: boolean;
  setIsOrdersExpanded: (val: boolean) => void;
  showAllOrders: boolean;
  setShowAllOrders: (val: boolean) => void;
}

export function RetailerOrdersTab({
  user, orders, isLoadingOrders, timeFilter,
  isOrdersExpanded, setIsOrdersExpanded,
  showAllOrders, setShowAllOrders
}: RetailerOrdersTabProps) {

  // Processing Orders
  const filteredOrders = orders.filter(order => {
    if (timeFilter === 'all') return true;
    const ts = order.timestamp || order.createdAt;
    if (!ts) return true;
    const orderDate = new Date(Number(ts));
    const now = new Date();
    
    if (timeFilter === 'today') return orderDate.toDateString() === now.toDateString();
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    if (timeFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      return orderDate >= oneMonthAgo;
    }
    return true;
  }).sort((a, b) => {
    const tA = Number(a.timestamp || a.createdAt || 0);
    const tB = Number(b.timestamp || b.createdAt || 0);
    return tB - tA; // Newest first
  });
  
  const displayedOrders = showAllOrders ? filteredOrders : filteredOrders.slice(0, 2);

  const handleExportCSV = () => {
    if (!filteredOrders.length) return;
    const headers = ['Order ID', 'Date', 'Customer Name', 'Customer Phone', 'Address', 'Items', 'Payout', 'Status'];
    const rows = filteredOrders.map(order => {
      const itemsArr = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
      const retailerItems = itemsArr.filter((item: any) => item.retailerId === user?.uid);
      const retailerTotal = retailerItems.reduce((acc, item: any) => acc + (item.unitPrice || item.itemPrice || 0) * item.quantity, 0);
      const customer = order.customerDetails;
      const ts = order.timestamp || order.createdAt;
      const dateStr = ts ? new Date(Number(ts)).toLocaleString("en-IN").replace(/,/g, '') : "Unknown Date";
      const orderIdShort = order.id?.substring(order.id.length - 8).toUpperCase() || 'N/A';
      
      const itemsStr = retailerItems.map((i: any) => `${i.quantity}x ${i.title || i.itemName}`).join('; ');
      const name = (customer?.name || order.customerEmail || 'Unknown Customer').replace(/,/g, '');
      const phone = (customer?.phoneNumber || 'No phone provided').replace(/,/g, '');
      const address = (customer?.address || 'No address provided').replace(/,/g, ' ');

      return [orderIdShort, dateStr, name, phone, address, itemsStr, retailerTotal.toFixed(2), order.status || 'placed'].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "incoming_orders.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-150/60 p-5 mt-6 animate-fade-in print:border-none print:shadow-none print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 print:hidden">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setIsOrdersExpanded(!isOrdersExpanded)}>
          <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 hover:text-blue-600 transition-colors">
            Incoming Orders & Dispatch
            {isOrdersExpanded ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>}
          </h2>
          <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-wide">Live</span>
          </div>
        </div>

        {isOrdersExpanded && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => window.print()} className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center gap-1.5" title="Print Orders">
              <Printer size={14} /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={handleExportCSV} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center gap-1.5" title="Export to Excel">
              <Download size={14} /> <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>
        )}
      </div>

      {isOrdersExpanded && (
        <div>
          {isLoadingOrders ? (
            <div className="p-10 text-center text-slate-500 flex justify-center items-center gap-2 font-semibold text-sm">
              <RefreshCw size={18} className="animate-spin text-blue-600"/> Fetching live orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <PackageSearch size={32} className="text-slate-300 mb-2" />
              No orders awaiting dispatch.
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto print:block">
                <table className="w-full text-left text-sm text-slate-600 border-collapse">
                  <thead className="bg-slate-50/50 dark:bg-slate-800 border-b-2 border-slate-100 dark:border-slate-800/80 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    <tr>
                      <th className="p-3 pl-4">Order Details</th>
                      <th className="p-3 w-1/3">Items (Qty)</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3 text-right">Total Payout</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {displayedOrders.map(order => {
                      const itemsArr = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
                      const retailerItems = itemsArr.filter((item: any) => item.retailerId === user?.uid);
                      const retailerTotal = retailerItems.reduce((acc, item: any) => acc + (item.unitPrice || item.itemPrice || 0) * item.quantity, 0);
                      const customer = order.customerDetails;
                      const ts = order.timestamp || order.createdAt;
                      const dateStr = ts ? new Date(Number(ts)).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' }) : "";
                      const orderIdShort = order.id?.substring(order.id.length - 8).toUpperCase() || 'N/A';
                      
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                          <td className="p-3 pl-4">
                            <div className="font-black text-slate-900 dark:text-white">#{orderIdShort}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-0.5">{dateStr}</div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1.5">
                              {retailerItems.map((item: any, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                  <span className="font-black text-slate-900 dark:text-white">{item.quantity}x</span> <span className="line-clamp-1 max-w-[100px]" title={item.title || item.itemName}>{item.title || item.itemName}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">{(customer?.name || order.customerEmail || 'Unknown').split(' ')[0]}</div>
                            <details className="mt-1 cursor-pointer">
                              <summary className="text-[10px] text-blue-600 hover:text-blue-800 font-bold outline-none flex items-center gap-0.5 select-none w-max">
                                Contact <ChevronDown size={10} />
                              </summary>
                              <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-100 text-[10px] space-y-1 w-max absolute z-10 shadow-sm">
                                <div><span className="font-bold">Tel:</span> {customer?.phoneNumber || 'N/A'}</div>
                              </div>
                            </details>
                          </td>
                          <td className="p-3 text-right">
                            <div className="font-black text-slate-900 dark:text-white">₹{retailerTotal.toFixed(2)}</div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 
                              order.status === 'cancelled' || order.status === 'returned' ? 'bg-red-100 text-red-700 border border-red-200' : 
                              'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}>
                              {order.status || 'placed'}
                            </span>
                          </td>
                          <td className="p-3 text-right pr-4">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded shadow-sm shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap flex items-center gap-1 ml-auto" onClick={() => alert('Order status update UI hooks here!')}>
                              Pack & Dispatch <ArrowRight size={12}/>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid grid-cols-1 gap-4 print:hidden">
                {displayedOrders.map(order => {
                  const itemsArr = Array.isArray(order.items) ? order.items : Object.values(order.items || {});
                  const retailerItems = itemsArr.filter((item: any) => item.retailerId === user?.uid);
                  const retailerTotal = retailerItems.reduce((acc, item: any) => acc + (item.unitPrice || item.itemPrice || 0) * item.quantity, 0);
                  const orderIdShort = order.id?.substring(order.id.length - 8).toUpperCase() || 'N/A';
                  const dateStr = (order.timestamp || order.createdAt) ? new Date(Number(order.timestamp || order.createdAt)).toLocaleString("en-IN", { dateStyle: 'medium', timeStyle: 'short' }) : "";

                  return (
                    <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-sm">#{orderIdShort}</div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{dateStr}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                          {order.status || 'placed'}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                          {retailerItems.map((item: any, idx) => (
                            <div key={idx} className="flex text-xs">
                              <span className="font-black text-slate-900 dark:text-white w-6">{item.quantity}x</span>
                              <span className="font-semibold text-slate-700 truncate">{item.title || item.itemName}</span>
                            </div>
                          ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Payout</div>
                          <div className="font-black text-slate-900 dark:text-white">₹{retailerTotal.toFixed(2)}</div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-4 rounded-md shadow-sm active:scale-95 transition-all" onClick={() => alert('Order status update hooks here!')}>
                          Pack & Dispatch
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredOrders.length > 2 && (
                <div className="pt-4 flex justify-center border-t border-slate-100 mt-4 print:hidden">
                  <button 
                    onClick={() => setShowAllOrders(!showAllOrders)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {showAllOrders ? 'Show Less' : `View All ${filteredOrders.length} Orders`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
