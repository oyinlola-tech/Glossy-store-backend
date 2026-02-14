const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportMessage = sequelize.define('SupportMessage', {
  support_conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sender_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sender_role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  recipient_role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SupportMessage;
