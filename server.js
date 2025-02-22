const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");

dotenv.config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Untuk parsing JSON request body
app.use(morgan("dev")); // Logging request ke console

// Import Routes
const authRoutes = require(path.resolve(__dirname, "absensi-app/routes/auth"));
const adminRoutes = require(path.resolve(__dirname, "absensi-app/routes/admin"));
const teacherRoutes = require(path.resolve(__dirname, "absensi-app/routes/teacher"));
const publicRoutes = require(path.resolve(__dirname, "absensi-app/routes/public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/public", publicRoutes);

// Default Route
app.get("/", (req, res) => {
    res.json({ message: "Hello from Vercel API! Update 2" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("❌ Error:", err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Port Configuration
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
