import express from 'express'
import cors from 'cors'
import 'dotenv/config'

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Import routes
import newsRoutes from './routes/news.js'
import serviceRoutes from './routes/services.js'
import volunteerRoutes from './routes/volunteers.js'
import volunteerListRoutes from './routes/volunteer_list.js'
import aboutRoutes from './routes/about.js'

// Use routes
app.use('/api/news', newsRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/volunteers', volunteerRoutes)
app.use('/api/volunteer-list', volunteerListRoutes)
app.use('/api/about', aboutRoutes)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
