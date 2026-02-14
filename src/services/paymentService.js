const config = require('../config/payment');
const initializeTransaction = async (email, amount, reference, metadata = {}) => {
  const response = await fetch(`${config.paystackApiUrl}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      metadata,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Payment initialization failed');
  }
  return data;
};

const verifyTransaction = async (reference) => {
  const response = await fetch(`${config.paystackApiUrl}/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.paystackSecret}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || 'Verification failed');
  }
  return data;
};

module.exports = { initializeTransaction, verifyTransaction };
