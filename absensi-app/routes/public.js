const express = require('express');
const db = require('../config/db');

const router = express.Router();

// API publik untuk melihat absensi berdasarkan class_id
router.get('/attendance/:classId', (req, res) => {
    const classId = parseInt(req.params.classId, 10);

    if (isNaN(classId)) {
        return res.status(400).json({ message: 'Invalid class ID' });
    }

    const query = `
        SELECT 
            a.class_id,
            c.name AS class_name,
            a.student_id,
            s.name AS student_name,
            a.subject_id,
            sub.name AS subject_name,
            a.date,
            a.day,
            a.status
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN classes c ON a.class_id = c.id
        JOIN subjects sub ON a.subject_id = sub.id
        WHERE a.class_id = ?
        ORDER BY a.date DESC, s.name ASC
    `;

    db.query(query, [classId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Error fetching attendance data', error: err });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No attendance records found for this class' });
        }

        // Struktur respons yang lebih rapi
        const response = {
            class_id: results[0].class_id,
            class_name: results[0].class_name,
            attendance: results.map(record => ({
                student_id: record.student_id,
                student_name: record.student_name,
                subject_id: record.subject_id,
                subject_name: record.subject_name,
                date: record.date,
                day: record.day,
                status: record.status
            }))
        };

        res.json(response);
    });
});

module.exports = router;
