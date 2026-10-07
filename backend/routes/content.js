const express = require('express');
const router = express.Router();
const ContentSubmission = require('../models/ContentSubmission');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup file upload
const uploadDir = path.join(__dirname, '../uploads/content');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|webp|heic|heif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only images and videos allowed'));
  }
});

// CREATOR: Submit content for a campaign
router.post('/submit', auth, upload.array('files', 5), async (req, res) => {
  try {
    if (req.user.role !== 'creator') {
      return res.status(403).json({ error: 'Only creators can submit content' });
    }

    const { title, description, contentLinks, deliverable } = req.body;
    const appId = req.body.applicationId || req.body.application || req.body.appId;

    if (!appId) {
      return res.status(400).json({ error: 'Application ID is required' });
    }

    const userId = req.user.id || req.user._id;

    let application = await Application.findByPk(appId);
    if (!application) {
      application = await Application.findOne({
        _id: appId
      });
    }

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const appCreatorId = application.creatorId !== undefined ? application.creatorId : application.creator;
    if (String(appCreatorId) !== String(userId)) {
      return res.status(403).json({ error: 'This application belongs to another creator' });
    }

    // Parse content links
    let parsedLinks = [];
    try {
      parsedLinks = typeof contentLinks === 'string' ? JSON.parse(contentLinks) : (contentLinks || []);
    } catch {
      parsedLinks = [];
    }

    // Process uploaded files
    const files = (req.files || []).map(f => ({
      filename: f.originalname,
      fileType: f.mimetype,
      fileSize: f.size,
      filePath: f.path,
    }));

    const campaignId = application.campaignId !== undefined ? application.campaignId : application.campaign;
    const brandId = application.brandId !== undefined ? application.brandId : application.brand;

    const submission = await ContentSubmission.create({
      applicationId: application.id || appId,
      campaignId: campaignId,
      creatorId: userId,
      brandId: brandId,
      title: title || 'Content Submission',
      description: description || '',
      contentLinks: parsedLinks,
      files,
      deliverable: deliverable || '',
      status: 'submitted',
      submittedAt: new Date(),
    });

    res.status(201).json({
      message: 'Content submitted successfully! Brand will review it.',
      submission
    });
  } catch (err) {
    console.error('Content submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Get all submissions for their campaigns
router.get('/brand/all', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const submissions = await ContentSubmission.find({ brand: userId })
      .populate('creator', 'name creatorProfile avatar')
      .populate('campaign', 'title')
      .populate('application')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Approve content → payment release 
router.put('/approve/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'brand') {
      return res.status(403).json({ error: 'Only brands can approve content' });
    }

    const userId = req.user.id || req.user._id;
    let submission = await ContentSubmission.findOne({
      _id: req.params.id,
      brand: userId
    }) || await ContentSubmission.findByPk(req.params.id);

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'approved';
    submission.approvedAt = new Date();
    submission.brandFeedback = req.body.feedback || 'Great work!';
    await submission.save();

    // Check if payment exists and is held
    const payment = await Payment.findOne({
      application: submission.applicationId || submission.application,
      status: 'held'
    });

    res.json({
      message: 'Content approved!',
      submission,
      paymentReady: !!payment,
      paymentId: payment?._id || payment?.id,
      hint: payment ? 'You can now release payment to the creator.' : 'No payment held yet.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Request revision
router.put('/revision/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let submission = await ContentSubmission.findOne({
      _id: req.params.id,
      brand: userId
    }) || await ContentSubmission.findByPk(req.params.id);

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'revision_requested';
    submission.revisionNote = req.body.note;
    submission.brandFeedback = req.body.feedback;
    await submission.save();

    res.json({ message: 'Revision requested. Creator will be notified.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BRAND: Reject content
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let submission = await ContentSubmission.findOne({
      _id: req.params.id,
      brand: userId
    }) || await ContentSubmission.findByPk(req.params.id);

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.status = 'rejected';
    submission.brandFeedback = req.body.feedback;
    await submission.save();

    res.json({ message: 'Content rejected.', submission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATOR: Get my submissions
router.get('/creator/all', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const submissions = await ContentSubmission.find({ creator: userId })
      .populate('brand', 'name brandProfile avatar')
      .populate('campaign', 'title')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get submission by application ID
router.get('/application/:applicationId', auth, async (req, res) => {
  try {
    const submissions = await ContentSubmission.find({ application: req.params.applicationId })
      .populate('creator', 'name avatar')
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
