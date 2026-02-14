const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  admin_reply: {
    type: DataTypes.TEXT,
  },
  replied_at: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = ContactMessage;