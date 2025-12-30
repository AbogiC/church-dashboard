import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get all about sections
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about_church ORDER BY display_order')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single about section
router.get('/:section', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM about_church WHERE section = ?', [
      req.params.section,
    ])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update about section
router.put('/:section', async (req, res) => {
  try {
    const { title, content, image_url, display_order } = req.body
    await db.query(
      'UPDATE about_church SET title = ?, content = ?, image_url = ?, display_order = ? WHERE section = ?',
      [title, content, image_url, display_order, req.params.section],
    )
    res.json({ message: 'About section updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
