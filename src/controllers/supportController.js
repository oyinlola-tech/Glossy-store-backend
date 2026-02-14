const fs = require('fs');
const path = require('path');
const {
  SupportConversation,
  SupportMessageAttachment,
  SupportMessage,
  User,
} = require('../models');
const { createSignedAttachmentUrl, verifySignedAttachmentUrl } = require('../services/attachmentUrlService');
const {
  createMessage,
  getConversationById,
  canAccessConversation,
  getConversationMessagesForUser,
  markConversationAsDelivered,
  markConversationAsRead,
  getUnreadCounts,
} = require('../services/supportChatService');

const toAttachmentPayload = (files = []) => files.map((file) => ({
  storage_path: file.path,
  file_name: file.originalname,
  mime_type: file.mimetype,
  file_size: file.size,
}));

const toSocketSafeMessage = (message) => ({
  ...message,
  SupportMessageAttachments: (message.SupportMessageAttachments || []).map((attachment) => ({
    id: attachment.id,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    file_size: attachment.file_size,
  })),
});

exports.createConversation = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const conversation = await SupportConversation.create({
      user_id: req.user.id,
      subject: subject || null,
      status: 'open',
      last_message_at: new Date(),
    });

    let firstMessage = null;
    const attachments = toAttachmentPayload(req.files);
    if ((message && String(message).trim()) || attachments.length) {
      firstMessage = await createMessage({
        conversationId: conversation.id,
        senderUser: req.user,
        message,
        attachments,
      });
    }

    return res.status(201).json({ conversation, firstMessage });
  } catch (err) {
    return next(err);
  }
};

exports.getMyConversations = async (req, res, next) => {
  try {
    const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };
    const conversations = await SupportConversation.findAll({
      where,
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
      order: [['last_message_at', 'DESC'], ['created_at', 'DESC']],
    });
    const unread = await getUnreadCounts(req.user);
    const unreadByConversation = new Map(unread.conversations.map((c) => [c.conversation_id, c.unread_count]));
    return res.json(conversations.map((conversation) => ({
      ...conversation.toJSON(),
      unread_count: unreadByConversation.get(conversation.id) || 0,
    })));
  } catch (err) {
    return next(err);
  }
};

exports.getConversationMessages = async (req, res, next) => {
  try {
    const payload = await getConversationMessagesForUser({
      conversationId: req.params.id,
      user: req.user,
    });
    await markConversationAsDelivered({ conversationId: req.params.id, user: req.user });

    return res.json(payload);
  } catch (err) {
    if (err.message === 'Access denied') {
      return res.status(403).json({ error: err.message });
    }
    return next(err);
  }
};

exports.sendConversationMessage = async (req, res, next) => {
  try {
    const createdMessage = await createMessage({
      conversationId: req.params.id,
      senderUser: req.user,
      message: req.body.message,
      attachments: toAttachmentPayload(req.files),
    });

    const io = req.app.get('io');
    if (io) {
      io.to(`support:${req.params.id}`).emit('support:new_message', toSocketSafeMessage(createdMessage));
      io.to(`support:${req.params.id}`).emit('support:refresh_unread', { conversationId: Number(req.params.id) });
    }

    return res.status(201).json(createdMessage);
  } catch (err) {
    if (err.message === 'Support conversation not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === 'Message cannot be empty' || err.message === 'Message or attachment is required') {
      return res.status(400).json({ error: err.message });
    }
    return next(err);
  }
};

exports.getAttachmentSignedUrl = async (req, res, next) => {
  try {
    const attachment = await SupportMessageAttachment.findByPk(req.params.attachmentId, {
      include: [{
        model: SupportMessage,
        include: [{ model: SupportConversation }],
      }],
    });
    if (!attachment || !attachment.SupportMessage || !attachment.SupportMessage.SupportConversation) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    const conversation = attachment.SupportMessage.SupportConversation;
    if (!canAccessConversation(conversation, req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const signedUrl = createSignedAttachmentUrl(attachment.id, req.user.id);
    return res.json({
      attachment_id: attachment.id,
      file_name: attachment.file_name,
      mime_type: attachment.mime_type,
      file_size: attachment.file_size,
      signed_url: signedUrl,
    });
  } catch (err) {
    return next(err);
  }
};

exports.downloadAttachment = async (req, res, next) => {
  try {
    const { expires, sig } = req.query;
    const attachment = await SupportMessageAttachment.findByPk(req.params.attachmentId, {
      include: [{
        model: SupportMessage,
        include: [{ model: SupportConversation }],
      }],
    });
    if (!attachment || !attachment.SupportMessage || !attachment.SupportMessage.SupportConversation) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    const conversation = attachment.SupportMessage.SupportConversation;
    if (!canAccessConversation(conversation, req.user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const valid = verifySignedAttachmentUrl({
      attachmentId: attachment.id,
      userId: req.user.id,
      expires,
      sig,
    });
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired attachment signature' });
    }

    const absolutePath = path.resolve(attachment.storage_path);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: 'Attachment file missing on server' });
    }

    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
    return res.sendFile(absolutePath);
  } catch (err) {
    return next(err);
  }
};

exports.markConversationRead = async (req, res, next) => {
  try {
    const result = await markConversationAsRead({
      conversationId: req.params.id,
      user: req.user,
    });
    const io = req.app.get('io');
    if (io) {
      io.to(`support:${req.params.id}`).emit('support:conversation_read', {
        conversationId: Number(req.params.id),
        reader_user_id: req.user.id,
      });
      io.to(`support:${req.params.id}`).emit('support:refresh_unread', { conversationId: Number(req.params.id) });
    }
    return res.json(result);
  } catch (err) {
    if (err.message === 'Support conversation not found') {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === 'Access denied') {
      return res.status(403).json({ error: err.message });
    }
    return next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const data = await getUnreadCounts(req.user);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
};

exports.updateConversationStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { status } = req.body;
    if (!['open', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const conversation = await SupportConversation.findByPk(req.params.id);
    if (!conversation) return res.status(404).json({ error: 'Support conversation not found' });
    conversation.status = status;
    await conversation.save();
    return res.json(conversation);
  } catch (err) {
    return next(err);
  }
};
