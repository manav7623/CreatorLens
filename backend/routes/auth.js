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

    const existingUser = await User.findOne({ email });
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
        portfolio: []
      };
    }

    const user = new User({ name, email, password, role, creatorProfile });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        creatorProfile: user.creatorProfile,
        brandProfile: user.brandProfile
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.isBanned) return res.status(403).json({ error: 'Account has been banned' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        creatorProfile: user.creatorProfile,
        brandProfile: user.brandProfile,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
