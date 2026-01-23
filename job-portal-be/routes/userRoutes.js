import express from 'express'
import { 
  registerUser, 
  loginUser, 
  updateUserDetails, 
  getUserByEmail, 
  deleteUserDetails,
  getUserProfile 
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/:email', getUserByEmail)

// Protected routes
router.get('/profile', protect, getUserProfile)
router.put('/update', protect, updateUserDetails)
router.delete('/details', protect, deleteUserDetails)

export default router