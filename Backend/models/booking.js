const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [
            "requested",
            "approved",
            "rejected",
            "handed_over",
            "returned",
            "cancelled"
        ],
        default: "requested"
    },
    handoverConfirmedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    returnConfirmedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    approvedAt: Date,
    returnedAt: Date
}, { timestamps: true });
module.exports = mongoose.model("Booking", bookingSchema);
