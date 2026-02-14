const crypto = require('crypto');

const getSecret = () => process.env.ATTACHMENT_URL_SECRET || process.env.JWT_SECRET;

const signPayload = (attachmentId, userId, expiresAt) => {
  const secret = getSecret();
  const payload = `${attachmentId}:${userId}:${expiresAt}`;
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
};

const createSignedAttachmentUrl = (attachmentId, userId, basePath = '/api/support/attachments') => {
  const ttlSeconds = Number(process.env.ATTACHMENT_URL_TTL_SECONDS || 300);
  const expiresAt = Date.now() + ttlSeconds * 1000;
  const sig = signPayload(attachmentId, userId, expiresAt);
  return `${basePath}/${attachmentId}/download?expires=${expiresAt}&sig=${sig}`;
};

const verifySignedAttachmentUrl = ({ attachmentId, userId, expires, sig }) => {
  if (!expires || !sig) return false;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  const expected = signPayload(attachmentId, userId, expiresAt);
  const sigBuffer = Buffer.from(sig, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
};

module.exports = {
  createSignedAttachmentUrl,
  verifySignedAttachmentUrl,
};
