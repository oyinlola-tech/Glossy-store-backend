const getBrandTokens = () => ({
  brandName: process.env.BRAND_NAME || 'Glossy Store',
  supportEmail: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || '',
  appUrl: process.env.APP_BASE_URL || '#',
  accentPrimary: process.env.BRAND_PRIMARY_COLOR || '#D4AF37',
  accentSecondary: process.env.BRAND_SECONDARY_COLOR || '#2F3A5A',
  accentTertiary: process.env.BRAND_TERTIARY_COLOR || '#E94F7A',
});

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const baseTemplate = ({ title, preheader, contentHtml, ctaLabel, ctaUrl }) => {
  const t = getBrandTokens();
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f1e8;font-family:Segoe UI,Arial,sans-serif;color:#1f2430;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(31,36,48,0.15);">
            <tr>
              <td style="padding:28px;background:linear-gradient(135deg, ${t.accentPrimary}, ${t.accentTertiary});color:#ffffff;">
                <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:700;letter-spacing:0.4px;">${t.brandName}</h1>
                <p style="margin:8px 0 0 0;font-size:14px;opacity:0.95;">Luxury Shopping, Seamless Security</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 32px 8px 32px;">${contentHtml}</td>
            </tr>
            ${ctaLabel && ctaUrl ? `
            <tr>
              <td style="padding:8px 32px 24px 32px;">
                <a href="${ctaUrl}" style="display:inline-block;background:${t.accentSecondary};color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:999px;font-size:14px;font-weight:600;">${ctaLabel}</a>
              </td>
            </tr>` : ''}
            <tr>
              <td style="padding:18px 32px 28px 32px;background:#faf7f2;border-top:1px solid #f0e6d6;">
                <p style="margin:0;font-size:12px;color:#5b6370;line-height:1.6;">
                  Need help? Contact us at <a href="mailto:${t.supportEmail}" style="color:${t.accentSecondary};text-decoration:none;">${t.supportEmail}</a><br/>
                  © ${new Date().getFullYear()} ${t.brandName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
};

const otpPurposeText = {
  registration: 'Complete your registration',
  login: 'Confirm your new-device login',
  forgot_password: 'Reset your password securely',
  delete_account: 'Confirm account deletion request',
};

const renderOtpTemplate = ({ otp, purpose }) => {
  const t = getBrandTokens();
  const action = otpPurposeText[purpose] || 'Confirm your secure action';
  return baseTemplate({
    title: `${t.brandName} Security Code`,
    preheader: `${action} with this one-time verification code.`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">${action}</h2>
      <p style="margin:0 0 16px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        For your security, use the verification code below. This code expires in 10 minutes and can only be used once.
      </p>
      <div style="margin:18px 0 20px 0;padding:16px;background:#fff7e7;border:1px solid #f2dfba;border-radius:14px;text-align:center;">
        <span style="font-size:34px;letter-spacing:9px;font-weight:700;color:${t.accentSecondary};">${otp}</span>
      </div>
      <p style="margin:0 0 6px 0;font-size:13px;color:#5b6370;line-height:1.6;">
        If you did not request this action, secure your account immediately by changing your password.
      </p>`,
    ctaLabel: 'Open Glossy Store',
    ctaUrl: t.appUrl,
  });
};

const renderWelcomeTemplate = ({ name }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `Welcome to ${t.brandName}`,
    preheader: `Your ${t.brandName} account is now active.`,
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">Welcome, ${escapeHtml(name || 'Valued Customer')}.</h2>
      <p style="margin:0 0 12px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        Your account has been successfully verified. You can now shop curated collections, manage your wishlist, and track every order in real time.
      </p>
      <p style="margin:0;font-size:15px;color:#3b4352;line-height:1.7;">
        We designed your experience to be elegant, secure, and effortless from cart to checkout.
      </p>`,
    ctaLabel: 'Start Shopping',
    ctaUrl: t.appUrl,
  });
};

const renderDeviceChangeTemplate = ({ ipAddress }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `${t.brandName} Security Alert`,
    preheader: 'A new device or network was detected on your account.',
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">New login environment detected</h2>
      <p style="margin:0 0 14px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        We detected a login attempt from a new IP address:
      </p>
      <p style="margin:0 0 18px 0;font-size:16px;color:${t.accentSecondary};font-weight:700;">${escapeHtml(ipAddress)}</p>
      <p style="margin:0;font-size:14px;color:#5b6370;line-height:1.7;">
        If this was you, continue with your OTP verification. If this was not you, reset your password immediately and contact support.
      </p>`,
    ctaLabel: 'Secure Account',
    ctaUrl: `${t.appUrl}/security`,
  });
};

const renderContactReplyTemplate = ({ name, reply }) => {
  const t = getBrandTokens();
  return baseTemplate({
    title: `${t.brandName} Support Reply`,
    preheader: 'Our support team has replied to your message.',
    contentHtml: `
      <h2 style="margin:0 0 12px 0;font-size:24px;color:#141926;">Hello ${escapeHtml(name || 'there')},</h2>
      <p style="margin:0 0 12px 0;font-size:15px;color:#3b4352;line-height:1.7;">
        Thank you for contacting ${t.brandName}. Our team has reviewed your message and provided the response below:
      </p>
      <div style="padding:16px 18px;background:#f8fbff;border:1px solid #d7e3f8;border-radius:14px;">
        <p style="margin:0;font-size:14px;color:#243047;line-height:1.8;">${escapeHtml(reply)}</p>
      </div>`,
    ctaLabel: 'Visit Glossy Store',
    ctaUrl: t.appUrl,
  });
};

module.exports = {
  renderOtpTemplate,
  renderWelcomeTemplate,
  renderDeviceChangeTemplate,
  renderContactReplyTemplate,
};
