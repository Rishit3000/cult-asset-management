// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const assetRoutes = require('./routes/assets');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const operationRoutes = require('./routes/operations'); // 👈 LINE 8: Make sure this import is exactly here!
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/assets', assetRoutes);
app.use('/api/assets', require('./routes/assets'));
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/operations', operationRoutes); // 👈 LINE 23: Make sure this is registered!
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Smart Asset Management API!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is successfully running on port ${PORT}`);
});