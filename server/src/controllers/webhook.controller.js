// server/src/controllers/webhook.controller.js
// Handles asynchronous notifications from Razorpay with timing-safe signature verification.

const crypto = require('crypto');
const { query } = require('../config/db');

const handleRazorpayWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!webhookSecret || !signature) {
    return res.status(400).send('Webhook secret or signature missing.');
  }

  // Use raw request buffer if available for byte-accurate verification
  const payloadToSign = req.rawBody || JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payloadToSign)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'utf8');
  const expBuffer = Buffer.from(expectedSignature, 'utf8');

  // Cryptographic timing-safe comparison prevents timing attacks
  if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
    console.error('[Security] Invalid Razorpay webhook signature');
    return res.status(401).send('Invalid webhook signature');
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured') {
    const payment = payload?.payment?.entity;
    const rzpOrderId = payment?.order_id;
    const rzpPaymentId = payment?.id;

    if (rzpOrderId) {
      console.log(`[Webhook] Payment confirmed for Razorpay Order: ${rzpOrderId}`);
      await query(
        `UPDATE orders
         SET payment_status = 'paid', razorpay_payment_id = COALESCE(razorpay_payment_id, $1)
         WHERE razorpay_order_id = $2 AND payment_status != 'paid'`,
        [rzpPaymentId, rzpOrderId]
      );
    }
  }

  return res.status(200).json({ status: 'ok' });
};

module.exports = { handleRazorpayWebhook };
