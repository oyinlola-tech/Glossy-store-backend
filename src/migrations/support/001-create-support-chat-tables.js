module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hasConversationTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_conversations'"
    );
    if (!hasConversationTable[0].length) {
      await queryInterface.createTable('support_conversations', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('open', 'resolved', 'closed'),
          allowNull: false,
          defaultValue: 'open',
        },
        subject: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        last_message_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    const hasMessageTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_messages'"
    );
    if (!hasMessageTable[0].length) {
      await queryInterface.createTable('support_messages', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        support_conversation_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sender_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sender_role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('support_messages');
    await queryInterface.dropTable('support_conversations');
  },
};
