const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialAccount = sequelize.define('SocialAccount', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  provider_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SocialAccount;