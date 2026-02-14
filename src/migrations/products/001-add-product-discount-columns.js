module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'products';

    const [compareAt] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'compare_at_price'`
    );
    if (!compareAt.length) {
      await queryInterface.addColumn(tableName, 'compare_at_price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      });
    }

    const [discountLabel] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'discount_label'`
    );
    if (!discountLabel.length) {
      await queryInterface.addColumn(tableName, 'discount_label', {
        type: Sequelize.STRING(80),
        allowNull: true,
      });
    }
  },

  down: async (queryInterface) => {
    const tableName = 'products';

    const [discountLabel] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'discount_label'`
    );
    if (discountLabel.length) {
      await queryInterface.removeColumn(tableName, 'discount_label');
    }

    const [compareAt] = await queryInterface.sequelize.query(
      `SHOW COLUMNS FROM \`${tableName}\` LIKE 'compare_at_price'`
    );
    if (compareAt.length) {
      await queryInterface.removeColumn(tableName, 'compare_at_price');
    }
  },
};
