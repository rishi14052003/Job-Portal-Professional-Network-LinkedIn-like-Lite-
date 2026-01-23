import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete user creation and update flow...');
    
    const testUserEmail = 'test@example.com';
    
    // Step 1: Create test user if not exists
    const [existingUser] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [testUserEmail]);
    let userId;
    
    if (existingUser.length === 0) {
      console.log('👤 Creating test user...');
      const hashed = await bcrypt.hash('password123', 10);
      const [loginResult] = await db.execute('INSERT INTO user_login (user_email, password) VALUES (?, ?)', [testUserEmail, hashed]);
      userId = loginResult.insertId;
      
      await db.execute('INSERT INTO user_details (user_id, details_completed) VALUES (?, 0)', [userId]);
      await db.execute('INSERT INTO freelancer_details (user_id) VALUES (?)', [userId]);
      console.log('✅ Test user created with ID:', userId);
    } else {
      userId = existingUser[0].id;
      console.log('✅ Using existing test user with ID:', userId);
    }
    
    // Step 2: Test the updateUserDetails function directly
    console.log('🔄 Testing updateUserDetails function...');
    
    const mockReq = {
      body: {
        user_email: testUserEmail,
        name: 'Test User Updated',
        age: 28,
        role: 'freelancer',
        skillsList: [
          { skills: 'JavaScript', experience: 3 },
          { skills: 'React', experience: 2 },
          { skills: 'Node.js', experience: 1 }
        ],
        companies: []
      }
    };
    
    let responseData = null;
    let statusCode = null;
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
          }
        };
      }
    };
    
    // Import and test the controller function
    const { updateUserDetails } = await import('./controllers/userController.js');
    
    await new Promise((resolve, reject) => {
      updateUserDetails(mockReq, mockRes, (err) => {
        if (err) {
          console.error('❌ Error occurred:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log(`📊 Response Status: ${statusCode}`);
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));
    
    // Step 3: Verify data was saved correctly
    console.log('🔍 Verifying saved data...');
    const [ud] = await db.execute('SELECT * FROM user_details WHERE user_id = ?', [userId]);
    const [fd] = await db.execute('SELECT * FROM freelancer_details WHERE user_id = ?', [userId]);
    
    console.log('✅ user_details:', ud[0]);
    console.log('✅ freelancer_details:', fd[0]);
    
    // Step 4: Test with company role
    console.log('🔄 Testing company role update...');
    
    const companyReq = {
      body: {
        user_email: testUserEmail,
        name: 'Test Company User',
        age: 35,
        role: 'company',
        companyName: 'Test Company',
        location: 'Test City',
        skillsList: [],
        companies: [{ companyName: 'Test Company', location: 'Test City' }]
      }
    };
    
    await new Promise((resolve, reject) => {
      updateUserDetails(companyReq, mockRes, (err) => {
        if (err) {
          console.error('❌ Error occurred:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
    
    console.log(`📊 Company Update Response Status: ${statusCode}`);
    console.log('📊 Company Update Response Data:', JSON.stringify(responseData, null, 2));
    
    // Verify company data
    const [ud2] = await db.execute('SELECT * FROM user_details WHERE user_id = ?', [userId]);
    console.log('✅ Updated user_details (company):', ud2[0]);
    
    // Clean up
    await db.execute('DELETE FROM user_login WHERE user_email = ?', [testUserEmail]);
    console.log('🧹 Test data cleaned up');
    
    console.log('🎉 Complete flow test successful!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testCompleteFlow();
