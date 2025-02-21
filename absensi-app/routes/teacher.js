const express = require('express');
const db = require('../config/db');
const { verifyToken, isGuru } = require('../middleware/auth');

const router = express.Router();

// Guru melihat kelas & mata pelajaran yang telah diatur oleh admin
router.get('/assigned-classes', verifyToken, isGuru, (req, res) => {
    const teacherId = req.user.id;

    const query = `
        SELECT c.id as class_id, c.name as class_name, s.id as subject_id, s.name as subject_name
        FROM teachers_classes_subjects tcs
        JOIN classes c ON tcs.class_id = c.id
        JOIN subjects s ON tcs.subject_id = s.id
        WHERE tcs.teacher_id = ?
    `;

    db.query(query, [teacherId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching assigned classes', error: err });
        }
        res.json(results);
    });
});

// Guru melihat daftar siswa di kelas yang dia ajar
router.get('/students/:classId', verifyToken, isGuru, (req, res) => {
    const classId = parseInt(req.params.classId, 10);

    if (isNaN(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
    }

    const query = `SELECT id, name, nis FROM students WHERE class_id = ?`;

    db.query(query, [classId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching students', error: err });
        }
        res.json(results);
    });
});

router.post('/attendance', verifyToken, isGuru, (req, res) => {
    const { attendance } = req.body;

    if (!Array.isArray(attendance) || attendance.length === 0) {
        return res.status(400).json({ message: 'Attendance data is required' });
    }

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let values = [];

    attendance.forEach(item => {
        const { student_id, subject_id, class_id, date, status } = item;

        if (!student_id || !subject_id || !class_id || !date || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['hadir', 'alpha', 'izin', 'sakit'].includes(status)) {
            return res.status(400).json({ message: 'Invalid attendance status' });
        }

        const attendanceDate = new Date(date);
        if (isNaN(attendanceDate)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const day = days[attendanceDate.getDay()];
        values.push([student_id, subject_id, class_id, date, day, status]);
    });

    const query = `
        INSERT INTO attendance (student_id, subject_id, class_id, date, day, status)
        VALUES ?
    `;

    db.query(query, [values], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error recording attendance', error: err });
        }
        res.json({ message: 'Attendance recorded successfully' });
    });
});

// 🔹 Guru melihat daftar kelas & mata pelajaran yang dia ajar
router.get('/assigned-subjects', verifyToken, isGuru, (req, res) => {
    const teacherId = req.user.id;

    const query = `
        SELECT 
            c.id AS class_id, 
            c.name AS class_name, 
            s.id AS subject_id, 
            s.name AS subject_name
        FROM teachers_classes_subjects tcs
        JOIN classes c ON tcs.class_id = c.id
        JOIN subjects s ON tcs.subject_id = s.id
        WHERE tcs.teacher_id = ?;
    `;

    db.query(query, [teacherId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching assigned subjects', error: err });
        }
        res.json(results);
    });
});

// Guru melihat riwayat absensi siswa berdasarkan kelas yang dia ajar (dikelompokkan per hari)
const moment = require('moment');

router.get('/attendance-history/:classId', verifyToken, isGuru, (req, res) => {
    const classId = parseInt(req.params.classId, 10);

    if (isNaN(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
    }

    const query = `
        SELECT 
            a.date, 
            a.day, 
            s.name AS student_name, 
            a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        WHERE a.class_id = ?
        ORDER BY a.date DESC, s.name ASC
    `;

    db.query(query, [classId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching attendance history', error: err });
        }

        // 🔹 Format ulang tanggal agar lebih bersih
        const groupedHistory = results.reduce((acc, record) => {
            const formattedDate = moment(record.date).format('YYYY-MM-DD'); // Format menjadi YYYY-MM-DD
            const key = `${formattedDate} (${record.day})`;

            if (!acc[key]) {
                acc[key] = [];
            }

            acc[key].push({ student_name: record.student_name, status: record.status });
            return acc;
        }, {});

        res.json(groupedHistory);
    });
});




module.exports = router;
