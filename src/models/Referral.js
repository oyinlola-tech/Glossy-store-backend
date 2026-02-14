const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
  referrer_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  referred_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  referral_code: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  reward_granted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = Referral;