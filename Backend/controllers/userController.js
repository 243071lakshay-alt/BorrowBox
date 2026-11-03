
const User = require("../models/User");
const Booking = require("../models/Booking");
const Item = require("../models/Item");

const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

exports.getProfile = asyncHandler(async (req, res) => {
    const [itemsCount, bookingsCount, lendingCount] = await Promise.all([
        Item.countDocuments({
            owner: req.user.id,
            isDeleted: false
        }),

        Booking.countDocuments({
            borrower: req.user.id
        }),

        Booking.countDocuments({
            owner: req.user.id
        })
    ]);

    res.json({
        user: req.user,
        stats: {
            itemsCount,
            bookingsCount,
            lendingCount
        }
    });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const allowed = ["name", "phone", "location"];
    const update = {};

    for (const key of allowed) {
        if (req.body[key] !== undefined) {
            update[key] = req.body[key];
        }
    }

    if (
        update.name !== undefined &&
        String(update.name).trim().length < 2
    ) {
        throw httpError(400, "Name must contain at least 2 characters");
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        update,
        {
            new: true,
            runValidators: true
        }
    );

    res.json({
        message: "Profile updated",
        user
    });
});

exports.listUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const users = await User.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    const total = await User.countDocuments();

    res.json({
        users,
       
    });
});
