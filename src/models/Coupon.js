const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  discount_type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  usage_limit: {
    type: DataTypes.INTEGER,
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Coupon;