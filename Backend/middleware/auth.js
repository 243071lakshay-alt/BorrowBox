const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) throw httpError(401, "Authentication token required");
  if (!process.env.JWT_SECRET) throw httpError(500, "Server authentication is not configured");

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw httpError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.id).select("-password");
  if (!user) throw httpError(401, "Account no longer exists");
  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") return next(httpError(403, "Administrator access required"));
  next();
};

module.exports = { protect, adminOnly };
