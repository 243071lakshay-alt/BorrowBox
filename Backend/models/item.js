const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    images: [{
        type: String
    }],

    condition: {
        type: String,
        enum: ["New", "Like New", "Good", "Fair"],
        required: true
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    location: {
        address: String,
        city: String,
        state: String,

        coordinates: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                required: true
            }
        }
    },

    rules: {
        type: String
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    isPaused: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

itemSchema.index({
    "location.coordinates": "2dsphere"
});

module.exports = mongoose.model("Item", itemSchema);