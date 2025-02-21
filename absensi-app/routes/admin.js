const express = require('express');
const db = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const Class = require('../models/class');
const Subject = require('../models/subject');
const TeacherSubject = require('../models/teacherSubject');
const TeacherClass = require('../models/teacherClass');
const Student = require('../models/student');

const router = express.Router();

/**
 * ===============================
 *        KELAS & PELAJARAN
 * ===============================
 */

// ✅ Menambahkan kelas baru
router.post('/classes', verifyToken, isAdmin, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nama kelas tidak boleh kosong' });
    }

    Class.createClass(name, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal menambahkan kelas', error: err });

        res.status(201).json({ message: 'Kelas berhasil dibuat', class: results });
    });
});

// ✅ Menampilkan daftar kelas
router.get('/classes', verifyToken, isAdmin, (req, res) => {
    Class.getAllClasses((err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar kelas', error: err });

        res.json(results);
    });
});

// ✅ Menambahkan mata pelajaran baru
router.post('/subjects', verifyToken, isAdmin, (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Nama pelajaran tidak boleh kosong' });
    }

    Subject.createSubject(name, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal menambahkan pelajaran', error: err });

        res.status(201).json({ message: 'Pelajaran berhasil dibuat', subject: results });
    });
});

// ✅ Menampilkan daftar mata pelajaran
router.get('/subjects', verifyToken, isAdmin, (req, res) => {
    Subject.getAllSubjects((err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar pelajaran', error: err });

        res.json(results);
    });
});

/**
 * ===============================
 *       GURU & MATA PELAJARAN
 * ===============================
 */

// ✅ Menetapkan guru ke mata pelajaran dalam kelas
router.post('/assign-teacher-subject', verifyToken, isAdmin, (req, res) => {
    const { user_id, subject_id, class_id } = req.body;

    if (!user_id || !subject_id || !class_id) {
        return res.status(400).json({ message: 'User ID, Subject ID, dan Class ID wajib diisi' });
    }

    TeacherSubject.assignTeacherToSubject(user_id, subject_id, class_id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal menetapkan guru', error: err });

        res.status(201).json({ message: 'Guru berhasil ditetapkan' });
    });
});

// ✅ Menampilkan daftar guru yang mengajar di kelas tertentu
router.get('/teachers/:class_id', verifyToken, isAdmin, (req, res) => {
    const { class_id } = req.params;

    TeacherClass.getTeachersByClass(class_id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar guru', error: err });

        res.json(results);
    });
});

/**
 * ===============================
 *             SISWA
 * ===============================
 */

// ✅ Menambahkan siswa ke kelas
router.post('/students', verifyToken, isAdmin, (req, res) => {
    const { name, nis, class_id } = req.body;

    if (!name || !nis || !class_id) {
        return res.status(400).json({ message: 'Nama, NIS, dan Kelas wajib diisi' });
    }

    Student.addStudentToClass(name, nis, class_id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal menambahkan siswa', error: err });

        res.status(201).json({ message: 'Siswa berhasil ditambahkan', student: results });
    });
});

// ✅ Menampilkan daftar siswa sesuai dengan kelasnya masing-masing
router.get('/students/grouped-by-class', verifyToken, isAdmin, (req, res) => {
    Student.getAllStudents((err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar siswa', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tidak ada siswa yang terdaftar' });
        }

        // Mengelompokkan siswa berdasarkan class_id
        const groupedStudents = results.reduce((acc, student) => {
            const classId = student.class_id;
            if (!acc[classId]) {
                acc[classId] = [];
            }
            acc[classId].push({
                id: student.id,
                name: student.name,
                nis: student.nis,
            });
            return acc;
        }, {});

        res.json(groupedStudents);
    });
});


// ✅ Menampilkan daftar siswa berdasarkan kelas
router.get('/classes/:class_id/students', verifyToken, isAdmin, (req, res) => {
    const { class_id } = req.params;

    Student.getStudentsByClass(class_id, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar siswa', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: `Tidak ada siswa di kelas ${class_id}` });
        }

        res.json(results);
    });
});

// ✅ Menampilkan seluruh siswa dari semua kelas
router.get('/students', verifyToken, isAdmin, (req, res) => {
    Student.getAllStudents((err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil daftar siswa', error: err });

        res.json(results);
    });
});

/**
 * ===============================
 *   MENETAPKAN GURU KE KELAS & PELAJARAN
 * ===============================
 */

// ✅ Admin menetapkan guru ke kelas, mata pelajaran, hari, jam, dan durasi mengajar
router.post('/assign-teacher', verifyToken, isAdmin, (req, res) => {
    const { teacher_id, class_id, subject_id, teaching_day, start_time, duration } = req.body;

    if (!teacher_id || !class_id || !subject_id || !teaching_day || !start_time || !duration) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    // Validasi hari mengajar
    const validDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    if (!validDays.includes(teaching_day)) {
        return res.status(400).json({ message: 'Hari mengajar tidak valid' });
    }

    // Pastikan teacher_id adalah guru
    db.query('SELECT id FROM users WHERE id = ? AND role = "guru"', [teacher_id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Guru tidak ditemukan' });
        }

        // Insert ke database dengan hari, jam mulai, dan durasi
        const query = `
            INSERT INTO teachers_classes_subjects (teacher_id, class_id, subject_id, teaching_day, start_time, duration)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(query, [teacher_id, class_id, subject_id, teaching_day, start_time, duration], (err, results) => {
            if (err) return res.status(500).json({ message: 'Gagal menetapkan guru', error: err });

            res.json({ message: 'Guru berhasil ditetapkan ke kelas dan mata pelajaran dengan jadwal mengajar' });
        });
    });
});

router.get('/teachers-schedule', verifyToken, isAdmin, (req, res) => {
    const query = `
        SELECT 
            u.username AS teacher_name, 
            c.name AS class_name, 
            s.name AS subject_name,
            tcs.teaching_day, 
            tcs.start_time, 
            tcs.duration
        FROM teachers_classes_subjects tcs
        JOIN users u ON tcs.teacher_id = u.id
        JOIN classes c ON tcs.class_id = c.id
        JOIN subjects s ON tcs.subject_id = s.id
        ORDER BY tcs.teaching_day, tcs.start_time;
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ message: 'Gagal mengambil data jadwal guru', error: err });

        res.json(results);
    });
});

/**
 * ===============================
 *   MENAMPILKAN DAFTAR GURU
 * ===============================
 */
// ✅ GET: Menampilkan semua user dengan role "guru"
router.get('/teachers', verifyToken, isAdmin, (req, res) => {
    const query = `SELECT id, username FROM users WHERE role = ?`;

    db.query(query, ['guru'], (err, results) => {
        if (err) {
            console.error('Database Query Error:', err.message);
            return res.status(500).json({ message: 'Gagal mengambil data guru', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Tidak ada guru ditemukan' });
        }

        res.json(results);
    });
});



module.exports = router;
