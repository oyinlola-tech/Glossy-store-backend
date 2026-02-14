const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSize = sequelize.define('ProductSize', {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  size: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ProductSize;