const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { wrapModel } = require('../utils/sqlCompat');

const Campaign = sequelize.define('Campaign', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
    allowNull: false
  },
  niche: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  platforms: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  budget: {
    type: DataTypes.JSON,
    defaultValue: { min: 0, max: 0, currency: 'INR' }
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: { minFollowers: 1000, minEngagement: 1, location: [] }
  },
  deliverables: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'closed', 'completed'),
    defaultValue: 'active'
  },
  shortlistedCreators: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isBoosted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  }
});

module.exports = wrapModel(Campaign);
