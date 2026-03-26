const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function createDemoUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'iwacuhub_db'
  });

  const password = 'demo123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      ['demo@iwacuhub.com']
    );
    
    if (existing.length > 0) {
      // Update existing user
      await connection.execute(
        `UPDATE users SET 
          password = ?, 
          full_name = 'Demo User',
          is_verified = 1, 
          is_creator = 1
        WHERE email = ?`,
        [hashedPassword, 'demo@iwacuhub.com']
      );
      console.log('✅ Demo user updated successfully!');
    } else {
      // Insert new user
      await connection.execute(
        `INSERT INTO users (username, email, password, full_name, is_verified, is_creator) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['demo_user', 'demo@iwacuhub.com', hashedPassword, 'Demo User', 1, 1]
      );
      console.log('✅ Demo user created successfully!');
    }
    
    console.log('\n📝 Login Credentials:');
    console.log('   Email: demo@iwacuhub.com');
    console.log('   Password: demo123');
    
    // Show all users
    const [users] = await connection.execute('SELECT id, username, email, full_name FROM users');
    console.log('\n📊 All users in database:');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.email})`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await connection.end();
}

createDemoUser();