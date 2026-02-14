const { FlashSale, FlashSaleProduct, Product } = require('../models');

// Admin: Get all flash sales
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

// Admin: Update flash sale
exports.updateFlashSale = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findByPk(req.params.id);
    if (!flashSale) return res.status(404).json({ error: 'Flash sale not found' });
    await flashSale.update(req.body);

    // Update products if provided
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

// Admin: Delete flash sale
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