const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { wrapModel } = require('../utils/sqlCompat');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  applicationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  platformFee: {
    type: DataTypes.DOUBLE,
    defaultValue: 0
  },
  creatorAmount: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'held', 'released', 'refunded', 'disputed'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.JSON,
    defaultValue: { type: 'card' }
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  heldAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  releasedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  creatorBankDetails: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  hooks: {
    beforeValidate: (payment) => {
      if (!payment.transactionId) {
        payment.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();
      }
    }
  }
});

module.exports = wrapModel(Payment);
