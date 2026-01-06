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

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM volunteer_list WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      res.status(404).json({ error: 'Volunteer not found' })
    } else {
      res.json(rows[0])
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { full_name, capability, phone } = req.body
    const [result] = await db.query(
      'INSERT INTO volunteer_list (full_name, capability, phone) VALUES (?, ?, ?)',
      [full_name, capability, phone],
    )
    res.status(201).json({ id: result.insertId })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.put('/update/:id', async (req, res) => {
  try {
    const { full_name, capability, phone } = req.body
    const [result] = await db.query(
      'UPDATE volunteer_list SET full_name = ?, capability = ?, phone = ? WHERE id = ?',
      [full_name, capability, phone, req.params.id],
    )
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Volunteer not found' })
    } else {
      res.json({ message: 'Volunteer updated successfully' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/delete/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM volunteer_list WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Volunteer not found' })
    } else {
      res.json({ message: 'Volunteer deleted successfully' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
