// routes/notifications.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// GET /api/notifications/reminders - Scan and fetch all reminder alerts (Admins Only)
router.get('/reminders', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const reminderQuery = `
            SELECT 
                ao.id as operation_id,
                ao.due_date,
                u.name as user_name,
                u.email as user_email,
                a.name as asset_name,
                CASE 
                    WHEN ao.due_date < CURRENT_TIMESTAMP THEN 'OVERDUE'
                    ELSE 'UPCOMING_DEADLINE'
                END as alert_type
            FROM asset_operations ao
            JOIN bookings b ON ao.booking_id = b.id
            JOIN users u ON b.user_id = u.id
            JOIN assets a ON b.asset_id = a.id
            WHERE ao.returned_at IS NULL 
              AND (ao.due_date < CURRENT_TIMESTAMP OR ao.due_date <= CURRENT_TIMESTAMP + INTERVAL '24 hours')
            ORDER BY ao.due_date ASC;
        `;

        const alerts = await pool.query(reminderQuery);

        res.json({
            count: alerts.rows.length,
            alerts: alerts.rows
        });
    } catch (err) {
        console.error('Notification scanner fault:', err.message);
        res.status(500).json({ error: 'Server error while pulling notification logs.' });
    }
});

module.exports = router;