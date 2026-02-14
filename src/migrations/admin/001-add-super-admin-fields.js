module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'users';

    const [isSuperAdminColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'is_super_admin'`
    );
    if (!isSuperAdminColumn.length) {
      await queryInterface.addColumn(tableName, 'is_super_admin', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }

    const [createdByAdminColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'created_by_admin_id'`
    );
    if (!createdByAdminColumn.length) {
      await queryInterface.addColumn(tableName, 'created_by_admin_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableName = 'users';

    const [createdByAdminColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'created_by_admin_id'`
    );
    if (createdByAdminColumn.length) {
      await queryInterface.removeColumn(tableName, 'created_by_admin_id');
    }

    const [isSuperAdminColumn] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'is_super_admin'`
    );
    if (isSuperAdminColumn.length) {
      await queryInterface.removeColumn(tableName, 'is_super_admin');
    }
  },
};
