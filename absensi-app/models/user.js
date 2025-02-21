const bcrypt = require('bcryptjs');
const db = require('../config/db');

const User = {
    createUser: (username, password, role, callback) => {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err;
            db.query(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role],
                (err, results) => {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, results);
                    }
                }
            );
        });
    },

    findUserByUsername: (username, callback) => {
        db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results[0]);
            }
        });
    }
};

module.exports = User;
