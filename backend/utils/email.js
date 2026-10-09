require('dotenv').config();
const nodemailer = require('nodemailer');

const DEFAULT_EMAIL_USER = 'creatorlens.official03@gmail.com';
const DEFAULT_EMAIL_PASS = 'hlqsuorqkyqrimmv'; // Google App Password

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

// HTTPS-based email senders (Port 443 - 100% reliable on Render, Vercel, Railway, AWS)
const sendViaResendHttp = async (toEmail, subject, html, text) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'CreatorLens <onboarding@resend.dev>',
        to: [toEmail],
        subject,
        html,
        text
      })
    });
    const data = await res.json();
    if (res.ok && data.id) {
      console.log(`[Email Service Resend HTTPS] Sent to ${toEmail}. Message ID: ${data.id}`);
      return { success: true, messageId: data.id };
    }
    console.warn(`[Email Service Resend Error]:`, data);
  } catch (err) {
    console.warn(`[Email Service Resend Exception]: ${err.message}`);
  }
  return null;
};

const sendViaBrevoHttp = async (toEmail, subject, html, text, senderEmail) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'CreatorLens Support', email: senderEmail },
        to: [{ email: toEmail }],
        subject,
        htmlContent: html,
        textContent: text
      })
    });
    const data = await res.json();
    if (res.ok && data.messageId) {
      console.log(`[Email Service Brevo HTTPS] Sent to ${toEmail}. Message ID: ${data.messageId}`);
      return { success: true, messageId: data.messageId };
    }
    console.warn(`[Email Service Brevo Error]:`, data);
  } catch (err) {
    console.warn(`[Email Service Brevo Exception]: ${err.message}`);
  }
  return null;
};

const sendMailWithFallback = async (senderEmail, senderPass, mailOptions) => {
  // 1. Try HTTPS APIs first if configured (Bypasses all firewall port blocks)
  const resendResult = await sendViaResendHttp(mailOptions.to, mailOptions.subject, mailOptions.html, mailOptions.text);
  if (resendResult) return resendResult;

  const brevoResult = await sendViaBrevoHttp(mailOptions.to, mailOptions.subject, mailOptions.html, mailOptions.text, senderEmail);
  if (brevoResult) return brevoResult;

  const errors = [];

  // Method 1: Gmail direct SSL on Port 465 with IPv4 force (fast fail if port blocked)
  try {
    const transporter465 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      family: 4,
      auth: { user: senderEmail, pass: senderPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 2500,
      greetingTimeout: 2500,
      socketTimeout: 4000
    });
    const info = await transporter465.sendMail(mailOptions);
    console.log(`[Email Service Port 465] Successfully sent to ${mailOptions.to}. Response: ${info.response || info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err465) {
    console.warn(`[Email Service Port 465 Warning]: ${err465.message}`);
    errors.push(`Port 465: ${err465.message}`);
  }

  // Method 2: SMTP Port 587 with STARTTLS and IPv4 force
  try {
    const transporter587 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
      auth: { user: senderEmail, pass: senderPass },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 2500,
      greetingTimeout: 2500,
      socketTimeout: 4000
    });
    const info = await transporter587.sendMail(mailOptions);
    console.log(`[Email Service Port 587] Successfully sent to ${mailOptions.to}. Response: ${info.response || info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err587) {
    console.warn(`[Email Service Port 587 Warning]: ${err587.message}`);
    errors.push(`Port 587: ${err587.message}`);
  }

  throw new Error(`SMTP connection unreachable (Port blocked by cloud hosting): ${errors.join(' | ')}`);
};

const sendResetPasswordOTPEmail = async (toEmail, otp) => {
  const clientBase = getCleanClientUrl();
  const resetUrl = `${clientBase}/auth/reset-password?email=${encodeURIComponent(toEmail)}`;

  let senderEmail = isValidEmail(process.env.EMAIL_USER) ? process.env.EMAIL_USER.trim() : DEFAULT_EMAIL_USER;
  let senderPass = isValidGmailAppPassword(process.env.EMAIL_PASS) 
    ? process.env.EMAIL_PASS.replace(/\s+/g, '') 
    : DEFAULT_EMAIL_PASS;

  const mailOptions = {
    from: `"CreatorLens Support" <${senderEmail}>`,
    to: toEmail,
    subject: `Your CreatorLens Password Reset OTP: ${otp}`,
    text: `Hello,\n\nYour 6-digit OTP code to reset your CreatorLens account password is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nOpen the link below to enter your OTP and set a new password:\n${resetUrl}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nCreatorLens Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4F63FF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">CreatorLens</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: 500;">Brand & Creator Marketplace</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        
        <p style="font-size: 15px; color: #1e293b; line-height: 1.6; margin-bottom: 12px;">Hello,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">
          You requested to reset your password for your <strong>CreatorLens</strong> account. Please use the 6-digit One-Time Password (OTP) below to complete your password reset:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #f0f4ff; border: 2px dashed #4F63FF; padding: 16px 36px; border-radius: 14px;">
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #4F63FF; font-family: monospace;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #ef4444; font-weight: 600; margin-top: 12px;">
            ⏳ Valid for 10 minutes only. Do not share this OTP with anyone.
          </p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4F63FF; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; font-size: 14px; box-shadow: 0 4px 14px rgba(79, 99, 255, 0.35);">
            Go to Reset Password Page
          </a>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
          Reset page link:<br />
          <a href="${resetUrl}" style="color: #4F63FF; word-break: break-all; font-size: 12px;">${resetUrl}</a>
        </p>

        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0 15px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 4px;">
          If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
        <p style="font-size: 11px; color: #cbd5e1; text-align: center; margin: 0;">
          &copy; ${new Date().getFullYear()} CreatorLens Inc. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    const result = await sendMailWithFallback(senderEmail, senderPass, mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`[Email Service Critical Error]: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendResetPasswordOTPEmail };

