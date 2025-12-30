import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get all services
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
            SELECT s.*,
                   COUNT(v.id) as volunteer_count
            FROM services s
            LEFT JOIN volunteers v ON s.id = v.service_id
            GROUP BY s.id
            ORDER BY s.service_date DESC, s.service_time DESC
        `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get service by date range
router.get('/schedule/:startDate/:endDate', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM services WHERE service_date BETWEEN ? AND ? ORDER BY service_date, service_time',
      [req.params.startDate, req.params.endDate],
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create service
router.post('/', async (req, res) => {
  try {
    const { service_date, service_time, service_type, title, description, leader, location } =
      req.body
    const [result] = await db.query(
      'INSERT INTO services (service_date, service_time, service_type, title, description, leader, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [service_date, service_time, service_type, title, description, leader, location],
    )
    res.json({ id: result.insertId, message: 'Service created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update service
router.put('/:id', async (req, res) => {
  try {
    const { service_date, service_time, service_type, title, description, leader, location } =
      req.body
    await db.query(
      'UPDATE services SET service_date = ?, service_time = ?, service_type = ?, title = ?, description = ?, leader = ?, location = ? WHERE id = ?',
      [
        service_date,
        service_time,
        service_type,
        title,
        description,
        leader,
        location,
        req.params.id,
      ],
    )
    res.json({ message: 'Service updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id])
    res.json({ message: 'Service deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
