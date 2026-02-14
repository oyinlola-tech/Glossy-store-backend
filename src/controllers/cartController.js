const { Cart, CartItem, ProductVariant, Product } = require('../models');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: CartItem,
        include: [{ model: ProductVariant, include: [{ model: Product }] }],
      }],
    });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productVariantId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    const variant = await ProductVariant.findByPk(productVariantId);
    if (!variant) {
      return res.status(404).json({ error: 'Product variant not found' });
    }
    if (Number(variant.stock) <= 0) {
      return res.status(409).json({ error: 'This product is out of stock' });
    }

    const [cartItem, created] = await CartItem.findOrCreate({
      where: { cart_id: cart.id, product_variant_id: productVariantId },
      defaults: { quantity: parsedQuantity },
    });
    if (!created) {
      if (Number(cartItem.quantity) + parsedQuantity > Number(variant.stock)) {
        return res.status(409).json({ error: `Only ${variant.stock} units available` });
      }
      cartItem.quantity += parsedQuantity;
      await cartItem.save();
    } else if (parsedQuantity > Number(variant.stock)) {
      await cartItem.destroy();
      return res.status(409).json({ error: `Only ${variant.stock} units available` });
    }
    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId },
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    const variant = await ProductVariant.findByPk(cartItem.product_variant_id);
    if (!variant) return res.status(404).json({ error: 'Product variant not found' });
    if (Number(quantity) > Number(variant.stock)) {
      return res.status(409).json({ error: `Only ${variant.stock} units available` });
    }

    cartItem.quantity = Number(quantity);
    await cartItem.save();
    res.json(cartItem);
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cartItem = await CartItem.findOne({
      where: { id: req.params.itemId },
      include: [{ model: Cart, where: { user_id: req.user.id } }],
    });
    if (!cartItem) return res.status(404).json({ error: 'Item not found' });

    await cartItem.destroy();
    res.json({ message: 'Item removed' });
  } catch (err) {
    next(err);
  }
};
