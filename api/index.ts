import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

// In-memory server state cache initialized with defaults
let storeSettings = {
  storeName: process.env.STORE_NAME || 'Vishvjeet Computer',
  tagline: 'Your Complete Technology Store',
  phone: process.env.STORE_PHONE || '+91 89566 64295',
  whatsapp: process.env.STORE_WHATSAPP || '+918956664295',
  email: process.env.STORE_EMAIL || 'vishwajeetnanhai199@gmail.com',
  address: process.env.STORE_ADDRESS || 'Shop No. 4, Shivaji Complex, Main Road, Chikhli, Buldhana - 443201',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  isRazorpayConfigured: !!process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
};

// Authentication is handled exclusively by Firebase Authentication Phone Number Provider.

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    store: 'Vishvjeet Computer',
    location: 'Chikhli, Buldhana, Maharashtra',
    timestamp: new Date().toISOString(),
  });
});

// Settings API
app.get('/api/settings', (_req, res) => {
  res.json({
    ...storeSettings,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    isTestMode: !process.env.RAZORPAY_KEY_SECRET,
  });
});

app.put('/api/settings', (req, res) => {
  storeSettings = { ...storeSettings, ...req.body };
  res.json({ success: true, settings: storeSettings });
});

// Coupon validation endpoint
app.post('/api/coupons/validate', (req, res) => {
  const { code, cartSubtotal } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Coupon code required' });
  }

  const validCoupons: Record<string, { type: 'percent' | 'fixed'; val: number; min: number; max?: number }> = {
    'VISHVJEET10': { type: 'percent', val: 10, min: 999, max: 1000 },
    'FIRST500': { type: 'fixed', val: 500, min: 4999 },
    'CHIKHLI200': { type: 'fixed', val: 200, min: 1499 },
  };

  const coupon = validCoupons[code.toUpperCase()];
  if (!coupon) {
    return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
  }

  if (cartSubtotal < coupon.min) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order value of ₹${coupon.min} required for this coupon`,
    });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.min((cartSubtotal * coupon.val) / 100, coupon.max || Infinity);
  } else {
    discount = Math.min(coupon.val, cartSubtotal);
  }

  res.json({
    valid: true,
    code: code.toUpperCase(),
    discountAmount: Math.round(discount),
    message: `Coupon applied: ₹${Math.round(discount)} saved!`,
  });
});

// Razorpay: Create Order
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid order amount is required' });
    }

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Convert INR to Paise (multiply by 100)
    const amountInPaise = Math.round(amount * 100);

    // If live or valid Razorpay credentials exist, call Razorpay official Orders API
    if (razorpayKeyId && razorpaySecret && razorpayKeyId !== 'rzp_test_placeholder') {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: notes || { store: 'Vishvjeet Computer Chikhli' },
          }),
        });

        if (!rzpResponse.ok) {
          const errData = await rzpResponse.json();
          console.error('Razorpay API error:', errData);
          throw new Error('Razorpay API error');
        }

        const orderData = await rzpResponse.json();
        return res.json({
          success: true,
          id: orderData.id,
          amount: orderData.amount,
          currency: 'INR',
          keyId: razorpayKeyId,
          isLive: true,
        });
      } catch (err) {
        console.error('Failed to create Razorpay live order, falling back to test order simulator:', err);
      }
    }

    // In Test/Development Mode: generate compliant test order structure
    const testOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    res.json({
      success: true,
      id: testOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: razorpayKeyId || 'rzp_test_placeholder',
      isLive: false,
      message: 'Razorpay Test Mode Order initialized for Vishvjeet Computer',
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal server error while creating payment order' });
  }
});

// Razorpay: Verify Payment Signature
app.post('/api/razorpay/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing order_id or payment_id' });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // If secret is configured, run authentic HMAC-SHA256 signature verification
    if (razorpaySecret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Invalid Razorpay payment signature',
        });
      }

      return res.json({
        success: true,
        verified: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        verifiedAt: new Date().toISOString(),
      });
    }

    // In Test sandbox mode
    return res.json({
      success: true,
      verified: true,
      isTestMode: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
});

// Razorpay: Webhook handler
app.post('/api/razorpay/webhook', (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (webhookSecret && signature) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  // Handle payment.captured, payment.failed
  const event = req.body.event;
  console.log(`Razorpay webhook event received: ${event}`);

  res.json({ status: 'ok' });
});

export default app;
