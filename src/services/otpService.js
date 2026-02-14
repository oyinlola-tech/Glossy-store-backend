const { OTP } = require('../models');
const { Op } = require('sequelize');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail } = require('./emailService');

const createOTP = async (email, purpose, userId = null) => {
  // Delete any existing OTPs for this email/purpose
  await OTP.destroy({ where: { email, purpose, verified: false } });

  const otpCode = generateOTP();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const otp = await OTP.create({
    user_id: userId,
    email,
    purpose,
    otp_code: otpCode,
    expires_at,
  });

  // Send email
  await sendOTPEmail(email, otpCode, purpose);

  return otp;
};

const verifyOTP = async (email, otpCode, purpose) => {
  const otp = await OTP.findOne({
    where: {
      email,
      otp_code: otpCode,
      purpose,
      verified: false,
      expires_at: { [Op.gt]: new Date() },
    },
  });

  if (!otp) return null;

  otp.verified = true;
  await otp.save();
  return otp;
};

module.exports = { createOTP, verifyOTP };
