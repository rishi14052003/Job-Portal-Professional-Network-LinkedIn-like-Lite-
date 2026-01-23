import db from './config/db.js';

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful:', rows[0]);
    
    // Check if required tables exist
    const [tables] = await db.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      AND TABLE_NAME IN ('user_login', 'user_details', 'freelancer_details', 'jobs', 'job_applications')
    `);
    console.log('✅ Found tables:', tables.map(t => t.TABLE_NAME));
    
    // Test user_details table structure
    const [userDetailsStructure] = await db.execute('DESCRIBE user_details');
    console.log('✅ user_details table structure:', userDetailsStructure.map(col => `${col.Field} (${col.Type})`));
    
    // Test freelancer_details table structure
    const [freelancerDetailsStructure] = await db.execute('DESCRIBE freelancer_details');
    console.log('✅ freelancer_details table structure:', freelancerDetailsStructure.map(col => `${col.Field} (${col.Type})`));
    
    // Test a sample query
    const [sampleUsers] = await db.execute('SELECT COUNT(*) as count FROM user_login');
    console.log('✅ Total users in database:', sampleUsers[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
