const fs = require('fs/promises');
const { validateFileSignature, scanFileForViruses } = require('../services/fileSecurityService');

const cleanupFiles = async (files = []) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.unlink(file.path);
    } catch (err) {
      // ignore cleanup errors
    }
  }));
};

const secureSupportAttachments = async (req, res, next) => {
  try {
    const files = req.files || [];
    for (const file of files) {
      await validateFileSignature(file.path, file.mimetype);
      await scanFileForViruses(file.path);
    }
    return next();
  } catch (err) {
    await cleanupFiles(req.files || []);
    return res.status(400).json({ error: `Attachment rejected: ${err.message}` });
  }
};

module.exports = { secureSupportAttachments };
