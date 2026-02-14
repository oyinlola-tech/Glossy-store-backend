const {
  Category, Product, ProductImage, ProductColor, ProductSize, ProductVariant,
  FlashSale, FlashSaleProduct, Coupon, ContactMessage, User, Order, OrderItem,
} = require('../models');
const { sendContactReplyEmail } = require('../services/emailService');

const syncProductStockFromVariants = async (productId) => {
  const variants = await ProductVariant.findAll({
    where: { product_id: productId },
    attributes: ['stock'],
  });
  if (!variants.length) return;
  const totalStock = variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);
  await Product.update({ stock: totalStock }, { where: { id: productId } });
};

// ---------- Admin Users ----------
exports.createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const adminUser = await User.create({
      name,
      email,
      password_hash: password,
      role: 'admin',
      is_super_admin: false,
      email_verified: true,
      created_by_admin_id: req.user.id,
    });

    return res.status(201).json({
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
      is_super_admin: adminUser.is_super_admin,
      created_by_admin_id: adminUser.created_by_admin_id,
    });
  } catch (err) {
    next(err);
  }
};

// ---------- Categories ----------
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, parent_id } = req.body;
    const category = await Category.create({ name, description, parent_id });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.update(req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Products ----------
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [{ model: ProductImage }, { model: ProductVariant }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage }, { model: ProductColor }, { model: ProductSize }, { model: ProductVariant }],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      base_price,
      compare_at_price,
      discount_label,
      stock,
      colors,
      sizes,
      variants,
    } = req.body;

    const product = await Product.create({
      category_id,
      name,
      description,
      base_price,
      compare_at_price: compare_at_price || null,
      discount_label: discount_label || null,
      stock,
    });

    if (colors && colors.length) {
      await ProductColor.bulkCreate(colors.map(c => ({ ...c, product_id: product.id })));
    }

    if (sizes && sizes.length) {
      await ProductSize.bulkCreate(sizes.map(s => ({ size: s, product_id: product.id })));
    }

    if (variants && variants.length) {
      await ProductVariant.bulkCreate(variants.map(v => ({ ...v, product_id: product.id })));
      await syncProductStockFromVariants(product.id);
    }

    if (req.files && req.files.length) {
      const images = req.files.map((file, index) => ({
        product_id: product.id,
        image_url: `/uploads/${file.filename}`,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await product.update(req.body);

    // Handle colors: replace all (simplified)
    if (req.body.colors) {
      await ProductColor.destroy({ where: { product_id: product.id } });
      await ProductColor.bulkCreate(req.body.colors.map(c => ({ ...c, product_id: product.id })));
    }

    // Handle sizes
    if (req.body.sizes) {
      await ProductSize.destroy({ where: { product_id: product.id } });
      await ProductSize.bulkCreate(req.body.sizes.map(s => ({ size: s, product_id: product.id })));
    }

    // Handle variants
    if (req.body.variants) {
      await ProductVariant.destroy({ where: { product_id: product.id } });
      await ProductVariant.bulkCreate(req.body.variants.map(v => ({ ...v, product_id: product.id })));
      await syncProductStockFromVariants(product.id);
    }

    // Handle images: new images replace old ones (simplified)
    if (req.files && req.files.length) {
      await ProductImage.destroy({ where: { product_id: product.id } });
      const images = req.files.map((file, index) => ({
        product_id: product.id,
        image_url: `/uploads/${file.filename}`,
        sort_order: index,
      }));
      await ProductImage.bulkCreate(images);
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Flash Sales ----------
exports.createFlashSale = async (req, res, next) => {
  try {
    const { name, description, start_time, end_time, products } = req.body;
    const flashSale = await FlashSale.create({ name, description, start_time, end_time });
    if (products && products.length) {
      const productLinks = products.map(p => ({
        flash_sale_id: flashSale.id,
        product_id: p.product_id,
        discount_price: p.discount_price,
      }));
      await FlashSaleProduct.bulkCreate(productLinks);
    }
    res.status(201).json(flashSale);
  } catch (err) {
    next(err);
  }
};

exports.getFlashSales = async (req, res, next) => {
  try {
    const flashSales = await FlashSale.findAll({
      include: [{ model: Product, through: { attributes: ['discount_price'] } }],
    });
    res.json(flashSales);
  } catch (err) {
    next(err);
  }
};

exports.updateFlashSale = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findByPk(req.params.id);
    if (!flashSale) return res.status(404).json({ error: 'Flash sale not found' });
    await flashSale.update(req.body);

    if (req.body.products) {
      await FlashSaleProduct.destroy({ where: { flash_sale_id: flashSale.id } });
      const productLinks = req.body.products.map(p => ({
        flash_sale_id: flashSale.id,
        product_id: p.product_id,
        discount_price: p.discount_price,
      }));
      await FlashSaleProduct.bulkCreate(productLinks);
    }

    res.json(flashSale);
  } catch (err) {
    next(err);
  }
};

exports.deleteFlashSale = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findByPk(req.params.id);
    if (!flashSale) return res.status(404).json({ error: 'Flash sale not found' });
    await flashSale.destroy();
    res.json({ message: 'Flash sale deleted' });
  } catch (err) {
    next(err);
  }
};

// ---------- Coupons ----------
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

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

// ---------- Contact Messages ----------
exports.getContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.replyToContactMessage = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    message.admin_reply = reply;
    message.replied_at = new Date();
    await message.save();

    await sendContactReplyEmail(message.email, message.name, reply);

    res.json({ message: 'Reply sent' });
  } catch (err) {
    next(err);
  }
};

// ---------- Users ----------
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

// ---------- Orders ----------
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: OrderItem, include: [{ model: ProductVariant, include: [{ model: Product }] }] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const [users, products, orders, pendingSupport] = await Promise.all([
      User.count(),
      Product.count(),
      Order.count(),
      ContactMessage.count({ where: { replied_at: null } }),
    ]);

    return res.json({
      users,
      products,
      orders,
      pending_support_messages: pendingSupport,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, status_note } = req.body;
    const allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    order.status_note = status_note || null;
    if (status === 'out_for_delivery') order.out_for_delivery_at = new Date();
    if (status === 'delivered') order.delivered_at = new Date();
    if (status === 'cancelled') order.cancelled_at = new Date();
    if (status === 'refunded') order.refunded_at = new Date();

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
