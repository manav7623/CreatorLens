const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { wrapModel } = require('../utils/sqlCompat');

const ContentSubmission = sequelize.define('ContentSubmission', {
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
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contentLinks: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  files: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  screenshots: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deliverable: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'revision_requested', 'rejected'),
    defaultValue: 'submitted'
  },
  brandFeedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  revisionNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = wrapModel(ContentSubmission);
