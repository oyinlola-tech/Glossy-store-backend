const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  compare_at_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  discount_label: {
    type: DataTypes.STRING(80),
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  average_rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0.0,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Product;
