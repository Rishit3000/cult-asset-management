// db.js
const { Pool } = require('pg');

// Create a pool connection using the credentials from our docker-compose file
const pool = new Pool({
    user: 'asset_user',
    host: 'localhost',
    database: 'asset_management_db',
    password: 'secret_password',
    port: 5432,
});

// A quick helper to test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Database connection error:', err.stack);
    } else {
        console.log('🔗 Connected to PostgreSQL Database Successfully at:', res.rows[0].now);
    }
});

module.exports = pool;