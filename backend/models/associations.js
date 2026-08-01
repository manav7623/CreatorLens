const User = require('./User');
const Campaign = require('./Campaign');
const Application = require('./Application');
const Message = require('./Message');
const Payment = require('./Payment');
const ContentSubmission = require('./ContentSubmission');

function setupAssociations() {
  // Campaign relations
  Campaign.belongsTo(User, { as: 'brand', foreignKey: 'brandId', constraints: false });
  Campaign.hasMany(Application, { as: 'applications', foreignKey: 'campaignId', constraints: false });

  // Application relations
  Application.belongsTo(Campaign, { as: 'campaign', foreignKey: 'campaignId', constraints: false });
  Application.belongsTo(User, { as: 'creator', foreignKey: 'creatorId', constraints: false });
  Application.belongsTo(User, { as: 'brand', foreignKey: 'brandId', constraints: false });
  Application.hasMany(Message, { as: 'messages', foreignKey: 'conversationId', sourceKey: 'id', constraints: false });

  // Message relations
  Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId', constraints: false });
  Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId', constraints: false });

  // Payment relations
  Payment.belongsTo(Application, { as: 'application', foreignKey: 'applicationId', constraints: false });
  Payment.belongsTo(Campaign, { as: 'campaign', foreignKey: 'campaignId', constraints: false });
  Payment.belongsTo(User, { as: 'brand', foreignKey: 'brandId', constraints: false });
  Payment.belongsTo(User, { as: 'creator', foreignKey: 'creatorId', constraints: false });

  // ContentSubmission relations
  ContentSubmission.belongsTo(Application, { as: 'application', foreignKey: 'applicationId', constraints: false });
  ContentSubmission.belongsTo(Campaign, { as: 'campaign', foreignKey: 'campaignId', constraints: false });
  ContentSubmission.belongsTo(User, { as: 'brand', foreignKey: 'brandId', constraints: false });
  ContentSubmission.belongsTo(User, { as: 'creator', foreignKey: 'creatorId', constraints: false });
}

module.exports = setupAssociations;
