import express from 'express'
const router = express.Router()
import db from '../database/db.js'

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, role, created_at, updated_at FROM users ORDER BY created_at DESC',
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by firebase_uid
router.get('/uid/:firebase_uid', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, firebase_uid, email, role, created_at, updated_at FROM users WHERE firebase_uid = ?',
      [req.params.firebase_uid],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single user by id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, firebase_uid, email, role, created_at, updated_at FROM users WHERE id = ?',
      [req.params.id],
    )
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(rows[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, role = 'user' } = req.body
    const [result] = await db.query('INSERT INTO users (email, role) VALUES (?, ?)', [email, role])
    res.json({ id: result.insertId, message: 'User created successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { email, role } = req.body
    await db.query('UPDATE users SET email = ?, role = ? WHERE id = ?', [
      email,
      role,
      req.params.id,
    ])
    res.json({ message: 'User updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id])
    res.json({ message: 'User role updated successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
