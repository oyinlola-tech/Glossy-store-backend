const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/webhook', paymentController.webhook); // Paystack webhook (public)

module.exports = router;