import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function testDB() {
  console.log('Testing database connection...');
  
  try {
    // First connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root'
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'workaholic'}`);
    console.log('✅ Database created/verified');
    
    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'workaholic'}`);
    console.log('✅ Using database');
    
    // Create user_login table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_login (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_login table ready');
    
    await connection.end();
    console.log('✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Code:', error.code);
  }
}

testDB();
