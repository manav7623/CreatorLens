require('dotenv').config();
const nodemailer = require('nodemailer');

const DEFAULT_EMAIL_USER = 'creatorlens.official03@gmail.com';
const DEFAULT_EMAIL_PASS = 'hlqsuorqkyqrimmv'; // Verified Google App Password

function getCleanClientUrl() {
  let clientUrl = process.env.CLIENT_URL || 'https://creator-lens-mu.vercel.app';
  if (clientUrl.includes(',')) {
    const parts = clientUrl.split(',');
    clientUrl = parts.find(u => u.includes('creator-lens-mu') || u.includes('vercel.app')) || parts[0] || 'https://creator-lens-mu.vercel.app';
  }
  clientUrl = clientUrl.replace(/CLIENT_URL=/gi, '').replace(/[\r\n]+/g, '').trim();
  if (!clientUrl.startsWith('http')) {
    clientUrl = 'https://creator-lens-mu.vercel.app';
  }
  return clientUrl.replace(/\/+$/, '');
}

function isValidGmailAppPassword(pass) {
  if (!pass || typeof pass !== 'string') return false;
  const clean = pass.replace(/\s+/g, '');
  return clean.length === 16 && /^[a-z]+$/.test(clean);
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const clean = email.trim();
  return clean.includes('@') && !clean.includes('your_gmail') && !clean.includes('placeholder') && !clean.includes('example.com');
}

const sendMailWithFallback = async (senderEmail, senderPass, mailOptions) => {
  // Method 1: Gmail direct SSL on Port 465 (Fastest & most reliable for Gmail App Passwords)
  try {
    const transporterGmail = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: senderEmail, pass: senderPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });
    const info = await transporterGmail.sendMail(mailOptions);
    console.log(`[Email Service Gmail/465] Sent to ${mailOptions.to}. Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (errGmail) {
    console.warn(`[Email Service Gmail/465 warning]: ${errGmail.message}. Trying SMTP Port 587 fallback...`);
  }

  // Method 2: SMTP Port 587 with STARTTLS fallback
  try {
    const transporter587 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: { user: senderEmail, pass: senderPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });
    const info = await transporter587.sendMail(mailOptions);
    console.log(`[Email Service 587] Sent to ${mailOptions.to}. Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (err587) {
    console.warn(`[Email Service 587 warning]: ${err587.message}`);
    throw err587;
  }
};

const sendResetPasswordOTPEmail = async (toEmail, otp) => {
  const clientBase = getCleanClientUrl();
  const resetUrl = `${clientBase}/auth/reset-password?email=${encodeURIComponent(toEmail)}&otp=${otp}`;

  let senderEmail = isValidEmail(process.env.EMAIL_USER) ? process.env.EMAIL_USER.trim() : DEFAULT_EMAIL_USER;
  let senderPass = isValidGmailAppPassword(process.env.EMAIL_PASS) 
    ? process.env.EMAIL_PASS.replace(/\s+/g, '') 
    : DEFAULT_EMAIL_PASS;

  const mailOptions = {
    from: `"CreatorLens Support" <${senderEmail}>`,
    to: toEmail,
    subject: `Your CreatorLens Password Reset OTP: ${otp}`,
    text: `Hello,\n\nYour 6-digit OTP code to reset your CreatorLens account password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nAlternatively, you can reset your password directly using this link:\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nCreatorLens Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4F63FF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CreatorLens</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Brand & Creator Marketplace</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">Hello,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          You requested to reset your password for your <strong>CreatorLens</strong> account. Please use the 6-digit One-Time Password (OTP) below to complete your reset:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f0f4ff; border: 1.5px dashed #4F63FF; padding: 14px 32px; border-radius: 12px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4F63FF; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 12px; color: #ef4444; font-weight: 600; margin-top: 10px;">
            ⏳ Valid for 10 minutes only. Do not share this code with anyone.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4F63FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 99, 255, 0.35);">
            Click Here to Reset Password
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          Direct reset link:<br />
          <a href="${resetUrl}" style="color: #4F63FF; word-break: break-all; font-size: 12px;">${resetUrl}</a>
        </p>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0 15px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 4px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
        <p style="font-size: 11px; color: #cbd5e1; text-align: center; margin: 0;">
          &copy; 2026 CreatorLens Inc. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    const result = await sendMailWithFallback(senderEmail, senderPass, mailOptions);
    return { success: true, otp, resetUrl, messageId: result.messageId };
  } catch (error) {
    console.warn(`[Email Service Warning] Nodemailer fallback triggered: ${error.message}`);
    return { success: false, mock: true, otp, resetUrl, error: error.message };
  }
};

module.exports = { sendResetPasswordOTPEmail };

