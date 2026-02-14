const { User } = require('../models');

const seedSuperAdminFromEnv = async () => {
  const {
    SUPER_ADMIN_NAME,
    SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD,
  } = process.env;

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    return;
  }

  const [user, created] = await User.findOrCreate({
    where: { email: SUPER_ADMIN_EMAIL },
    defaults: {
      name: SUPER_ADMIN_NAME || SUPER_ADMIN_EMAIL.split('@')[0],
      password_hash: SUPER_ADMIN_PASSWORD,
      role: 'admin',
      is_super_admin: true,
      email_verified: true,
    },
  });

  if (!created && (!user.is_super_admin || user.role !== 'admin')) {
    user.role = 'admin';
    user.is_super_admin = true;
    await user.save();
  }
};

module.exports = { seedSuperAdminFromEnv };
