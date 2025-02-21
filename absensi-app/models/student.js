const db = require('../config/db');

const Student = {
    /**
     * ✅ Tambah siswa ke dalam kelas
     * @param {string} name - Nama siswa
     * @param {string} nis - NIS siswa (Nomor Induk Siswa)
     * @param {number} class_id - ID kelas siswa
     * @param {function} callback - Callback function
     */
    addStudentToClass: (name, nis, class_id, callback) => {
        const query = `INSERT INTO students (name, nis, class_id) VALUES (?, ?, ?)`;
        db.query(query, [name, nis, class_id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    /**
     * ✅ Ambil daftar siswa berdasarkan class_id tertentu
     * @param {number} class_id - ID kelas
     * @param {function} callback - Callback function
     */
    getStudentsByClass: (class_id, callback) => {
        const query = `
            SELECT students.id, students.name, students.nis, students.class_id, classes.name AS class_name
            FROM students
            JOIN classes ON students.class_id = classes.id
            WHERE students.class_id = ?
        `;
        db.query(query, [class_id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },

    /**
     * ✅ Ambil semua siswa dan kelompokkan berdasarkan kelas
     * @param {function} callback - Callback function
     */
    getAllStudents: (callback) => {
        const query = `
            SELECT students.id, students.name, students.nis, students.class_id, classes.name AS class_name
            FROM students
            JOIN classes ON students.class_id = classes.id
            ORDER BY students.class_id, students.name
        `;
        db.query(query, (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
};

module.exports = Student;
