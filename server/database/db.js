import mysql from 'mysql2'
import 'dotenv/config'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tester',
  database: process.env.DB_NAME || 'church_dashboard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool.promise()
