import { formatINR, calculateGST } from "@global/utils/calculations";

export function formatTimestamp(timestamp) {
  if (!timestamp) return "Recently";
  const d = new Date(Number(timestamp));
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export function printOrderInvoice(order) {
  if (!order) return;

  const orderId = order.id
    ? (order.id.startsWith("GC-") ? order.id : `GC-${order.id.substring(order.id.length - 5).toUpperCase()}`)
    : "GC-89421";
  const dateStr = formatTimestamp(order.timestamp);

  const subtotal = (order.items || []).reduce(
    (sum, item) => sum + Number(item.itemPrice || 0) * (item.quantity || 1),
    0
  );
  const gst = calculateGST(subtotal);
  const delivery = order.deliveryFee || 0;
  const handling = order.handlingCharge || 15;
  const discount = order.couponDiscount || 0;
  const total = order.totalPaid || (subtotal + gst + delivery + handling - discount);

  const printWindow = window.open("", "_blank", "width=500,height=700");
  if (!printWindow) {
    alert("Please allow pop-ups to download or print the invoice.");
    return;
  }

  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding: 8px 0; font-family: monospace; font-size: 13px;">
        ${item.quantity || 1}x ${item.itemName} (${item.itemQuantity || "500g"})
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
}

