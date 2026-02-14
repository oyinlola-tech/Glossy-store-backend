const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware, superAdminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard/summary', adminController.getDashboardSummary);

// Admin account management (super admin only)
router.post('/admin-users', superAdminMiddleware, adminController.createAdminUser);

// Categories
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Products
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', upload.array('images', 10), adminController.createProduct);
router.put('/products/:id', upload.array('images', 10), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Flash Sales
router.post('/flash-sales', adminController.createFlashSale);
router.get('/flash-sales', adminController.getFlashSales);
router.put('/flash-sales/:id', adminController.updateFlashSale);
router.delete('/flash-sales/:id', adminController.deleteFlashSale);

// Coupons
router.post('/coupons', adminController.createCoupon);
router.get('/coupons', adminController.getCoupons);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// Contact Messages
router.get('/contact-messages', adminController.getContactMessages);
router.post('/contact-messages/:id/reply', adminController.replyToContactMessage);

// Users
router.get('/users', adminController.getUsers);

// Orders
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;
