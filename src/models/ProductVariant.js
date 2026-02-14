const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  size_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
  price_adjustment: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  image_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ProductVariant;