const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: '127.0.0.1',  // Change from localhost to 127.0.0.1
  user: 'root',
  password: '',  // Your MySQL password (leave empty if none)
  database: 'iwacuhub_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Connection failed:', error.message);
    console.log('   Please make sure:');
    console.log('   1. MySQL is running');
    console.log('   2. Database "iwacuhub_db" exists');
    console.log('   3. Username and password are correct');
    return false;
  }
};

module.exports = { pool, testConnection };