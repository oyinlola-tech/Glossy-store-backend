const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 },
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = CartItem;