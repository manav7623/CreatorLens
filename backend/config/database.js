const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'brandcreator';

const isSslRequired = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false, // Set to console.log to debug SQL queries
  dialectOptions: isSslRequired ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  define: {
    timestamps: true
  }
});

async function initializeDatabase() {
  try {
    // Connect to MySQL server to ensure the database exists (local development)
    const connection = await mysql.createConnection({ 
      host, 
      port, 
      user, 
      password,
      ssl: isSslRequired ? { rejectUnauthorized: false } : undefined
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    console.log(`✅ MySQL Database "${database}" verified/created successfully.`);
  } catch (err) {
    // Managed cloud DBs like Aiven, TiDB, or Railway already provision the DB and restrict CREATE DATABASE
    console.warn(`⚠️ Notice during database initialization (${err.message}). Connecting directly to "${database}" via Sequelize...`);
  }
}

module.exports = { sequelize, initializeDatabase };

