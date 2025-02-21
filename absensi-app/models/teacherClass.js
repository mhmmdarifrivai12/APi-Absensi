const db = require('../config/db');

const TeacherClass = {
    // Menetapkan guru ke kelas
    assignTeacherToClass: async (user_id, class_id) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO teacher_class (user_id, class_id) VALUES (?, ?)';
            db.query(query, [user_id, class_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    },

    // Mendapatkan daftar guru berdasarkan kelas
    getTeachersByClass: async (class_id) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT users.id, users.username 
                FROM teacher_class 
                JOIN users ON teacher_class.user_id = users.id 
                WHERE teacher_class.class_id = ?
            `;
            db.query(query, [class_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
};

module.exports = TeacherClass;
