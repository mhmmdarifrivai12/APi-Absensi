const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: 30000, // Timeout lebih lama (30 detik)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Cek koneksi ke database
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Koneksi ke MySQL gagal:', err.message);
  } else {
    console.log('✅ Terhubung ke MySQL sebagai ID:', connection.threadId);
    connection.release(); // Pastikan koneksi dilepaskan setelah digunakan
  }
});

// Tes query sederhana
pool.query('SELECT 1 + 1 AS solution', (err, results) => {
  if (err) {
    console.error('❌ Error dalam query:', err.message);
  } else {
    console.log('🧮 The solution is:', results[0].solution);
  }
});

module.exports = pool;
