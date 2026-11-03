
const Booking = require("../models/Booking");
const Item = require("../models/Item");

const asyncHandler = require("../utils/asyncHandler");
const httpError = require("../utils/httpError");

const populated = (query) => query
    .populate("item", "title category images condition location.city location.state")
    .populate("borrower", "name email phone")
    .populate("owner", "name email phone");

function validDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
        !startDate ||
        !endDate ||
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        throw httpError(400, "Valid startDate and endDate are required");
    }

    if (start >= end) {
        throw httpError(400, "endDate must be later than startDate");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
        throw httpError(400, "Start date cannot be in the past");
    }

    return { start, end };
}

async function hasApprovedConflict(itemId, start, end, excludeBookingId) {
    const query = {
        item: itemId,
        status: { $in: ["approved", "handed_over"] },
        startDate: { $lt: end },
        endDate: { $gt: start }
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return Booking.exists(query);
}

exports.createBooking = asyncHandler(async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    const { start, end } = validDateRange(startDate, endDate);

    if (!reason || !String(reason).trim()) {
        throw httpError(400, "A short reason is required");
    }

    if (String(reason).trim().length > 1000) {
        throw httpError(400, "Reason must not exceed 1000 characters");
    }

    const item = await Item.findOne({
        _id: req.params.itemId,
        isDeleted: false
    });

    if (!item) {
        throw httpError(404, "Item not found");
    }

    if (String(item.owner) === req.user.id) {
        throw httpError(400, "You cannot book your own item");
    }

    if (item.isPaused || !item.isAvailable) {
        throw httpError(409, "This item is not currently available");
    }

    if (await hasApprovedConflict(item.id, start, end)) {
        throw httpError(409, "The selected dates overlap an approved booking");
    }

    const booking = await Booking.create({
        item: item.id,
        borrower: req.user.id,
        owner: item.owner,
        startDate: start,
        endDate: end,
        reason: String(reason).trim()
    });

    res.status(201).json({
        message: "Booking request sent to the owner",
        booking: await populated(Booking.findById(booking.id))
    });
});

exports.myBookings = asyncHandler(async (req, res) => {
    const filter = req.query.view === "lending"
        ? { owner: req.user.id }
        : { borrower: req.user.id };

    if (req.query.status) {
        filter.status = req.query.status;
    }

    const bookings = await populated(
        Booking.find(filter).sort({ createdAt: -1 })
    );

    res.json({ bookings });
});

exports.getBooking = asyncHandler(async (req, res) => {
    const booking = await populated(Booking.findById(req.params.id));

    if (!booking) {
        throw httpError(404, "Booking not found");
    }

    const borrowerId = String(booking.borrower._id);
    const ownerId = String(booking.owner._id);

    if (
        ![borrowerId, ownerId].includes(req.user.id) &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "You cannot view this booking");
    }

    res.json({ booking });
});

exports.respondToRequest = asyncHandler(async (req, res) => {
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
        throw httpError(400, "action must be approve or reject");
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw httpError(404, "Booking not found");
    }

    if (
        String(booking.owner) !== req.user.id &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "Only the owner can respond");
    }

    if (booking.status !== "requested") {
        throw httpError(409, "Only pending requests can be approved or rejected");
    }

    if (action === "approve") {
        const item = await Item.findById(booking.item);

        if (!item || item.isDeleted || item.isPaused || !item.isAvailable) {
            throw httpError(409, "This item is no longer available");
        }

        if (
            await hasApprovedConflict(
                booking.item,
                booking.startDate,
                booking.endDate,
                booking.id
            )
        ) {
            throw httpError(409, "Another approved booking overlaps these dates");
        }

        booking.status = "approved";
        booking.approvedAt = new Date();
    } else {
        booking.status = "rejected";
        booking.rejectedAt = new Date();
    }

    await booking.save();

    res.json({
        message: action === "approve"
            ? "Booking approved"
            : "Booking rejected",
        booking: await populated(Booking.findById(booking.id))
    });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw httpError(404, "Booking not found");
    }

    if (
        String(booking.borrower) !== req.user.id &&
        String(booking.owner) !== req.user.id &&
        req.user.role !== "admin"
    ) {
        throw httpError(403, "You cannot cancel this booking");
    }

    if (!["requested", "approved"].includes(booking.status)) {
        throw httpError(409, "This booking can no longer be cancelled");
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({
        message: "Booking cancelled",
        booking
    });
});

exports.confirmHandover = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw httpError(404, "Booking not found");
    }

    if (
        ![String(booking.borrower), String(booking.owner)].includes(req.user.id)
    ) {
        throw httpError(403, "Only the owner or borrower can confirm handover");
    }

    if (!["approved", "handed_over"].includes(booking.status)) {
        throw httpError(409, "Only an approved booking can enter handover");
    }

    if (
        !booking.handoverConfirmedBy.some(
            (id) => String(id) === req.user.id
        )
    ) {
        booking.handoverConfirmedBy.push(req.user.id);
    }

    const otherPartyId = req.user.id === String(booking.owner)
        ? String(booking.borrower)
        : String(booking.owner);

    if (
        booking.handoverConfirmedBy.some(
            (id) => String(id) === otherPartyId
        )
    ) {
        booking.status = "handed_over";
        booking.handedOverAt = booking.handedOverAt || new Date();
    }

    await booking.save();

    res.json({
        message: booking.status === "handed_over"
            ? "Handover confirmed by both parties"
            : "Your handover confirmation was recorded; waiting for the other party",
        booking
    });
});

exports.confirmReturn = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        throw httpError(404, "Booking not found");
    }

    if (
        ![String(booking.borrower), String(booking.owner)].includes(req.user.id)
    ) {
        throw httpError(403, "Only the owner or borrower can confirm return");
    }

    if (!["handed_over", "returned"].includes(booking.status)) {
        throw httpError(409, "The item must be handed over before return can be confirmed");
    }

    if (
        !booking.returnConfirmedBy.some(
            (id) => String(id) === req.user.id
        )
    ) {
        booking.returnConfirmedBy.push(req.user.id);
    }

    const otherPartyId = req.user.id === String(booking.owner)
        ? String(booking.borrower)
        : String(booking.owner);

    if (
        booking.returnConfirmedBy.some(
            (id) => String(id) === otherPartyId
        )
    ) {
        booking.status = "returned";
        booking.returnedAt = booking.returnedAt || new Date();
    }

    await booking.save();

    res.json({
        message: booking.status === "returned"
            ? "Return confirmed by both parties"
            : "Your return confirmation was recorded; waiting for the other party",
        booking
    });
});
