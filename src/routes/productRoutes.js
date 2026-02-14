const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/:id/rate', authMiddleware, productController.addRating);
router.post('/:id/comment', authMiddleware, productController.addComment);

module.exports = router;