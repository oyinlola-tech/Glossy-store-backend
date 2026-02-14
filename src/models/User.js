const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true, // null for social users
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  is_super_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  last_login_ip: {
    type: DataTypes.STRING,
  },
  referral_code: {
    type: DataTypes.STRING,
    unique: true,
  },
  referred_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  created_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
      if (!user.referral_code) {
        user.referral_code = Math.random().toString(36).substring(2, 10).toUpperCase();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 10);
      }
    },
  },
});

User.prototype.comparePassword = function(password) {
  return bcrypt.compare(password, this.password_hash);
};

module.exports = User;
