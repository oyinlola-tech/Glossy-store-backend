const transporter = require('../config/email');
const {
  renderOtpTemplate,
  renderWelcomeTemplate,
  renderDeviceChangeTemplate,
  renderContactReplyTemplate,
} = require('./emailTemplates');

const sendEmail = async ({ to, subject, html }) => {
  const fromName = process.env.EMAIL_FROM_NAME || process.env.BRAND_NAME || 'Glossy Store';
  const fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER;
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp, purpose) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} verification code`;
  const html = renderOtpTemplate({ otp, purpose });
  return sendEmail({ to: email, subject, html });
};

const sendWelcomeEmail = async (email, name) => {
  const subject = `Welcome to ${process.env.BRAND_NAME || 'Glossy Store'}`;
  const html = renderWelcomeTemplate({ name });
  return sendEmail({ to: email, subject, html });
};

const sendDeviceChangeEmail = async (email, ip) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} security alert`;
  const html = renderDeviceChangeTemplate({ ipAddress: ip });
  return sendEmail({ to: email, subject, html });
};

const sendContactReplyEmail = async (email, name, reply) => {
  const subject = `${process.env.BRAND_NAME || 'Glossy Store'} support response`;
  const html = renderContactReplyTemplate({ name, reply });
  return sendEmail({ to: email, subject, html });
};

module.exports = { sendEmail, sendOTPEmail, sendWelcomeEmail, sendDeviceChangeEmail, sendContactReplyEmail };
