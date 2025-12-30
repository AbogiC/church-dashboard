import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get all news
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news ORDER BY created_at DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single news item
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM news WHERE id = ?', [req.params.id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create news
router.post('/', async (req, res) => {
  try {
    const { title, content, image_url, category } = req.body
    const [result] = await db.query(
      'INSERT INTO news (title, content, image_url, category) VALUES (?, ?, ?, ?)',
      [title, content, image_url, category],
    )
    res.json({ id: result.insertId, message: 'News created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update news
router.put('/:id', async (req, res) => {
  try {
    const { title, content, image_url, category } = req.body
    await db.query(
      'UPDATE news SET title = ?, content = ?, image_url = ?, category = ? WHERE id = ?',
      [title, content, image_url, category, req.params.id],
    )
    res.json({ message: 'News updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete news
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM news WHERE id = ?', [req.params.id])
    res.json({ message: 'News deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
