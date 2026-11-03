
const Item = require("../models/Item");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const fields = [
    "title",
    "category",
    "description",
    "images",
    "condition",
    "location",
    "rules"
];

function cleanInput(body) {
    const data = {};

    for (const key of fields) {
        if (body[key] !== undefined) {
            data[key] = body[key];
        }
    }

    if (data.images && (!Array.isArray(data.images) || data.images.length > 10)) {
        throw httpError(400, "Images must be an array containing no more than 10 URLs");
    }

    if (
        data.images &&
        data.images.some((url) => typeof url !== "string" || url.length > 2000)
    ) {
        throw httpError(400, "Each image must be a valid URL string");
    }

    return data;
}

exports.createItem = asyncHandler(async (req, res) => {
    const data = cleanInput(req.body);

    for (const key of ["title", "category", "description", "condition"]) {
        if (!data[key]) {
            throw httpError(400, `${key} is required`);
        }
    }

    const item = await Item.create({
        ...data,
        owner: req.user.id
    });

    await item.populate("owner", "name location.city location.state");

    res.status(201).json({
        message: "Item listed successfully",
        item
    });
});

exports.listItems = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));

    const filter = {
        isDeleted: false,
        isPaused: false,
        isAvailable: true
    };

    if (req.query.category) {
        filter.category = new RegExp(escapeRegex(req.query.category), "i");
    }

    if (req.query.city) {
        filter["location.city"] = new RegExp(escapeRegex(req.query.city), "i");
    }

    if (req.query.state) {
        filter["location.state"] = new RegExp(escapeRegex(req.query.state), "i");
    }

    if (req.query.condition) {
        filter.condition = req.query.condition;
    }

    if (req.query.owner) {
        filter.owner = req.query.owner;
    }

    if (req.query.q) {
        const q = String(req.query.q).trim().slice(0, 100);

        filter.$or = [
            { title: new RegExp(escapeRegex(q), "i") },
            { description: new RegExp(escapeRegex(q), "i") },
            { category: new RegExp(escapeRegex(q), "i") }
        ];
    }

    const [items, total] = await Promise.all([
        Item.find(filter)
            .populate("owner", "name location.city location.state")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),

        Item.countDocuments(filter)
    ]);

    res.json({
        items,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

exports.getItem = asyncHandler(async (req, res) => {
    const item = await Item.findOne({
        _id: req.params.id,
        isDeleted: false
    }).populate("owner", "name location.city location.state");

    if (
        !item ||
        (item.isPaused && String(item.owner._id) !== req.user?.id)
    ) {
        throw httpError(404, "Item not found");
    }

    const [reviews, ratingStats] = await Promise.all([
        Review.find({ item: item.id })
            .populate("reviewer", "name")
            .sort({ createdAt: -1 })
            .limit(50),

        Review.aggregate([
            {
                $match: { item: item._id }
            },
            {
                $group: {
                    _id: "$item",
                    average: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    res.json({
        item,
        reviews,
        rating: ratingStats[0] || {
            average: null,
            count: 0
        }
    });
});

exports.updateItem = asyncHandler(async (req, res) => {
    const item = await Item.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!item) {
        throw httpError(404, "Item not found");
    }

    if (
        String(item.owner) !== req.user.id &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "Only the owner can edit this item");
    }

    const data = cleanInput(req.body);

    Object.assign(item, data);

    await item.save();
    await item.populate("owner", "name location.city location.state");

    res.json({
        message: "Item updated",
        item
    });
});

exports.pauseItem = asyncHandler(async (req, res) => {
    const item = await Item.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!item) {
        throw httpError(404, "Item not found");
    }

    if (
        String(item.owner) !== req.user.id &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "Only the owner can change this listing");
    }

    if (req.body.isPaused === false) {
        const active = await Booking.exists({
            item: item.id,
            status: { $in: ["approved", "handed_over"] }
        });

        if (active) {
            throw httpError(409, "This item has an active booking and cannot be unpaused yet");
        }
    }

    item.isPaused = req.body.isPaused === undefined
        ? !item.isPaused
        : Boolean(req.body.isPaused);

    await item.save();

    res.json({
        message: item.isPaused ? "Listing paused" : "Listing resumed",
        item
    });
});

exports.deleteItem = asyncHandler(async (req, res) => {
    const item = await Item.findOne({
        _id: req.params.id,
        isDeleted: false
    });

    if (!item) {
        throw httpError(404, "Item not found");
    }

    if (
        String(item.owner) !== req.user.id &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "Only the owner can remove this item");
    }

    const active = await Booking.exists({
        item: item.id,
        status: { $in: ["approved", "handed_over"] }
    });

    if (active) {
        throw httpError(409, "An item with an active booking cannot be removed");
    }

    item.isDeleted = true;
    item.isAvailable = false;

    await item.save();

    res.json({
        message: "Listing removed"
    });
});

exports.myItems = asyncHandler(async (req, res) => {
    const items = await Item.find({
        owner: req.user.id,
        isDeleted: false
    }).sort({ createdAt: -1 });

    res.json({ items });
});

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
