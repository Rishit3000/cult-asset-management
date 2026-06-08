// init_db.js
const pool = require('./db');

const createTables = async () => {
    try {
        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) CHECK (role IN ('admin', 'consumer')) DEFAULT 'consumer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Users table verified/created.');

        // 2. Create Assets Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                description TEXT,
                quantity_available INT NOT NULL CHECK (quantity_available >= 0),
                status VARCHAR(20) CHECK (status IN ('active', 'maintenance')) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Assets table verified/created.');

        // 3. Create Bookings Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                asset_id INT REFERENCES assets(id) ON DELETE CASCADE,
                quantity_requested INT NOT NULL CHECK (quantity_requested > 0),
                start_date TIMESTAMP NOT NULL,
                end_date TIMESTAMP NOT NULL,
                status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Bookings table verified/created.');

        // 4. Create Asset Operations Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS asset_operations (
                id SERIAL PRIMARY KEY,
                booking_id INT REFERENCES bookings(id) ON DELETE CASCADE,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                due_date TIMESTAMP NOT NULL,
                returned_at TIMESTAMP,
                condition_on_return TEXT
            );
        `);
        console.log('✅ Asset Operations table verified/created.');       

        console.log('🎉 All database tables initialized successfully!');
        process.exit(0); // Exit the script cleanly
    } catch (err) {
        console.error('❌ Error initializing database tables:', err);
        process.exit(1);
    }
};

createTables();