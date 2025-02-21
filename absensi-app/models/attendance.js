const db = require('../config/db');

const Attendance = {
    recordAttendance: (student_id, subject_id, class_id, date, status, callback) => {
        db.query(
            'INSERT INTO attendance (student_id, subject_id, class_id, date, status) VALUES (?, ?, ?, ?, ?)',
            [student_id, subject_id, class_id, date, status],
            (err, results) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            }
        );
    },

    getAttendanceByClassAndSubject: (class_id, subject_id, callback) => {
        db.query(
            'SELECT * FROM attendance WHERE class_id = ? AND subject_id = ?',
            [class_id, subject_id],
            (err, results) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            }
        );
    }
};

module.exports = Attendance;
