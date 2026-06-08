// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// =========================================================
// 1. FIXED STRINGS PATH ROUTING (MUST SIT AT THE ABSOLUTE TOP)
// =========================================================

// GET /api/bookings/my-history - Fetch log history safely for the logged-in user
router.get('/my-history', authenticateToken, async (req, res) => {
    try {
        // Fallback checks both 'id' and 'userId' properties from decoded token
        const userId = req.user.id || req.user.userId; 

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized session tracking signature missing." });
        }

        const historyQuery = `
            SELECT b.id, b.quantity_requested, b.start_date, b.end_date, b.status, b.created_at,
                   COALESCE(a.name, 'Unknown Resource Template') as asset_name, 
                   COALESCE(a.category, 'General Asset') as asset_category
            FROM bookings b
            LEFT JOIN assets a ON b.asset_id = a.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC;
        `;
        
        const result = await pool.query(historyQuery, [userId]);
        res.json(result.rows || []);
    } catch (err) {
        console.error("Personal dashboard fetch error:", err.message);
        res.status(500).json({ error: "Server error compiling personal history matrix." });
    }
});

// GET /api/bookings/requests/pending - Fetch all pending requests for administration queue view
router.get('/requests/pending', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const pendingQuery = `
            SELECT b.id, b.user_id, b.asset_id, b.quantity_requested, b.start_date, b.end_date, b.status,
                   a.name as asset_name
            FROM bookings b
            JOIN assets a ON b.asset_id = a.id
            WHERE b.status = 'pending'
            ORDER BY b.created_at DESC;
        `;
        const result = await pool.query(pendingQuery);
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error loading pending administration queue:", err.message);
        res.status(500).json({ error: "Server error while fetching pending requests queue." });
    }
});

// POST /api/bookings/request - Create a brand-new asset allocation request row
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const { asset_id, quantity_requested, start_date, end_date } = req.body;
        
        // Fallback checks both configurations to align ID types perfectly
        const user_id = req.user.id || req.user.userId; 

        console.log("=== BACKEND INTERCEPTED INSERTION ID ===", {
            decodedUserPayload: req.user,
            finalSelectedId: user_id
        });

        if (!user_id) {
            return res.status(401).json({ error: "Authentication signature mismatch. Identity tracking key missing." });
        }

        if (!asset_id || !quantity_requested || !start_date || !end_date) {
            return res.status(400).json({ error: "Missing required booking details metrics payload." });
        }

        const insertQuery = `
            INSERT INTO bookings (user_id, asset_id, quantity_requested, start_date, end_date, status) 
            VALUES ($1, $2, $3, $4, $5, 'pending') 
            RETURNING *;
        `;

        const newBooking = await pool.query(insertQuery, [
            user_id, 
            asset_id, 
            parseInt(quantity_requested), 
            start_date, 
            end_date
        ]);

        res.json({ 
            message: "Booking request successfully submitted! Awaiting administrator approval.", 
            booking: newBooking.rows[0] 
        });
    } catch (err) {
        console.error("CRITICAL BACKEND BOOKING LOG ERROR:", err.message);
        res.status(500).json({ error: "Server error processing reservation: " + err.message });
    }
});

// =========================================================
// 2. PARAMETERIZED DYNAMIC ROUTING LOWERDOWN (/:id)
// =========================================================

// PATCH /api/bookings/:id/approve - Process approval state
router.patch('/:id/approve', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await pool.query(
            "UPDATE bookings SET status = 'approved' WHERE id = $1 RETURNING *",
            [id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: "Booking reference matrix marker not found." });
        }

        res.json({ message: "approved", booking: updated.rows[0] });
    } catch (err) {
        console.error("Approval transition breakdown:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/bookings/:id/reject - Process rejection state
router.patch('/:id/reject', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await pool.query(
            "UPDATE bookings SET status = 'rejected' WHERE id = $1 RETURNING *",
            [id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ error: "Booking reference matrix marker not found." });
        }

        res.json({ message: "rejected", booking: updated.rows[0] });
    } catch (err) {
        console.error("Rejection transition breakdown:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;