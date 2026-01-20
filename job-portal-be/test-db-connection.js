// Test Database Connection
// Run this with: node test-db-connection.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing Database Connection...\n');
  
  // Configuration from .env
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'workaholic'
  };
  
  console.log('📋 Configuration:');
  console.log(`Host: ${config.host}`);
  console.log(`User: ${config.user}`);
  console.log(`Database: ${config.database}`);
  console.log(`Password: ${config.password ? '[SET]' : '[NOT SET]'}\n`);
  
  let connection;
  
  try {
    // Step 1: Connect to MySQL (without database first)
    console.log('🔌 Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });
    console.log('✅ Connected to MySQL server successfully!');
    
    // Step 2: Check if database exists
    console.log('\n📊 Checking database existence...');
    const [databases] = await connection.execute('SHOW DATABASES LIKE ?', [config.database]);
    if (databases.length === 0) {
      console.log(`⚠️  Database '${config.database}' not found. Creating it...`);
      await connection.execute(`CREATE DATABASE ${config.database}`);
      console.log(`✅ Database '${config.database}' created successfully!`);
    } else {
      console.log(`✅ Database '${config.database}' exists!`);
    }
    
    // Step 3: Connect to the specific database
    await connection.execute(`USE ${config.database}`);
    console.log(`✅ Now using database: ${config.database}`);
    
    // Step 4: Check tables
    console.log('\n📋 Checking tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Step 5: Test basic operations
    console.log('\n🧪 Testing database operations...');
    
    // Check if user_login table exists
    const [userTableCheck] = await connection.execute(
      "SHOW TABLES LIKE 'user_login'"
    );
    
    if (userTableCheck.length === 0) {
      console.log('⚠️  user_login table not found. Creating it...');
      await connection.execute(`
        CREATE TABLE user_login (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ user_login table created!');
    } else {
      console.log('✅ user_login table exists!');
    }
    
    // Step 6: Test insert/select
    console.log('\n🔄 Testing insert/select operations...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    
    try {
      await connection.execute(
        'INSERT INTO user_login (user_email, password) VALUES (?, ?)',
        [testEmail, testPassword]
      );
      console.log('✅ Test insert successful!');
      
      const [rows] = await connection.execute(
        'SELECT * FROM user_login WHERE user_email = ?',
        [testEmail]
      );
      console.log(`✅ Test select successful! Found ${rows.length} record(s)`);
      
      // Clean up test data
      await connection.execute(
        'DELETE FROM user_login WHERE user_email = ?',
        [testEmail]
      );
      console.log('✅ Test data cleaned up!');
      
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️  Test user already exists (duplicate entry - this is normal)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    console.log('🚀 Your database is ready for the Workaholic application!');
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check if MySQL is installed correctly');
      console.log('3. Verify the host and port in your .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your username and password in .env');
      console.log('2. Make sure the user has proper privileges');
      console.log('3. Try resetting your MySQL root password');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
};

// Run the test
testConnection().catch(console.error);
