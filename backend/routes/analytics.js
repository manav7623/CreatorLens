const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Application = require('../models/Application');
const { auth } = require('../middleware/auth');

// Creator analytics
router.get('/creator', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const creator = await User.findById(userId);
    
    const totalApplications = await Application.countDocuments({ creator: userId });
    const acceptedApplications = await Application.countDocuments({ 
      creator: userId, 
      status: 'accepted' 
    });
    const completedCollabs = await Application.countDocuments({
      creator: userId,
      status: 'completed'
    });
    
    const earnings = await Application.aggregate([
      { $match: { creator: userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$dealAmount' } } }
    ]);

    // Monthly application trend
    const monthlyData = await Application.aggregate([
      { $match: { creator: userId } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 }
    ]);

    const creatorProfile = creator ? (typeof creator.creatorProfile === 'string' ? JSON.parse(creator.creatorProfile) : (creator.creatorProfile || {})) : {};

    res.json({
      stats: {
        totalApplications: totalApplications || 0,
        acceptedApplications: acceptedApplications || 0,
        completedCollabs: completedCollabs || 0,
        totalEarnings: earnings?.[0]?.total || 0,
        successRate: totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0
      },
      profile: creatorProfile,
      monthlyData: Array.isArray(monthlyData) ? monthlyData : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Brand analytics
router.get('/brand', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const totalCampaigns = await Campaign.countDocuments({ brand: userId });
    const activeCampaigns = await Campaign.countDocuments({ brand: userId, status: 'active' });
    const totalApplications = await Application.countDocuments({ brand: userId });
    const acceptedApplications = await Application.countDocuments({
      brand: userId,
      status: 'accepted'
    });

    const totalSpend = await Application.aggregate([
      { $match: { brand: userId, status: { $in: ['accepted', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$dealAmount' } } }
    ]);

    // Campaign performance
    const campaigns = await Campaign.find({ brand: userId })
      .select('title views status')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalCampaigns: totalCampaigns || 0,
        activeCampaigns: activeCampaigns || 0,
        totalApplications: totalApplications || 0,
        acceptedApplications: acceptedApplications || 0,
        totalSpend: totalSpend?.[0]?.total || 0
      },
      recentCampaigns: Array.isArray(campaigns) ? campaigns : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
