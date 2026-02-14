module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [storagePathColumn] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `support_message_attachments` LIKE 'storage_path'"
    );
    if (!storagePathColumn.length) {
      await queryInterface.addColumn('support_message_attachments', 'storage_path', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const [fileUrlColumn] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `support_message_attachments` LIKE 'file_url'"
    );
    if (fileUrlColumn.length) {
      await queryInterface.sequelize.query(`
        UPDATE support_message_attachments
        SET storage_path = REPLACE(file_url, '/uploads/support/', 'private_uploads/support/')
        WHERE storage_path IS NULL
      `);
      await queryInterface.removeColumn('support_message_attachments', 'file_url');
    }

    await queryInterface.changeColumn('support_message_attachments', 'storage_path', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    const hasReceiptsTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_message_receipts'"
    );
    if (!hasReceiptsTable[0].length) {
      await queryInterface.createTable('support_message_receipts', {
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
        recipient_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        delivered_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        read_at: {
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

      await queryInterface.addIndex('support_message_receipts', ['support_message_id', 'recipient_user_id'], {
        unique: true,
        name: 'idx_support_message_receipts_unique',
      });
      await queryInterface.addIndex('support_message_receipts', ['recipient_user_id', 'read_at'], {
        name: 'idx_support_message_receipts_unread',
      });
    }

    // Backfill one receipt per message for existing conversations.
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO support_message_receipts (support_message_id, recipient_user_id, delivered_at, read_at, created_at, updated_at)
      SELECT sm.id, sc.user_id,
        CASE WHEN sm.sender_role = 'admin' THEN sm.created_at ELSE NULL END,
        CASE WHEN sm.sender_role = 'admin' AND sm.is_read = 1 THEN sm.created_at ELSE NULL END,
        NOW(), NOW()
      FROM support_messages sm
      INNER JOIN support_conversations sc ON sc.id = sm.support_conversation_id
      WHERE sm.recipient_role = 'user'
    `);

    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO support_message_receipts (support_message_id, recipient_user_id, delivered_at, read_at, created_at, updated_at)
      SELECT sm.id, u.id,
        CASE WHEN sm.sender_role = 'user' THEN sm.created_at ELSE NULL END,
        CASE WHEN sm.sender_role = 'user' AND sm.is_read = 1 THEN sm.created_at ELSE NULL END,
        NOW(), NOW()
      FROM support_messages sm
      CROSS JOIN users u
      WHERE u.role = 'admin' AND sm.recipient_role = 'admin'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    const hasReceiptsTable = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'support_message_receipts'"
    );
    if (hasReceiptsTable[0].length) {
      const [idxUnread] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM `support_message_receipts` WHERE Key_name = 'idx_support_message_receipts_unread'"
      );
      if (idxUnread.length) {
        await queryInterface.removeIndex('support_message_receipts', 'idx_support_message_receipts_unread');
      }
      const [idxUnique] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM `support_message_receipts` WHERE Key_name = 'idx_support_message_receipts_unique'"
      );
      if (idxUnique.length) {
        await queryInterface.removeIndex('support_message_receipts', 'idx_support_message_receipts_unique');
      }
      await queryInterface.dropTable('support_message_receipts');
    }

    const [storagePathColumn] = await queryInterface.sequelize.query(
      "SHOW COLUMNS FROM `support_message_attachments` LIKE 'storage_path'"
    );
    if (storagePathColumn.length) {
      await queryInterface.addColumn('support_message_attachments', 'file_url', {
        type: Sequelize.STRING,
        allowNull: true,
      });
      await queryInterface.sequelize.query(`
        UPDATE support_message_attachments
        SET file_url = REPLACE(storage_path, 'private_uploads/support/', '/uploads/support/')
      `);
      await queryInterface.removeColumn('support_message_attachments', 'storage_path');
      await queryInterface.changeColumn('support_message_attachments', 'file_url', {
        type: Sequelize.STRING,
        allowNull: false,
      });
    }
  },
};
