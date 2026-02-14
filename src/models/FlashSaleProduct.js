const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FlashSaleProduct = sequelize.define('FlashSaleProduct', {
  flash_sale_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = FlashSaleProduct;