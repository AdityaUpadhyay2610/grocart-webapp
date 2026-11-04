//Singloten instance of the official razorpay SDK client

const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if(!key_id || !key_secret){
    console.warn('[Warning] RAZORPAY_KEY_ID OR RAZORPAY_KEY_SECRET IS MISSING BHIDU');
}

const razorpayInstance = new Razorpay({
    key_id: key_id || 'dummy_key',
    key_secret: key_secret || 'dummy_secret'
});

module.exports = razorpayInstance;