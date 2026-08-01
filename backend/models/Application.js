const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { wrapModel } = require('../utils/sqlCompat');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  proposal: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  proposedRate: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deliverables: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  timeline: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'shortlisted', 'accepted', 'rejected', 'completed'),
    defaultValue: 'pending'
  },
  dealAmount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rating: {
    type: DataTypes.JSON,
    defaultValue: { brandRating: {}, creatorRating: {} }
  }
});

module.exports = wrapModel(Application);
