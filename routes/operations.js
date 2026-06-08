// routes/operations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/authMiddleware');

// 1. POST /api/operations/issue - Physically checkout an approved asset (Admins Only)
router.post('/issue', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { booking_id, due_date } = req.body;

        if (!booking_id || !due_date) {
            return res.status(400).json({ error: 'Please provide both booking_id and due_date.' });
        }

        // Verify if the booking exists and is approved
        const bookingCheck = await pool.query('SELECT * FROM bookings WHERE id = $1', [booking_id]);
        if (bookingCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Booking record not found.' });
        }

        const booking = bookingCheck.rows[0];
        if (booking.status !== 'approved') {
            return res.status(400).json({ error: 'Only approved bookings can be physically issued.' });
        }

        // Insert log into asset_operations
        const newOperation = await pool.query(
            `INSERT INTO asset_operations (booking_id, due_date) 
             VALUES ($1, $2) RETURNING *`,
            [booking_id, due_date]
        );

        // Deduct the requested quantity from the asset inventory count
        await pool.query(
            'UPDATE assets SET quantity_available = quantity_available - $1 WHERE id = $2',
            [booking.quantity_requested, booking.asset_id]
        );

        res.status(201).json({
            message: 'Asset successfully issued to user and stock adjusted!',
            operation: newOperation.rows[0]
        });
    } catch (err) {
        console.error('Issue tracking error:', err.message);
        res.status(500).json({ error: 'Server error while processing asset issue.' });
    }
});

// 2. POST /api/operations/return - Return an issued asset (Admins Only)
router.post('/return', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { operation_id, condition_on_return } = req.body;

        if (!operation_id) {
            return res.status(400).json({ error: 'Please provide an operation_id.' });
        }

        // Fetch the active operation log
        const opCheck = await pool.query('SELECT * FROM asset_operations WHERE id = $1', [operation_id]);
        if (opCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Operation record not found.' });
        }

        const operation = opCheck.rows[0];
        if (operation.returned_at) {
            return res.status(400).json({ error: 'This asset has already been marked as returned.' });
        }

        // Fetch the booking details to know the asset_id and quantity
        const bookingCheck = await pool.query('SELECT * FROM bookings WHERE id = $1', [operation.booking_id]);
        const booking = bookingCheck.rows[0];

        // Update the operation log with the return timestamp and condition status
        const updatedOp = await pool.query(
            `UPDATE asset_operations 
             SET returned_at = CURRENT_TIMESTAMP, condition_on_return = $1 
             WHERE id = $2 RETURNING *`,
            [condition_on_return || 'Good', operation_id]
        );

        // Add the returned quantity back into our main inventory stock
        await pool.query(
            'UPDATE assets SET quantity_available = quantity_available + $1 WHERE id = $2',
            [booking.quantity_requested, booking.asset_id]
        );

        res.json({
            message: 'Asset successfully returned to inventory storage!',
            operation: updatedOp.rows[0]
        });
    } catch (err) {
        console.error('Return tracking error:', err.message);
        res.status(500).json({ error: 'Server error while processing asset return.' });
    }
});

module.exports = router;