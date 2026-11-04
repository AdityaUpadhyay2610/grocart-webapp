const crypto = require('crypto');
const { query } = require('../config/db');

const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    return res.status(400).send('Webhook secret or signature missing.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('[Security] Invalid Razorpay webhook signature');
    return res.status(401).send('Invalid webhook signature');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const payment = payload.payment.entity;
    const rzpOrderId = payment.order_id;
    const rzpPaymentId = payment.id;

    console.log(`[Webhook] Payment confirmed for Razorpay Order: ${rzpOrderId}`);
    await query(
      `UPDATE orders
       SET payment_status = 'paid', razorpay_payment_id = $1
       WHERE razorpay_order_id = $2 AND payment_status != 'paid'`,
      [rzpPaymentId, rzpOrderId]
    );
  }

  return res.status(200).json({ status: 'ok' });
};

module.exports = { handleRazorpayWebhook };
