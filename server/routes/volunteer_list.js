import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get volunteers for a service
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteer_list')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { full_name, phone, email } = req.body
    const [result] = await db.query(
      'INSERT INTO volunteer_list (full_name, phone, email) VALUES (?, ?, ?)',
      [full_name, phone, email],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
