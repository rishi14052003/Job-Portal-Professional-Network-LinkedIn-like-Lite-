import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', userRoutes);

// Test the updateUserDetails endpoint directly
async function testUpdateEndpoint() {
  try {
    console.log('🧪 Testing updateUserDetails API endpoint...');
    
    // Create a test request object
    const mockReq = {
      body: {
        user_email: 'test@example.com',
        name: 'Test User',
        age: 25,
        role: 'freelancer',
        skillsList: [
          { skills: 'JavaScript', experience: 2 },
          { skills: 'React', experience: 1 }
        ],
        companies: []
      }
    };
    
    // Create a mock response object
    let responseData = null;
    let statusCode = null;
    const mockRes = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            responseData = data;
            console.log(`📊 Response Status: ${statusCode}`);
            console.log('📊 Response Data:', JSON.stringify(data, null, 2));
          }
        };
      }
    };
    
    // Import and test the controller function
    const { updateUserDetails } = await import('./controllers/userController.js');
    
    console.log('📝 Sending request:', JSON.stringify(mockReq.body, null, 2));
    
    // Call the function
    await updateUserDetails(mockReq, mockRes, (err) => {
      if (err) {
        console.error('❌ Error occurred:', err);
        console.error('Stack trace:', err.stack);
      } else {
        console.log('✅ API endpoint test completed');
      }
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testUpdateEndpoint();
