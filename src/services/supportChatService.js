const {
  SupportConversation,
  SupportMessage,
  SupportMessageAttachment,
  SupportMessageReceipt,
  User,
  sequelize,
} = require('../models');
const { createSignedAttachmentUrl } = require('./attachmentUrlService');

const getConversationById = async (conversationId) => {
  return SupportConversation.findByPk(conversationId, {
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
  });
};

const canAccessConversation = (conversation, user) => {
  if (!conversation) return false;
  if (user.role === 'admin') return true;
  return conversation.user_id === user.id;
};

const getRecipientRole = (senderRole) => (senderRole === 'admin' ? 'user' : 'admin');

const supportMessageInclude = [
  { model: User, attributes: ['id', 'name', 'email', 'role'] },
  { model: SupportMessageAttachment },
  {
    model: SupportMessageReceipt,
    include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }],
  },
];

const formatMessageForUser = (message, user) => {
  const json = message.toJSON();
  const attachments = (json.SupportMessageAttachments || []).map((attachment) => ({
    id: attachment.id,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    file_size: attachment.file_size,
    signed_download_url: createSignedAttachmentUrl(attachment.id, user.id),
  }));
  return {
    ...json,
    SupportMessageAttachments: attachments,
    receipts: (json.SupportMessageReceipts || []).map((receipt) => ({
      id: receipt.id,
      recipient_user_id: receipt.recipient_user_id,
      delivered_at: receipt.delivered_at,
      read_at: receipt.read_at,
      recipient: receipt.User ? {
        id: receipt.User.id,
        name: receipt.User.name,
        email: receipt.User.email,
        role: receipt.User.role,
      } : null,
    })),
  };
};

const getRecipientUsers = async (conversation, senderRole, transaction) => {
  if (senderRole === 'admin') {
    const user = await User.findByPk(conversation.user_id, { transaction });
    return user ? [user] : [];
  }
  return User.findAll({
    where: { role: 'admin' },
    attributes: ['id', 'name', 'email', 'role'],
    transaction,
  });
};

const createMessage = async ({ conversationId, senderUser, message, attachments = [] }) => {
  const conversation = await SupportConversation.findByPk(conversationId);
  if (!conversation) {
    throw new Error('Support conversation not found');
  }
  if (!canAccessConversation(conversation, senderUser)) {
    throw new Error('Access denied');
  }
  const trimmedMessage = message ? String(message).trim() : '';
  if (!trimmedMessage && !attachments.length) {
    throw new Error('Message or attachment is required');
  }

  const createdMessage = await sequelize.transaction(async (transaction) => {
    const senderRole = senderUser.role === 'admin' ? 'admin' : 'user';
    const recipients = await getRecipientUsers(conversation, senderRole, transaction);
    const created = await SupportMessage.create({
      support_conversation_id: conversationId,
      sender_user_id: senderUser.id,
      sender_role: senderRole,
      recipient_role: getRecipientRole(senderRole),
      message: trimmedMessage || null,
      is_read: false,
    }, { transaction });

    if (attachments.length) {
      await SupportMessageAttachment.bulkCreate(
        attachments.map((file) => ({
          support_message_id: created.id,
          storage_path: file.storage_path,
          file_name: file.file_name,
          mime_type: file.mime_type,
          file_size: file.file_size,
        })),
        { transaction }
      );
    }

    if (recipients.length) {
      await SupportMessageReceipt.bulkCreate(
        recipients
          .filter((recipient) => recipient.id !== senderUser.id)
          .map((recipient) => ({
            support_message_id: created.id,
            recipient_user_id: recipient.id,
            delivered_at: null,
            read_at: null,
          })),
        { transaction }
      );
    }

    conversation.last_message_at = new Date();
    if (conversation.status === 'resolved') {
      conversation.status = 'open';
    }
    await conversation.save({ transaction });

    return created;
  });

  const hydrated = await SupportMessage.findByPk(createdMessage.id, {
    include: supportMessageInclude,
  });
  return formatMessageForUser(hydrated, senderUser);
};

const markConversationAsDelivered = async ({ conversationId, user }) => {
  const conversation = await SupportConversation.findByPk(conversationId);
  if (!conversation) {
    throw new Error('Support conversation not found');
  }
  if (!canAccessConversation(conversation, user)) {
    throw new Error('Access denied');
  }

  const messageIds = (await SupportMessage.findAll({
    where: { support_conversation_id: conversationId },
    attributes: ['id'],
  })).map((message) => message.id);
  if (!messageIds.length) return { updatedCount: 0 };

  const [updatedCount] = await SupportMessageReceipt.update(
    { delivered_at: new Date() },
    {
      where: {
        support_message_id: messageIds,
        recipient_user_id: user.id,
        delivered_at: null,
      },
    }
  );

  return { updatedCount };
};

const markConversationAsRead = async ({ conversationId, user }) => {
  const conversation = await SupportConversation.findByPk(conversationId);
  if (!conversation) {
    throw new Error('Support conversation not found');
  }
  if (!canAccessConversation(conversation, user)) {
    throw new Error('Access denied');
  }

  const messageIds = (await SupportMessage.findAll({
    where: { support_conversation_id: conversationId },
    attributes: ['id'],
  })).map((message) => message.id);
  if (!messageIds.length) return { updatedCount: 0 };

  const [updatedCount] = await SupportMessageReceipt.update(
    { read_at: new Date(), delivered_at: sequelize.fn('COALESCE', sequelize.col('delivered_at'), new Date()) },
    {
      where: {
        support_message_id: messageIds,
        recipient_user_id: user.id,
        read_at: null,
      },
    }
  );

  return { updatedCount };
};

const getConversationMessagesForUser = async ({ conversationId, user }) => {
  const conversation = await getConversationById(conversationId);
  if (!canAccessConversation(conversation, user)) {
    throw new Error('Access denied');
  }
  const messages = await SupportMessage.findAll({
    where: { support_conversation_id: conversation.id },
    include: supportMessageInclude,
    order: [['created_at', 'ASC']],
  });
  return {
    conversation,
    messages: messages.map((message) => formatMessageForUser(message, user)),
  };
};

const getUnreadCounts = async (user) => {
  const [rows] = await sequelize.query(`
    SELECT sc.id AS conversation_id, COUNT(smr.id) AS unread_count
    FROM support_conversations sc
    LEFT JOIN support_messages sm ON sm.support_conversation_id = sc.id
    LEFT JOIN support_message_receipts smr
      ON smr.support_message_id = sm.id
      AND smr.recipient_user_id = :userId
      AND smr.read_at IS NULL
    WHERE (:isAdmin = 1 OR sc.user_id = :userId)
    GROUP BY sc.id
  `, {
    replacements: {
      userId: Number(user.id),
      isAdmin: user.role === 'admin' ? 1 : 0,
    },
  });

  const conversations = rows.map((row) => ({
    conversation_id: Number(row.conversation_id),
    unread_count: Number(row.unread_count || 0),
  }));
  const total_unread_count = conversations.reduce((sum, row) => sum + row.unread_count, 0);

  return { total_unread_count, conversations };
};

module.exports = {
  getConversationById,
  canAccessConversation,
  formatMessageForUser,
  createMessage,
  getConversationMessagesForUser,
  markConversationAsDelivered,
  markConversationAsRead,
  getUnreadCounts,
  supportMessageInclude,
};
