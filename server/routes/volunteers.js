import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get volunteers for a service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteers WHERE service_id = ? ORDER BY role', [
      req.params.serviceId,
    ])
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Assign volunteer to service
router.post('/', async (req, res) => {
  try {
    const { service_id, full_name, role, phone, email, assigned_date } = req.body
    const [result] = await db.query(
      'INSERT INTO volunteers (service_id, full_name, role, phone, email, assigned_date) VALUES (?, ?, ?, ?, ?, ?)',
      [service_id, full_name, role, phone, email, assigned_date],
    )
    res.json({ id: result.insertId, message: 'Volunteer assigned successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update volunteer status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await db.query('UPDATE volunteers SET status = ? WHERE id = ?', [status, req.params.id])
    res.json({ message: 'Volunteer status updated' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get volunteer count for a service
router.get('/service/:serviceId/count', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM volunteers WHERE service_id = ?', [
      req.params.serviceId,
    ])
    res.json({ count: rows[0].count })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove volunteer
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM volunteers WHERE id = ?', [req.params.id])
    res.json({ message: 'Volunteer removed' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
