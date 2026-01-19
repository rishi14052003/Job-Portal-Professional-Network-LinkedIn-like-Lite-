import express from 'express'
import { registerUser, loginUser, updateUserDetails, getUserByEmail, deleteUserDetails } from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()
router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/:email', getUserByEmail)
router.put('/update', protect, updateUserDetails)
router.delete('/details', protect, deleteUserDetails)
export default router

/*
import { 
  registerUser, 
  loginUser, 
  updateUserDetails, 
  getUserByEmail, 
  deleteUserDetails,
  getUserProfile 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile); 
router.get('/:email', getUserByEmail);
router.put('/update', protect, updateUserDetails);
router.delete('/details', protect, deleteUserDetails);

export default router;
*/