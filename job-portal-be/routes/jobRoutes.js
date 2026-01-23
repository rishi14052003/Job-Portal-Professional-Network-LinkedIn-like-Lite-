import express from 'express'
import {
  createJob,
  getAllJobs,
  applyToJob,
  withdrawApplication,
  getApplicantsByJob,
  respondToApplication,
  updateJob,
  deleteJob,
  getApplicationsByFreelancer
} from '../controllers/jobController.js'

const router = express.Router()

// Job management routes
router.post('/create', createJob)
router.get('/', getAllJobs)
router.put('/:jobId', updateJob)
router.delete('/:jobId', deleteJob)

// Application routes
router.post('/apply', applyToJob)
router.delete('/withdraw', withdrawApplication)
router.get('/freelancer/:user_email/applications', getApplicationsByFreelancer)

// Company-specific routes
router.get('/:jobId/applications', getApplicantsByJob)
router.put('/applications/:applicationId/respond', respondToApplication)

export default router