const { Product, Category, ProductImage, ProductColor, ProductSize, ProductVariant, Rating, Comment, FlashSale, User, sequelize } = require('../models');
const { Op } = require('sequelize');

const formatPricing = (product) => {
  const currentPrice = Number(product.base_price);
  const originalPrice = product.compare_at_price !== null && product.compare_at_price !== undefined
    ? Number(product.compare_at_price)
    : null;
  const hasDiscount = originalPrice !== null && originalPrice > currentPrice;
  return {
    current_price: currentPrice,
    original_price: hasDiscount ? originalPrice : null,
    has_discount: hasDiscount,
    discount_label: hasDiscount ? product.discount_label : null,
  };
};

const formatAvailability = (product) => ({
  stock: Number(product.stock || 0),
  is_out_of_stock: Number(product.stock || 0) <= 0,
});

exports.getProducts = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, rating, flashSale, newArrivals, page = 1, limit = 20 } = req.query;
    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 20;
    const where = {};
    if (category) where.category_id = category;
    if (minPrice) where.base_price = { [Op.gte]: minPrice };
    if (maxPrice) where.base_price = { ...where.base_price, [Op.lte]: maxPrice };
    if (rating) where.average_rating = { [Op.gte]: rating };

    const include = [];
    if (flashSale === 'true') {
      include.push({
        model: FlashSale,
        where: {
          start_time: { [Op.lte]: new Date() },
          end_time: { [Op.gte]: new Date() },
        },
        required: true,
      });
    }
    if (newArrivals === 'true') {
      where.created_at = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    const products = await Product.findAndCountAll({
      where,
      include,
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
      distinct: true,
    });

    res.json({
      total: products.count,
      page: pageNumber,
      pages: Math.ceil(products.count / pageSize),
      products: products.rows.map((product) => ({
        ...product.toJSON(),
        ...formatPricing(product),
        ...formatAvailability(product),
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: ProductImage },
        { model: ProductColor },
        { model: ProductSize },
        { model: ProductVariant },
        { model: Rating, include: [{ model: User, attributes: ['id', 'name'] }] },
        { model: Comment, include: [{ model: User, attributes: ['id', 'name'] }] },
      ],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      ...product.toJSON(),
      ...formatPricing(product),
      ...formatAvailability(product),
    });
  } catch (err) {
    next(err);
  }
};

exports.addRating = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const [ratingRecord, created] = await Rating.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { rating, review },
    });
    if (!created) {
      ratingRecord.rating = rating;
      ratingRecord.review = review;
      await ratingRecord.save();
    }

    // Update product average rating
    const avg = await Rating.findOne({
      where: { product_id: productId },
      attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avg']],
    });
    await Product.update({ average_rating: avg.dataValues.avg }, { where: { id: productId } });

    res.json(ratingRecord);
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { comment } = req.body;
    const productId = req.params.id;
    const userId = req.user.id;

    const newComment = await Comment.create({
      user_id: userId,
      product_id: productId,
      comment,
    });
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};
