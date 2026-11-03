const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true, index: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, trim: true, maxlength: 1000 },
  status: {
    type: String,
    enum: ["requested", "approved", "rejected", "handed_over", "returned", "cancelled"],
    default: "requested",
    index: true
  },
  handoverConfirmedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  returnConfirmedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  approvedAt: Date,
  handedOverAt: Date,
  returnedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

bookingSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
