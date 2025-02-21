const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

const router = express.Router();

// Registrasi pengguna baru
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    User.findUserByUsername(username, (err, user) => {
        if (user) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        User.createUser(username, password, role, (err, results) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to create user', error: err });
            }
            return res.status(201).json({ message: 'User created successfully' });
        });
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    User.findUserByUsername(username, (err, user) => {
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const payload = { id: user.id, username: user.username, role: user.role };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

            return res.json({ 
                token, 
                role: user.role // Pastikan role dikembalikan di sini
            });
        });
    });
});

module.exports = router;
