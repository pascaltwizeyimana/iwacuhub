const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: '127.0.0.1',  // Use 127.0.0.1 instead of localhost
  user: 'root',
  password: '',        // Your MySQL password (leave empty if none)
  database: 'iwacuhub_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,  // Increase timeout
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('   1. Is MySQL running? Check XAMPP Control Panel');
    console.log('   2. Check if database "iwacuhub_db" exists');
    console.log('   3. Check username/password (default: root / empty)');
    console.log('   4. Check MySQL port (default: 3306)');
    return false;
  }
};

module.exports = { pool, testConnection };