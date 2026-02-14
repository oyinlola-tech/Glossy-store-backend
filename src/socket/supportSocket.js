const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  getConversationById,
  canAccessConversation,
  createMessage,
  markConversationAsDelivered,
  markConversationAsRead,
  getUnreadCounts,
} = require('../services/supportChatService');

const toSocketSafeMessage = (message) => ({
  ...message,
  SupportMessageAttachments: (message.SupportMessageAttachments || []).map((attachment) => ({
    id: attachment.id,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    file_size: attachment.file_size,
  })),
});

const setupSupportSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (!user) return next(new Error('Invalid token'));
      socket.user = user;
      return next();
    } catch (err) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('support:join', async ({ conversationId }) => {
      try {
        const conversation = await getConversationById(conversationId);
        if (!canAccessConversation(conversation, socket.user)) {
          socket.emit('support:error', { message: 'Access denied for this conversation' });
          return;
        }
        socket.join(`support:${conversationId}`);
        await markConversationAsDelivered({ conversationId, user: socket.user });
        socket.emit('support:joined', { conversationId });
      } catch (err) {
        socket.emit('support:error', { message: err.message || 'Unable to join conversation' });
      }
    });

    socket.on('support:message', async ({ conversationId, message }) => {
      try {
        const createdMessage = await createMessage({
          conversationId,
          senderUser: socket.user,
          message,
        });
        io.to(`support:${conversationId}`).emit('support:new_message', toSocketSafeMessage(createdMessage));
        io.to(`support:${conversationId}`).emit('support:refresh_unread', { conversationId: Number(conversationId) });
      } catch (err) {
        socket.emit('support:error', { message: err.message || 'Failed to send message' });
      }
    });

    socket.on('support:mark_read', async ({ conversationId }) => {
      try {
        await markConversationAsRead({ conversationId, user: socket.user });
        io.to(`support:${conversationId}`).emit('support:conversation_read', {
          conversationId: Number(conversationId),
          reader_user_id: socket.user.id,
        });
        const unread = await getUnreadCounts(socket.user);
        socket.emit('support:unread_count', unread);
      } catch (err) {
        socket.emit('support:error', { message: err.message || 'Unable to mark as read' });
      }
    });

    socket.on('support:typing', async ({ conversationId, isTyping }) => {
      try {
        const conversation = await getConversationById(conversationId);
        if (!canAccessConversation(conversation, socket.user)) {
          socket.emit('support:error', { message: 'Access denied for this conversation' });
          return;
        }
        socket.to(`support:${conversationId}`).emit('support:typing', {
          conversationId,
          isTyping: Boolean(isTyping),
          user: {
            id: socket.user.id,
            name: socket.user.name,
            role: socket.user.role,
          },
          at: new Date().toISOString(),
        });
      } catch (err) {
        socket.emit('support:error', { message: err.message || 'Typing event failed' });
      }
    });
  });
};

module.exports = { setupSupportSocket };
