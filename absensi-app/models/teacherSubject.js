const db = require('../config/db');

const TeacherSubject = {
    assignTeacherToSubject: (user_id, subject_id, class_id, callback) => {
        db.query(
            'INSERT INTO teacher_subjects (user_id, subject_id, class_id) VALUES (?, ?, ?)',
            [user_id, subject_id, class_id],
            (err, results) => {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, results);
                }
            }
        );
    },

    getTeacherSubjects: (callback) => {
        db.query('SELECT * FROM teacher_subjects', (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    }
};

module.exports = TeacherSubject;
