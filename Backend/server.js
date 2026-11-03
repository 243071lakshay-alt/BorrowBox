require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
if (process.env.NODE_ENV !== "test")



app.get("/", (req, res) => {
  res.json({
    name: "BorrowBox API",
    status: "running",
    version: "1.0.0",
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/bookings", bookingRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message)
    });
  }
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid identifier" });
  if (err.code === 11000) return res.status(409).json({ message: "A record with that value already exists" });
  const status = err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? "Internal server error" : err.message });
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`BorrowBox API listening on port ${PORT}`)))
    .catch((error) => {
      console.error("Could not start BorrowBox:", error.message);
      process.exit(1);
    });
}

module.exports = app;
