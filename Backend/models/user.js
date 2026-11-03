const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  location: {
    address: { type: String, trim: true, maxlength: 160 },
    city: { type: String, trim: true, maxlength: 80 },
    state: { type: String, trim: true, maxlength: 80 }
  },
  role: { type: String, enum: ["user", "admin"], default: "user" }
}, { timestamps: true });

userSchema.set("toJSON", {
  transform: (doc, ret) => { delete ret.password; delete ret.__v; return ret; }
});

module.exports = mongoose.model("User", userSchema);
