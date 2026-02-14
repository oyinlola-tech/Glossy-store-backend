module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = 'orders';

    await queryInterface.changeColumn(tableName, 'status', {
      type: Sequelize.ENUM(
        'pending',
        'paid',
        'processing',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'refunded'
      ),
      allowNull: false,
      defaultValue: 'pending',
    });

    const addColumnIfMissing = async (columnName, definition) => {
      const [column] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE '${columnName}'`
      );
      if (!column.length) {
        await queryInterface.addColumn(tableName, columnName, definition);
      }
    };

    await addColumnIfMissing('status_note', { type: Sequelize.TEXT, allowNull: true });
    await addColumnIfMissing('out_for_delivery_at', { type: Sequelize.DATE, allowNull: true });
    await addColumnIfMissing('delivered_at', { type: Sequelize.DATE, allowNull: true });
    await addColumnIfMissing('cancelled_at', { type: Sequelize.DATE, allowNull: true });
    await addColumnIfMissing('refunded_at', { type: Sequelize.DATE, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = 'orders';

    const removeColumnIfExists = async (columnName) => {
      const [column] = await queryInterface.sequelize.query(
        `SHOW COLUMNS FROM \`${tableName}\` LIKE '${columnName}'`
      );
      if (column.length) {
        await queryInterface.removeColumn(tableName, columnName);
      }
    };

    await removeColumnIfExists('status_note');
    await removeColumnIfExists('out_for_delivery_at');
    await removeColumnIfExists('delivered_at');
    await removeColumnIfExists('cancelled_at');
    await removeColumnIfExists('refunded_at');

    await queryInterface.changeColumn(tableName, 'status', {
      type: Sequelize.ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    });
  },
};
