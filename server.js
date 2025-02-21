const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./absensi-app/routes/auth');
const adminRoutes = require('./absensi-app/routes/admin');
const teacherRoutes = require('./absensi-app/routes/teacher');
const publicRoutes = require('./absensi-app/routes/public');
const app = express();

dotenv.config();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/public', publicRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Hello from Vercel API!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
