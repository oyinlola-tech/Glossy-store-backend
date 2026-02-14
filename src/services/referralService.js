const { Referral, Coupon, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Grant reward to referrer after referred user's first purchase
 * @param {number} referredUserId - ID of the referred user who just made first purchase
 */
const processReferralReward = async (referredUserId) => {
  const referral = await Referral.findOne({
    where: { referred_user_id: referredUserId, reward_granted: false },
    include: [{ model: User, as: 'referrer' }],
  });
  if (!referral) return;

  // Example reward: create a 10% off coupon for referrer
  const coupon = await Coupon.create({
    code: `REFER-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    discount_type: 'percentage',
    discount_value: 10,
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    usage_limit: 1,
  });

  // Mark reward as granted
  referral.reward_granted = true;
  await referral.save();

  // Optionally associate coupon with referrer (you might need a UserCoupon table, but for simplicity we just create coupon)
  // Could also send email notification
  return coupon;
};

module.exports = { processReferralReward };