const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const passport = require('../config/passport');

const ensureProviderEnabled = (provider) => (req, res, next) => {
  if (!passport.socialProviders?.[provider]) {
    return res.status(501).json({ error: `${provider} auth is not configured` });
  }
  return next();
};

// Google OAuth routes
router.get('/google', ensureProviderEnabled('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', ensureProviderEnabled('google'), passport.authenticate('google', { session: false }), authController.googleCallback);

// Apple OAuth routes
router.get('/apple', ensureProviderEnabled('apple'), passport.authenticate('apple', { scope: ['email'] }));
router.get('/apple/callback', ensureProviderEnabled('apple'), passport.authenticate('apple', { session: false }), authController.appleCallback);

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/verify-login-otp', authController.verifyLoginOTP);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/request-delete-account', authMiddleware, authController.requestDeleteAccount);
router.post('/confirm-delete-account', authMiddleware, authController.confirmDeleteAccount);

module.exports = router;
