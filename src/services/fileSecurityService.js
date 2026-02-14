const fs = require('fs/promises');
const { spawn } = require('child_process');
const path = require('path');

const MAGIC_SIGNATURES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
  'application/msword': [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
  'application/vnd.ms-excel': [[0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [[0x50, 0x4B, 0x03, 0x04]],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [[0x50, 0x4B, 0x03, 0x04]],
};

const hasBinaryNull = (buffer) => buffer.includes(0);

const readHeader = async (filePath, bytes = 16) => {
  const handle = await fs.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    await handle.read(buffer, 0, bytes, 0);
    return buffer;
  } finally {
    await handle.close();
  }
};

const matchesSignature = (header, signature) => {
  for (let i = 0; i < signature.length; i += 1) {
    if (header[i] !== signature[i]) return false;
  }
  return true;
};

const validateFileSignature = async (filePath, mimeType) => {
  if (mimeType === 'text/plain') {
    const header = await readHeader(filePath, 512);
    if (hasBinaryNull(header)) {
      throw new Error('File signature validation failed for text/plain');
    }
    return true;
  }

  const signatures = MAGIC_SIGNATURES[mimeType];
  if (!signatures || signatures.length === 0) {
    throw new Error(`Unsupported mime type for signature validation: ${mimeType}`);
  }

  const header = await readHeader(filePath, 16);
  const valid = signatures.some((signature) => matchesSignature(header, signature));
  if (!valid) {
    throw new Error(`File signature validation failed for ${mimeType}`);
  }
  return true;
};

const scanFileForViruses = async (filePath) => {
  if (String(process.env.VIRUS_SCAN_ENABLED || '').toLowerCase() !== 'true') {
    return { scanned: false, clean: true };
  }

  const command = process.env.VIRUS_SCAN_COMMAND;
  if (!command) {
    throw new Error('Virus scan is enabled but VIRUS_SCAN_COMMAND is not configured');
  }
  const rawArgs = process.env.VIRUS_SCAN_ARGS || '';
  const args = rawArgs.split(/\s+/).filter(Boolean);
  args.push(path.resolve(filePath));

  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore' });
    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Virus scanner returned exit code ${code}`));
    });
  });

  return { scanned: true, clean: true };
};

module.exports = {
  validateFileSignature,
  scanFileForViruses,
};
