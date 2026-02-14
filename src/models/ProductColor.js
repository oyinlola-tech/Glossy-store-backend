const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductColor = sequelize.define('ProductColor', {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  color_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  color_code: {
    type: DataTypes.STRING(7),
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ProductColor;