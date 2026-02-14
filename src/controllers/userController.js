const { Wishlist, Cart, Order, User, Product } = require('../models');

exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_super_admin: user.is_super_admin,
      referral_code: user.referral_code,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const user = req.user;
    user.name = name || user.name;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product }],
    });
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const [item, created] = await Wishlist.findOrCreate({
      where: { user_id: req.user.id, product_id: productId },
    });
    res.status(created ? 201 : 200).json(item);
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    await Wishlist.destroy({
      where: { user_id: req.user.id, product_id: productId },
    });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

// Cart endpoints (similar pattern, but Cart is more complex; we'll implement in cartController)

exports.getReferralInfo = async (req, res, next) => {
  try {
    const referrals = await req.user.getReferralsMade({
      include: [{ model: User, as: 'referred', attributes: ['id', 'name', 'created_at'] }],
    });
    res.json({ referralCode: req.user.referral_code, referrals });
  } catch (err) {
    next(err);
  }
};
