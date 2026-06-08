// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cultural_council_key';

// Middleware to verify if a user is securely logged in
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Tokens are usually sent as "Bearer <token_string>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No session token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adds { userId, role } to the request object
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid or expired session token.' });
    }
};

// Middleware to restrict endpoints exclusively to Administrators
const authorizeAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
};

module.exports = { authenticateToken, authorizeAdmin };