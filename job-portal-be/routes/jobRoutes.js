import express from 'express'
import {createJob,getAllJobs,applyToJob,withdrawApplication,getApplicantsByJob,respondToApplication,updateJob,deleteJob,getApplicationsByFreelancer} from '../controllers/jobController.js'

const router = express.Router()
router.post('/create', createJob)
router.get('/', getAllJobs)
router.post('/apply', applyToJob)
router.delete('/withdraw', withdrawApplication)
router.get('/:jobId/applications', getApplicantsByJob)
router.put('/applications/:applicationId/respond', respondToApplication)
router.put('/:jobId', updateJob)
router.delete('/:jobId', deleteJob)
router.get('/freelancer/:user_email/applications', getApplicationsByFreelancer)
export default router