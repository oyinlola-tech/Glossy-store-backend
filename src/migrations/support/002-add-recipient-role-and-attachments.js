module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [recipientRoleColumn] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `support_messages` LIKE 'recipient_role'"
    );
    if (!recipientRoleColumn.length) {
      await queryInterface.addColumn('support_messages', 'recipient_role', {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: true,
      });

      await queryInterface.sequelize.query(`
        UPDATE support_messages
        SET recipient_role = CASE
          WHEN sender_role = 'admin' THEN 'user'
          ELSE 'admin'
        END
        WHERE recipient_role IS NULL
      `);

      await queryInterface.changeColumn('support_messages', 'recipient_role', {
        type: Sequelize.ENUM('user', 'admin'),
        allowNull: false,
      });
    }

    await queryInterface.changeColumn('support_messages', 'message', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    const hasAttachmentTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_message_attachments'"
    );
    if (!hasAttachmentTable[0].length) {
      await queryInterface.createTable('support_message_attachments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        support_message_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        file_url: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        mime_type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: false,
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

    const [msgUnreadIdx] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `support_messages` WHERE Key_name = 'idx_support_messages_unread'"
    );
    if (!msgUnreadIdx.length) {
      await queryInterface.addIndex(
        'support_messages',
        ['support_conversation_id', 'recipient_role', 'is_read'],
        { name: 'idx_support_messages_unread' }
      );
    }

    const [attachmentMsgIdx] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `support_message_attachments` WHERE Key_name = 'idx_support_message_attachments_message'"
    );
    if (!attachmentMsgIdx.length) {
      await queryInterface.addIndex(
        'support_message_attachments',
        ['support_message_id'],
        { name: 'idx_support_message_attachments_message' }
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const hasAttachmentTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_message_attachments'"
    );
    if (hasAttachmentTable[0].length) {
      const [attachmentMsgIdx] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM `support_message_attachments` WHERE Key_name = 'idx_support_message_attachments_message'"
      );
      if (attachmentMsgIdx.length) {
        await queryInterface.removeIndex('support_message_attachments', 'idx_support_message_attachments_message');
      }
      await queryInterface.dropTable('support_message_attachments');
    }

    const [msgUnreadIdx] = await queryInterface.sequelize.query(
      "SHOW INDEX FROM `support_messages` WHERE Key_name = 'idx_support_messages_unread'"
    );
    if (msgUnreadIdx.length) {
      await queryInterface.removeIndex('support_messages', 'idx_support_messages_unread');
    }

    const [recipientRoleColumn] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `support_messages` LIKE 'recipient_role'"
    );
    if (recipientRoleColumn.length) {
      await queryInterface.removeColumn('support_messages', 'recipient_role');
    }

    await queryInterface.changeColumn('support_messages', 'message', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
