import db from './config/db.js';

async function testUserUpdate() {
  try {
    console.log('Testing user details update...');
    
    // Simulate the exact data that frontend sends
    const testUserEmail = 'test@example.com';
    const testUserData = {
      user_email: testUserEmail,
      name: 'Test User',
      age: 25,
      role: 'freelancer',
      skillsList: [
        { skills: 'JavaScript', experience: 2 },
        { skills: 'React', experience: 1 }
      ],
      companies: []
    };
    
    console.log('📝 Test data:', JSON.stringify(testUserData, null, 2));
    
    // Check if user exists
    const [userRows] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [testUserEmail]);
    if (userRows.length === 0) {
      console.log('❌ Test user not found, creating one...');
      const bcrypt = await import('bcryptjs');
      const hashed = await bcrypt.hash('password123', 10);
      const [loginResult] = await db.execute('INSERT INTO user_login (user_email, password) VALUES (?, ?)', [testUserEmail, hashed]);
      const userId = loginResult.insertId;
      
      await db.execute('INSERT INTO user_details (user_id, details_completed) VALUES (?, 0)', [userId]);
      await db.execute('INSERT INTO freelancer_details (user_id) VALUES (?)', [userId]);
      console.log('✅ Test user created');
    }
    
    // Get user ID
    const [userRows2] = await db.execute('SELECT id FROM user_login WHERE user_email = ?', [testUserEmail]);
    const userId = userRows2[0].id;
    console.log('👤 User ID:', userId);
    
    // Test the update process step by step
    console.log('🔄 Step 1: Updating user_details...');
    await db.execute('UPDATE user_details SET name = ?, age = ?, role = ?, details_completed = 1 WHERE user_id = ?', 
      [testUserData.name, testUserData.age, testUserData.role, userId]);
    console.log('✅ user_details updated');
    
    console.log('🔄 Step 2: Preparing freelancer data...');
    const transformedSkills = testUserData.skillsList.map(item => ({
      skills: item.skills || item.skill || '',
      experience: item.experience || 0
    })).filter(item => item.skills);
    console.log('📋 Transformed skills:', JSON.stringify(transformedSkills, null, 2));
    
    console.log('🔄 Step 3: Updating freelancer_details...');
    await db.execute('UPDATE freelancer_details SET name = ?, skills_json = ?, experience = ? WHERE user_id = ?', 
      [testUserData.name, JSON.stringify(transformedSkills), JSON.stringify(transformedSkills), userId]);
    console.log('✅ freelancer_details updated');
    
    console.log('🔄 Step 4: Verifying data...');
    const [ud] = await db.execute('SELECT * FROM user_details WHERE user_id = ?', [userId]);
    const [fd] = await db.execute('SELECT * FROM freelancer_details WHERE user_id = ?', [userId]);
    
    console.log('✅ user_details:', ud[0]);
    console.log('✅ freelancer_details:', fd[0]);
    
    console.log('🎉 Test completed successfully!');
    
    // Clean up test data
    await db.execute('DELETE FROM user_login WHERE user_email = ?', [testUserEmail]);
    console.log('🧹 Test data cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testUserUpdate();
