// routes/assets.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import our database connection

// 1. GET /api/assets - Browse, search, and filter inventory
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let queryText = 'SELECT * FROM assets WHERE status = $1';
        let queryParams = ['active'];
        let paramIndex = 2;

        // If a search term is provided, filter by asset name (case-insensitive)
        if (search) {
            queryText += ` AND name ILIKE $${paramIndex}`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // If a specific category filter is provided
        if (category) {
            queryText += ` AND category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }

        queryText += ' ORDER BY id DESC';

        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching assets:', err.message);
        res.status(500).json({ error: 'Server error while fetching inventory' });
    }
});

// 2. POST /api/assets - Add a new asset to the inventory
router.post('/', async (req, res) => {
    try {
        const { name, category, description, quantity_available } = req.body;

        // Simple validation to ensure required fields aren't blank
        if (!name || !category || quantity_available === undefined) {
            return res.status(400).json({ error: 'Please provide a name, category, and available quantity.' });
        }

        const newAsset = await pool.query(
            `INSERT INTO assets (name, category, description, quantity_available) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, category, description, quantity_available]
        );

        res.status(201).json({
            message: 'Asset successfully added to inventory!',
            asset: newAsset.rows[0]
        });
    } catch (err) {
        console.error('Error adding asset:', err.message);
        res.status(500).json({ error: 'Server error while adding asset' });
    }
});

// Ensure these blocks exist or are updated inside backend/routes/assets.js

// 3. PUT /api/assets/:id - Update an asset (Admins Only)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, description, quantity_available, status } = req.body;
        
        const updateAsset = await pool.query(
            `UPDATE assets 
             SET name = $1, category = $2, description = $3, quantity_available = $4, status = $5 
             WHERE id = $6 RETURNING *`,
            [name, category, description, quantity_available, status || 'active', id]
        );

        if (updateAsset.rows.length === 0) {
            return res.status(404).json({ error: "Asset record not found." });
        }

        res.json({ message: "Asset updated successfully!", asset: updateAsset.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while updating asset." });
    }
});

// 4. DELETE /api/assets/:id - Remove an asset entirely (Admins Only)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteAsset = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);

        if (deleteAsset.rows.length === 0) {
            return res.status(404).json({ error: "Asset record not found." });
        }

        res.json({ message: "Asset deleted completely from inventory control." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error while deleting asset." });
    }
});

module.exports = router;