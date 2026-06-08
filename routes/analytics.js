// routes/analytics.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// GET /api/analytics/dashboard - Fetch summary data for charts and cards (Admins Only)
router.get('/dashboard', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        // 1. Most Frequently Utilized Assets (Count total approved bookings per asset)
        const utilizationQuery = `
            SELECT a.name, COUNT(b.id) as total_bookings
            FROM assets a
            LEFT JOIN bookings b ON a.id = b.asset_id AND b.status = 'approved'
            GROUP BY a.id, a.name
            ORDER BY total_bookings DESC
            LIMIT 5;
        `;
        const utilizationData = await pool.query(utilizationQuery);

        // 2. Summary Status Counts (Active Bookings, Available Inventory Stock, Overdue Items)
        const summaryMetricsQuery = `
            SELECT 
                (SELECT COUNT(*) FROM bookings WHERE status = 'pending' OR status = 'approved') as active_bookings,
                (SELECT SUM(quantity_available) FROM assets WHERE status = 'active') as available_inventory,
                (SELECT COUNT(*) FROM asset_operations WHERE returned_at IS NULL AND due_date < CURRENT_TIMESTAMP) as overdue_returns
        `;
        const summaryData = await pool.query(summaryMetricsQuery);

        // Send consolidated metrics packet to front-end dashboard components
        res.json({
            summaryCards: summaryData.rows[0],
            utilizationChart: utilizationData.rows
        });
    } catch (err) {
        console.error('Analytics system fault:', err.message);
        res.status(500).json({ error: 'Server error while compiling analytics matrices.' });
    }
});

module.exports = router;