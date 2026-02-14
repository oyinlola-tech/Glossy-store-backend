const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authMiddleware } = require('../middleware/auth');
const supportUpload = require('../middleware/supportUpload');
const { secureSupportAttachments } = require('../middleware/supportAttachmentSecurity');

router.use(authMiddleware);

router.post('/conversations', supportUpload.array('attachments', 5), secureSupportAttachments, supportController.createConversation);
router.get('/conversations', supportController.getMyConversations);
router.get('/unread-count', supportController.getUnreadCount);
router.get('/conversations/:id/messages', supportController.getConversationMessages);
router.post('/conversations/:id/messages', supportUpload.array('attachments', 5), secureSupportAttachments, supportController.sendConversationMessage);
router.patch('/conversations/:id/read', supportController.markConversationRead);
router.patch('/conversations/:id/status', supportController.updateConversationStatus);
router.get('/attachments/:attachmentId/signed-url', supportController.getAttachmentSignedUrl);
router.get('/attachments/:attachmentId/download', supportController.downloadAttachment);

module.exports = router;
