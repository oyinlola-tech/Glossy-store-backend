const crypto = require('crypto');
const { Order } = require('../models');

exports.webhook = async (req, res) => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (paystackSecret) {
      const signature = req.headers['x-paystack-signature'];
      const expected = crypto
        .createHmac('sha512', paystackSecret)
        .update(req.rawBody || JSON.stringify(req.body))
        .digest('hex');
      if (!signature || signature !== expected) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const orderId = event?.data?.metadata?.orderId;
      const order = await Order.findByPk(orderId);
      if (order) {
        order.payment_status = 'success';
        if (order.status === 'pending') order.status = 'paid';
        await order.save();
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
};
