const db = require('../config/db');

const Class = {
    createClass: (name, callback) => {
        db.query('INSERT INTO classes (name) VALUES (?)', [name], (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    },

    getAllClasses: (callback) => {
        db.query('SELECT * FROM classes', (err, results) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
    },

    getClassDetails: (class_id, callback) => {
        const query = `
            SELECT classes.name AS class_name, students.name AS student_name, students.nis, users.username AS teacher_name
            FROM classes
            LEFT JOIN students ON students.class_id = classes.id
            LEFT JOIN teacher_class ON teacher_class.class_id = classes.id
            LEFT JOIN users ON users.id = teacher_class.user_id
            WHERE classes.id = ?
        `;
        
        db.query(query, [class_id], (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                // Jika tidak ada data ditemukan, kembalikan error
                return callback(new Error('Class not found or no data available'), null);
            }

            const classDetails = {
                class_name: results[0]?.class_name,
                students: [],
                teachers: []
            };

            // Memisahkan siswa dan guru dari hasil query
            results.forEach((row) => {
                if (row.student_name) {
                    classDetails.students.push({
                        name: row.student_name,
                        nis: row.nis
                    });
                }
                if (row.teacher_name) {
                    classDetails.teachers.push({
                        teacher_name: row.teacher_name
                    });
                }
            });

            callback(null, classDetails);
        });
    }
};


module.exports = Class;
