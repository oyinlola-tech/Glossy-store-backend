const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, contactController.submitContact);

module.exports = router;
