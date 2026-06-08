// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// A secret key used to sign tokens. In production, keep this hidden in a .env file!
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cultural_council_key';

// 1. POST /api/auth/register - Create a new user account
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide name, email, and password.' });
        }

        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        // Securely hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Assign default role as 'consumer' if not explicitly provided as 'admin'
        const userRole = role === 'admin' ? 'admin' : 'consumer';

        // Insert user into the database
        const newUser = await pool.query(
            `INSERT INTO users (name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
            [name, email, passwordHash, userRole]
        );

        res.status(201).json({
            message: 'User account registered successfully!',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ error: 'Server error during user registration.' });
    }
});

// 2. POST /api/auth/login - Authenticate credentials and return token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter both email and password.' });
        }

        // Check if user exists
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid authentication credentials.' });
        }

        const user = result.rows[0];

        // Compare input password with stored database hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid authentication credentials.' });
        }

        // Generate a secure JWT session token valid for 24 hours
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ error: 'Server error during user login.' });
    }
});

module.exports = router;