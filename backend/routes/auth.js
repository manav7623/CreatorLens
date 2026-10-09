const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    if (!['creator', 'brand'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    let creatorProfile = {};
    if (role === 'creator') {
      const followers = Math.floor(10000 + Math.random() * 90000);
      const engagement = parseFloat((3 + Math.random() * 5).toFixed(2));
      const fake = Math.floor(2 + Math.random() * 10);
      const aiScore = Math.floor(70 + Math.random() * 20);
      
      creatorProfile = {
        niche: ['Tech', 'Lifestyle'],
        socialLinks: {
          instagram: { username: name.toLowerCase().replace(/ /g, '_'), followers: Math.floor(followers * 0.6) },
          youtube: { username: name.toLowerCase().replace(/ /g, ''), subscribers: Math.floor(followers * 0.4) }
        },
        aiScore,
        totalFollowers: followers,
        engagementRate: engagement,
        fakeFollowerPercentage: fake,
        bio: 'Tech enthusiast, content creator, and gadget reviewer.',
        location: 'Mumbai, India',
        rateCard: { postRate: 5000, storyRate: 2000, videoRate: 10000 },
        portfolio: []
      };
    }

    let brandProfile = {};
    if (role === 'brand') {
      brandProfile = {
        companyName: name.trim(),
        industry: 'E-commerce',
        website: '',
        description: '',
        location: 'Mumbai, India'
      };
    }

    const user = new User({ 
      name: name.trim(), 
      email: cleanEmail, 
      password, 
      role, 
      creatorProfile, 
      brandProfile 
    });
    await user.save();

    const token = jwt.sign(
      { userId: user.id || user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const safeCreatorProfile = typeof user.creatorProfile === 'string' ? JSON.parse(user.creatorProfile) : (user.creatorProfile || creatorProfile);
    const safeBrandProfile = typeof user.brandProfile === 'string' ? JSON.parse(user.brandProfile) : (user.brandProfile || brandProfile);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        creatorProfile: safeCreatorProfile,
        brandProfile: safeBrandProfile,
        isVerified: user.isVerified || false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.isBanned) return res.status(403).json({ error: 'Account has been banned' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id || user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    const safeCreatorProfile = typeof user.creatorProfile === 'string' ? JSON.parse(user.creatorProfile) : (user.creatorProfile || {});
    const safeBrandProfile = typeof user.brandProfile === 'string' ? JSON.parse(user.brandProfile) : (user.brandProfile || {});

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        creatorProfile: safeCreatorProfile,
        brandProfile: safeBrandProfile,
        isVerified: user.isVerified || false
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});


const { sendResetPasswordOTPEmail } = require('../utils/email');

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate a secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user DB
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await user.save();

    // Send email to user
    const emailResult = await sendResetPasswordOTPEmail(user.email, otp);

    if (!emailResult.success) {
      console.error('[Forgot Password Error] Failed to send email to user:', emailResult.error);
      return res.status(500).json({ 
        error: 'Unable to send OTP email at the moment. Please ensure your email address is valid and try again.' 
      });
    }

    res.json({
      message: 'A 6-digit OTP code has been sent to your email address.',
      emailSent: true
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message || 'Failed to process forgot password request.' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (!user.resetPasswordToken || String(user.resetPasswordToken).trim() !== cleanOtp) {
      return res.status(400).json({ error: 'Incorrect OTP code. Please check your email and enter the valid 6-digit code.' });
    }

    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'OTP code has expired. Please request a new code.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Update password
    user.password = password; // Hook will automatically hash it with bcrypt
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: err.message || 'Failed to reset password.' });
  }
});

module.exports = router;
