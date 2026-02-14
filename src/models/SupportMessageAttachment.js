const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportMessageAttachment = sequelize.define('SupportMessageAttachment', {
  support_message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  storage_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  underscored: true,
});

module.exports = SupportMessageAttachment;
