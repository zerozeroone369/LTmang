const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
let pool = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

async function query(text, params = []) {
  if (!pool) {
    throw new Error('Chưa cấu hình biến môi trường DATABASE_URL cho PostgreSQL.');
  }
  return pool.query(text, params);
}

async function checkDbHealth() {
  if (!pool) return { connected: false, detail: 'Chưa gắn DATABASE_URL' };
  try {
    const res = await pool.query(
      'SELECT COUNT(*)::int AS total_tables FROM information_schema.tables WHERE table_schema = $1',
      ['public']
    );
    return { connected: true, tables: res.rows[0].total_tables };
  } catch (err) {
    return { connected: false, detail: err.message };
  }
}

module.exports = { pool, query, checkDbHealth };
