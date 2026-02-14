const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, cartController.getCart);
router.post('/', authMiddleware, cartController.addToCart);
router.put('/:itemId', authMiddleware, cartController.updateCartItem);
router.delete('/:itemId', authMiddleware, cartController.removeFromCart);

module.exports = router;