const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
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
                default: undefined
            }
        }
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    }
},
    { timestamps: true 

    });
module.exports = mongoose.model("User", userSchema);