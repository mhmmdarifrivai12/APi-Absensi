const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware untuk verifikasi JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan informasi user ke req.user
        next(); // Lanjut ke middleware berikutnya
    } catch (error) {
        return res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
    }
};

// Middleware untuk memeriksa apakah user adalah admin
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
    next();
};

// Middleware untuk memeriksa apakah user adalah guru
const isGuru = (req, res, next) => {
    if (!req.user || req.user.role !== 'guru') {
        return res.status(403).json({ message: 'Forbidden: Only Guru can access this resource' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isGuru };
