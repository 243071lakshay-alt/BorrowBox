const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60, index: true },
  description: { type: String, required: true, trim: true, maxlength: 3000 },
  images: [{ type: String, trim: true }],
  condition: { type: String, enum: ["New", "Like New", "Good", "Fair"], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  location: {
    address: { type: String, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 80, index: true },
    state: { type: String, trim: true, maxlength: 80 }
  },
  rules: { type: String, trim: true, maxlength: 1500, default: "" },
  isAvailable: { type: Boolean, default: true, index: true },
  isPaused: { type: Boolean, default: false, index: true },
  isDeleted: { type: Boolean, default: false, index: true }
}, { timestamps: true });

itemSchema.index({ title: "text", description: "text", category: "text" });

module.exports = mongoose.model("Item", itemSchema);
