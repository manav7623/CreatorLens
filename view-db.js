const path = require('path');
require('./backend/node_modules/dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { sequelize } = require('./backend/config/database');

async function viewDatabase() {
  const tableArg = process.argv[2] ? process.argv[2].toLowerCase() : 'all';

  try {
    console.log('⏳ Connecting to Aiven Cloud Database...\n');
    await sequelize.authenticate();

    if (tableArg === 'all' || tableArg === 'users') {
      const [users] = await sequelize.query('SELECT id, name, email, role, isVerified, createdAt FROM Users ORDER BY id DESC LIMIT 20;');
      console.log('📋 === USERS TABLE (Last 20) ===');
      console.table(users);
      console.log('');
    }

    if (tableArg === 'all' || tableArg === 'campaigns') {
      const [campaigns] = await sequelize.query('SELECT id, title, brandId, budget, status, createdAt FROM Campaigns ORDER BY id DESC LIMIT 20;');
      console.log('📢 === CAMPAIGNS TABLE (Last 20) ===');
      console.table(campaigns);
      console.log('');
    }

    if (tableArg === 'all' || tableArg === 'applications') {
      const [apps] = await sequelize.query('SELECT id, campaignId, creatorId, status, dealAmount, createdAt FROM Applications ORDER BY id DESC LIMIT 20;');
      console.log('📝 === APPLICATIONS TABLE (Last 20) ===');
      console.table(apps);
      console.log('');
    }

    if (tableArg === 'all' || tableArg === 'payments') {
      const [payments] = await sequelize.query('SELECT id, campaignId, brandId, creatorId, amount, status, createdAt FROM Payments ORDER BY id DESC LIMIT 20;');
      console.log('💳 === PAYMENTS TABLE (Last 20) ===');
      console.table(payments);
      console.log('');
    }

  } catch (err) {
    console.error('❌ Database Query Error:', err.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

viewDatabase();
