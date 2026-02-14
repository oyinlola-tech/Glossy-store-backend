const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportMessageReceipt = sequelize.define('SupportMessageReceipt', {
  support_message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  recipient_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['support_message_id', 'recipient_user_id'],
    },
  ],
});

module.exports = SupportMessageReceipt;
