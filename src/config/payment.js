// Paystack configuration
module.exports = {
  paystackSecret: process.env.PAYSTACK_SECRET_KEY,
  paystackPublic: process.env.PAYSTACK_PUBLIC_KEY,
  paystackApiUrl: process.env.PAYSTACK_API_URL,
  paystackWebhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET,
  paystackWebhookUrl: process.env.PAYSTACK_WEBHOOK_URL,
  
};