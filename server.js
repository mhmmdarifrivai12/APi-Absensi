// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const authRoutes = require('./absensi-app/routes/auth');
// const adminRoutes = require('./absensi-app/routes/admin');
// const teacherRoutes = require('./absensi-app/routes/teacher');
// const publicRoutes = require('./absensi-app/routes/public');
// const app = express();

// dotenv.config();

// app.use(cors());
// app.use(bodyParser.json());

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/teacher', teacherRoutes);
// app.use('/api/public', publicRoutes);

// app.get("/", (req, res) => {
//     res.json({ message: "Hello from Vercel API!" });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Gunakan express.json() daripada body-parser

// Import Routes
const authRoutes = require(path.join(__dirname, "absensi-app/routes/auth"));
const adminRoutes = require(path.join(__dirname, "absensi-app/routes/admin"));
const teacherRoutes = require(path.join(__dirname, "absensi-app/routes/teacher"));
const publicRoutes = require(path.join(__dirname, "absensi-app/routes/public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/public", publicRoutes);

// Default Route
app.get("/", (req, res) => {
    res.json({ message: "Hello from Vercel API!" });
});

// Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

