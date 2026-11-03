
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

function makeToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw httpError(500, "Server authentication is not configured");
    }

    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password || !phone) {
        throw httpError(400, "Name, email, password and phone are required");
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        throw httpError(400, "Enter a valid email address");
    }

    if (String(password).length < 8) {
        throw httpError(400, "Password must be at least 8 characters");
    }

    if (String(password).length > 72) {
        throw httpError(400, "Password must not exceed 72 characters");
    }

    const existingUser = await User.exists({
        email: String(email).toLowerCase().trim()
    });

    if (existingUser) {
        throw httpError(409, "Email is already registered");
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hash,
        phone,
        location: location || {}
    });

    res.status(201).json({
        message: "Account created",
        token: makeToken(user.id),
        user
    });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw httpError(400, "Email and password are required");
    }

    const user = await User.findOne({
        email: String(email).toLowerCase().trim()
    }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw httpError(401, "Email or password is incorrect");
    }

    const safeUser = await User.findById(user.id);

    res.json({
        message: "Login successful",
        token: makeToken(user.id),
        user: safeUser
    });
});

exports.me = asyncHandler(async (req, res) => {
    res.json({
        user: req.user
    });
});
