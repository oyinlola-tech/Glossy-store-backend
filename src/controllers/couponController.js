const { Coupon, sequelize } = require('../models');
const { Op } = require('sequelize');

// Validate coupon (public endpoint for frontend to check before checkout)
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    const coupon = await Coupon.findOne({
      where: {
        code,
        valid_from: { [Op.lte]: new Date() },
        valid_until: { [Op.gte]: new Date() },
        [Op.or]: [
          { usage_limit: null },
          { used_count: { [Op.lt]: sequelize.col('usage_limit') } },
        ],
      },
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, error: 'Invalid or expired coupon' });
    }

    if (coupon.min_order_amount && cartTotal < coupon.min_order_amount) {
      return res.status(400).json({ valid: false, error: `Minimum order amount is ${coupon.min_order_amount}` });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (cartTotal * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discountAmount: Math.min(discount, cartTotal), // Ensure discount doesn't exceed total
      },
    });
  } catch (err) {
    next(err);
  }
};

// Admin: List all coupons
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

// Admin: Update coupon
exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

// Admin: Delete coupon
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ error: 'Coupon not found' });
    await coupon.destroy();
    res.json({ message: 'Coupon deleted' });
  } catch (err) {
    next(err);
  }
};
