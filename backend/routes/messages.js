const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Application = require('../models/Application');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Setup file upload folder
const uploadDir = path.join(__dirname, '../uploads/messages');
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
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max for videos/photos
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|mov|avi|webm|quicktime|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error('Only image, video and pdf files are allowed'));
  }
});

// 1. GET /conversations - List all chat channels for current user's applications
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    let applications = [];
    if (Application.findAll) {
      applications = await Application.findAll({
        where: {
          [Op.or]: [
            { creatorId: userId },
            { brandId: userId }
          ]
        },
        include: [
          { model: User, as: 'creator', attributes: ['id', '_id', 'name', 'avatar', 'role', 'creatorProfile'] },
          { model: User, as: 'brand', attributes: ['id', '_id', 'name', 'avatar', 'role', 'brandProfile'] },
          { model: Campaign, as: 'campaign', attributes: ['id', '_id', 'title', 'budget', 'deliverables', 'status'] }
        ],
        order: [['updatedAt', 'DESC']]
      });
    } else {
      applications = await Application.find({
        $or: [{ creator: userId }, { brand: userId }]
      })
        .populate('creator', 'name avatar role creatorProfile')
        .populate('brand', 'name avatar role brandProfile')
        .populate('campaign', 'title budget deliverables status')
        .sort({ updatedAt: -1 });
    }

    res.json({ conversations: applications });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /unread/count - Get unread count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let count = 0;
    if (Message.count) {
      count = await Message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });
    } else {
      count = await Message.countDocuments({
        receiver: userId,
        isRead: false
      });
    }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST / - Send a new message (text or file attachment)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { receiverId, message } = req.body;
    const conversationId = String(req.body.applicationId || req.body.conversationId || req.body.appId);

    if (!conversationId || conversationId === 'undefined') {
      return res.status(400).json({ error: 'Conversation / Application ID is required' });
    }

    let fileUrl = req.body.fileUrl || null;
    let fileType = req.body.fileType || null;

    if (req.file) {
      fileUrl = `/uploads/messages/${req.file.filename}`;
      fileType = req.file.mimetype;
    }

    const messageType = fileUrl ? 'media' : 'text';

    const newMessage = await Message.create({
      conversationId: String(conversationId),
      senderId: userId,
      receiverId: receiverId ? Number(receiverId) : null,
      message: message || '',
      messageType,
      fileUrl,
      fileType,
      isRead: false,
    });

    const populatedSender = {
      _id: userId,
      id: userId,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role
    };

    const messagePayload = {
      ...newMessage.toJSON ? newMessage.toJSON() : newMessage,
      _id: newMessage.id || newMessage._id,
      id: newMessage.id || newMessage._id,
      sender: populatedSender,
      application: conversationId,
      conversationId: conversationId
    };

    // Emit real-time Socket.IO event to receiver and sender rooms
    const io = req.app.get('io');
    if (io) {
      const receiverRoom = String(receiverId);
      const senderRoom = String(userId);
      console.log(`[Socket.IO] Emitting message to rooms: ${receiverRoom}, ${senderRoom}`);
      
      io.to(receiverRoom).to(senderRoom).emit('receive_message', messagePayload);
      io.to(receiverRoom).to(senderRoom).emit('receiveMessage', messagePayload);
    }

    res.status(201).json({ message: messagePayload });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /:conversationId - Get messages for a specific conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    const convId = String(req.params.conversationId);
    const userId = req.user.id || req.user._id;

    let messages = [];
    if (Message.findAll) {
      messages = await Message.findAll({
        where: { conversationId: convId },
        include: [
          { model: User, as: 'sender', attributes: ['id', '_id', 'name', 'avatar', 'role'] }
        ],
        order: [['createdAt', 'ASC']]
      });

      // Mark unread messages as read
      await Message.update(
        { isRead: true },
        {
          where: {
            conversationId: convId,
            receiverId: userId,
            isRead: false
          }
        }
      );
    } else {
      messages = await Message.find({ conversationId: convId })
        .populate('sender', 'name avatar role')
        .sort({ createdAt: 1 });

      await Message.updateMany(
        { conversationId: convId, receiver: userId, isRead: false },
        { isRead: true }
      );
    }

    res.json({ messages });
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE /conversation/:conversationId - Clear all chat in conversation
router.delete('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const convId = String(req.params.conversationId);
    const userId = String(req.user.id || req.user._id);

    let app = null;
    if (Application.findByPk) {
      app = await Application.findByPk(convId);
    }
    if (!app && Application.findById) {
      app = await Application.findById(convId);
    }

    if (app) {
      const creatorId = String(app.creatorId || app.creator);
      const brandId = String(app.brandId || app.brand);
      if (userId !== creatorId && userId !== brandId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to clear this conversation' });
      }
    }

    if (Message.destroy) {
      await Message.destroy({ where: { conversationId: convId } });
    } else {
      await Message.deleteMany({ conversationId: convId });
    }

    // Emit socket event to notify other party
    const io = req.app.get('io');
    if (io) {
      io.emit('messages_cleared', { applicationId: convId, conversationId: convId });
    }

    res.json({ message: 'Conversation cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE /:id - Delete individual message
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = String(req.user.id || req.user._id);
    let message = null;
    if (Message.findByPk) {
      message = await Message.findByPk(req.params.id);
    } else {
      message = await Message.findById(req.params.id);
    }

    if (!message) return res.status(404).json({ error: 'Message not found' });

    const senderId = String(message.senderId || message.sender);
    if (senderId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    if (message.destroy) {
      await message.destroy();
    } else {
      await Message.findByIdAndDelete(req.params.id);
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
