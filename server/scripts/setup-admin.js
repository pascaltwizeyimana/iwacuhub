// server/scripts/setup-admin.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' });

async function setupAdmin() {
    console.log('🔧 iWacuHub Admin Setup\n');
    
    // Database configuration
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'iwacuhub_db'
    };
    
    console.log('📡 Connecting to database:', dbConfig.database);
    
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Generate password hash for "Iwacu*123#"
        const password = 'Iwacu*123#';
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('✅ Password hash generated');
        
        // Create sessions table if not exists
        console.log('📝 Creating sessions table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                token VARCHAR(500) NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_token (token),
                INDEX idx_expires (expires_at)
            )
        `);
        console.log('✅ Sessions table ready');
        
        // Create system_logs table if not exists
        console.log('📝 Creating system_logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS system_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                action VARCHAR(100) NOT NULL,
                user_id INT,
                details JSON,
                ip_address VARCHAR(45),
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_action (action),
                INDEX idx_user (user_id)
            )
        `);
        console.log('✅ System logs table ready');
        
        // Check if admin user already exists
        const [existing] = await connection.query(
            'SELECT id, username, email, role FROM users WHERE email = ?',
            ['kobscall@gmail.com']
        );
        
        if (existing.length > 0) {
            // Update existing user to admin
            console.log('📝 Updating existing user to admin...');
            await connection.query(`
                UPDATE users 
                SET role = 'admin',
                    is_verified = 1,
                    is_creator = 1,
                    password = ?,
                    full_name = 'Administrator',
                    updated_at = NOW()
                WHERE email = ?
            `, [hashedPassword, 'kobscall@gmail.com']);
            console.log('✅ Existing user updated to admin');
        } else {
            // Create new admin user
            console.log('📝 Creating new admin user...');
            await connection.query(`
                INSERT INTO users (
                    username, 
                    email, 
                    password, 
                    full_name, 
                    role, 
                    is_verified, 
                    is_creator,
                    bio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'admin',
                'kobscall@gmail.com',
                hashedPassword,
                'Administrator',
                'admin',
                1,
                1,
                'System Administrator - iWacuHub'
            ]);
            console.log('✅ New admin user created');
        }
        
        // Verify admin was created
        const [users] = await connection.query(`
            SELECT id, username, email, role, is_verified, is_creator, created_at 
            FROM users 
            WHERE email = 'kobscall@gmail.com'
        `);
        
        if (users.length > 0) {
            console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('✅ ADMIN USER SETUP COMPLETE');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📋 User Details:');
            console.log(`   ID: ${users[0].id}`);
            console.log(`   Username: ${users[0].username}`);
            console.log(`   Email: ${users[0].email}`);
            console.log(`   Role: ${users[0].role}`);
            console.log(`   Verified: ${users[0].is_verified ? 'Yes' : 'No'}`);
            console.log(`   Creator: ${users[0].is_creator ? 'Yes' : 'No'}`);
            console.log(`   Created: ${users[0].created_at}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n🔑 LOGIN CREDENTIALS:');
            console.log('   Email: kobscall@gmail.com');
            console.log('   Password: Iwacu*123#');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n🌐 Access Admin Dashboard:');
            console.log('   http://localhost:3000/admin/login');
            console.log('\n💡 Make sure your server is running:');
            console.log('   npm run dev\n');
        } else {
            console.log('❌ Failed to create admin user');
        }
        
    } catch (error) {
        console.error('❌ Error during setup:', error.message);
        console.error(error);
    } finally {
        await connection.end();
        console.log('📡 Database connection closed');
    }
}

// Run the setup
setupAdmin();