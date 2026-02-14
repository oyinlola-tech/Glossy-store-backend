const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/wishlist', authMiddleware, userController.getWishlist);
router.post('/wishlist/:productId', authMiddleware, userController.addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, userController.removeFromWishlist);
router.get('/referral', authMiddleware, userController.getReferralInfo);

module.exports = router;