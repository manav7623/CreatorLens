const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { wrapModel } = require('../utils/sqlCompat');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('creator', 'brand', 'admin'),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  creatorProfile: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  brandProfile: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Compare password prototype method
User.prototype.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = wrapModel(User);
