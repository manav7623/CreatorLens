const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 3306;
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASS || '';
const database = process.env.DB_NAME || 'brandcreator';

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false, // Set to console.log to debug SQL queries
  define: {
    timestamps: true
  }
});

async function initializeDatabase() {
  try {
    // Connect to MySQL server without database first to ensure the database exists
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    console.log(`✅ MySQL Database "${database}" verified/created successfully.`);
  } catch (err) {
    console.error('❌ Error during MySQL database creation:', err);
    throw err;
  }
}

module.exports = { sequelize, initializeDatabase };
