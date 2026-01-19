import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import jobRoutes from './routes/jobRoutes.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/users', userRoutes)
app.use('/api/jobs', jobRoutes)
app.get('/', (req, res) => res.send('<h3>Workaholic Backend API is running</h3>'))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ success: false, message: 'Internal Server Error' })
})
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
