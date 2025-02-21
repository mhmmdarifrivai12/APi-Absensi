const db = require('../config/db');

const Subject = {
    createSubject: (name, callback) => {
        db.query('INSERT INTO subjects (name) VALUES (?)', [name], (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    },

    getAllSubjects: (callback) => {
        db.query('SELECT * FROM subjects', (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }
};

module.exports = Subject;
