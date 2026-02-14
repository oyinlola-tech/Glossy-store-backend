const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.post('/checkout', authMiddleware, orderController.checkout);
router.get('/', authMiddleware, orderController.getUserOrders);
router.get('/:id/status', authMiddleware, orderController.getOrderStatus);
router.patch('/:id/cancel', authMiddleware, orderController.cancelOrder);
router.get('/:id', authMiddleware, orderController.getOrderDetails);

module.exports = router;
