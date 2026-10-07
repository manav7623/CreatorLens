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

// Helper: build consistent direct conversation ID for two users
function getDirectConvId(userA, userB) {
  const min = Math.min(Number(userA), Number(userB));
  const max = Math.max(Number(userA), Number(userB));
  return `direct_${min}_${max}`;
}

// 1. GET /conversations - List all chat channels (Applications + Direct Chats)
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);

    // 1. Fetch all applications (deal chats)
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
          { model: User, as: 'creator', attributes: ['id', 'name', 'avatar', 'role', 'creatorProfile'] },
          { model: User, as: 'brand', attributes: ['id', 'name', 'avatar', 'role', 'brandProfile'] },
          { model: Campaign, as: 'campaign', attributes: ['id', 'title', 'budget', 'deliverables', 'status'] }
        ],
        order: [['updatedAt', 'DESC']]
      });
    }

    const appConversations = applications.map(app => {
      const json = app.toJSON ? app.toJSON() : app;
      return {
        ...json,
        id: json.id,
        _id: json.id,
        isDirect: false,
        conversationId: String(json.id)
      };
    });

    const appIds = new Set(appConversations.map(a => String(a.id)));

    // 2. Fetch all direct conversations from Messages table
    let directMessages = [];
    if (Message.findAll) {
      directMessages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'role', 'creatorProfile', 'brandProfile'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'avatar', 'role', 'creatorProfile', 'brandProfile'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    // Group direct messages by conversationId
    const directMap = new Map();
    for (const msg of directMessages) {
      const convId = String(msg.conversationId);
      // Skip if this message belongs to an application deal chat
      if (appIds.has(convId) || (!convId.startsWith('direct_') && !isNaN(convId) && appIds.has(convId))) {
        continue;
      }

      if (!directMap.has(convId)) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!otherUser) continue;

        const otherJson = otherUser.toJSON ? otherUser.toJSON() : otherUser;
        const msgJson = msg.toJSON ? msg.toJSON() : msg;

        directMap.set(convId, {
          id: convId,
          _id: convId,
          conversationId: convId,
          isDirect: true,
          status: 'active',
          otherUser: {
            ...otherJson,
            id: otherJson.id,
            _id: otherJson.id
          },
          creator: otherJson.role === 'creator' ? otherJson : (req.user.role === 'creator' ? req.user : null),
          brand: otherJson.role === 'brand' ? otherJson : (req.user.role === 'brand' ? req.user : null),
          campaign: {
            title: `Direct Chat: ${otherJson.name}`,
            status: 'active'
          },
          lastMessage: msgJson,
          updatedAt: msg.createdAt
        });
      }
    }

    const directConversations = Array.from(directMap.values());

    // Merge and sort by most recent activity
    const allConversations = [...appConversations, ...directConversations].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    res.json({ conversations: allConversations });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /search/users - Search users (creators/brands) to start a new chat
router.get('/search/users', auth, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    const { q = '' } = req.query;

    const whereClause = {
      id: { [Op.ne]: userId },
      isBanned: false,
      isActive: true
    };

    if (q.trim()) {
      whereClause.name = { [Op.like]: `%${q.trim()}%` };
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'avatar', 'role', 'creatorProfile', 'brandProfile'],
      limit: 20
    });

    res.json({
      users: users.map(u => ({
        ...u.toJSON ? u.toJSON() : u,
        id: u.id,
        _id: u.id
      }))
    });
  } catch (err) {
    console.error('Error searching chat users:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /unread/count - Get unread message count
router.get('/unread/count', auth, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    let count = 0;
    if (Message.count) {
      count = await Message.count({
        where: {
          receiverId: userId,
          isRead: false
        }
      });
    }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. POST / - Send a new message (text or media file)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    let { receiverId, message } = req.body;
    let conversationId = req.body.applicationId || req.body.conversationId || req.body.appId;

    if (conversationId === 'undefined' || conversationId === 'null') conversationId = null;

    // Direct conversation via receiverId
    if (!conversationId && receiverId) {
      const recId = Number(receiverId);
      conversationId = getDirectConvId(userId, recId);
    }

    // Resolve receiverId if missing
    if (conversationId && !receiverId) {
      if (String(conversationId).startsWith('direct_')) {
        const parts = String(conversationId).replace('direct_', '').split('_').map(Number);
        receiverId = parts[0] === userId ? parts[1] : parts[0];
      } else {
        // Find application
        const app = await Application.findByPk(conversationId);
        if (app) {
          receiverId = (app.creatorId === userId) ? app.brandId : app.creatorId;
        }
      }
    }

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID, Application ID, or Receiver ID is required' });
    }

    if (!receiverId || isNaN(Number(receiverId))) {
      return res.status(400).json({ error: 'Could not determine message receiver' });
    }

    let fileUrl = req.body.fileUrl || null;
    let fileType = req.body.fileType || null;

    if (req.file) {
      fileUrl = `/uploads/messages/${req.file.filename}`;
      fileType = req.file.mimetype;
    }

    const messageType = fileUrl ? 'media' : (req.body.messageType || 'text');

    const newMessage = await Message.create({
      conversationId: String(conversationId),
      senderId: userId,
      receiverId: Number(receiverId),
      message: message || '',
      messageType,
      fileUrl,
      fileType,
      isRead: false
    });

    const populatedSender = {
      id: userId,
      _id: userId,
      name: req.user.name,
      avatar: req.user.avatar,
      role: req.user.role
    };

    const messagePayload = {
      ...newMessage.toJSON ? newMessage.toJSON() : newMessage,
      id: newMessage.id,
      _id: newMessage.id,
      sender: populatedSender,
      application: conversationId,
      applicationId: conversationId,
      conversationId: String(conversationId)
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

// 5. GET /:conversationId - Get messages for a specific conversation
router.get('/:conversationId', auth, async (req, res) => {
  try {
    let convId = String(req.params.conversationId);
    const userId = Number(req.user.id || req.user._id);

    // If param is a direct user format like "user_26", compute direct_X_Y
    if (convId.startsWith('user_')) {
      const targetUserId = Number(convId.replace('user_', ''));
      convId = getDirectConvId(userId, targetUserId);
    }

    let messages = [];
    if (Message.findAll) {
      messages = await Message.findAll({
        where: { conversationId: convId },
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'avatar', 'role'] }
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
    }

    res.json({
      messages: messages.map(m => ({
        ...m.toJSON ? m.toJSON() : m,
        id: m.id,
        _id: m.id,
        sender: m.sender ? { ...m.sender.toJSON ? m.sender.toJSON() : m.sender, id: m.sender.id, _id: m.sender.id } : null
      }))
    });
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// 6. DELETE /conversation/:conversationId - Clear all chat in conversation
router.delete('/conversation/:conversationId', auth, async (req, res) => {
  try {
    const convId = String(req.params.conversationId);
    const userId = Number(req.user.id || req.user._id);

    // If it is an application, verify authorization
    if (!convId.startsWith('direct_')) {
      let app = null;
      if (Application.findByPk) {
        app = await Application.findByPk(convId);
      }
      if (app) {
        const creatorId = Number(app.creatorId || app.creator);
        const brandId = Number(app.brandId || app.brand);
        if (userId !== creatorId && userId !== brandId && req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Unauthorized to clear this conversation' });
        }
      }
    }

    if (Message.destroy) {
      await Message.destroy({ where: { conversationId: convId } });
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

// 7. DELETE /:id - Delete individual message
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = Number(req.user.id || req.user._id);
    let message = null;
    if (Message.findByPk) {
      message = await Message.findByPk(req.params.id);
    }

    if (!message) return res.status(404).json({ error: 'Message not found' });

    const senderId = Number(message.senderId || message.sender);
    if (senderId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
