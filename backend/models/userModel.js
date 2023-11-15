const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const crypto = require("crypto");

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter name"],
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        validate: [
            validator.isEmail,
            "Please enter valid email address"
        ]
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
        maxLength: [8, "Password cannot exceed 8 characters"],
        select: false
    },
    avatar: {
        type: String,
        required: true,
        // default: "default.jpg"
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hashing the password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// JWT Token 
userSchema.methods.getJwtToken = function () {
    return jsonwebtoken.sign(
        { id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
};
// Match user entered password to hashed password
userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
//Forgot Password Token
userSchema.methods.getResetPasswordToken = function () {
    //Generate Token
    const resetToken = crypto.randomBytes(20).toString("hex");
    //Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    //set Expiry Date to resetPasswordExpiry field 
    this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;    //30 minutes from now
    return resetToken;
};

let model = mongoose.model("User", userSchema);
module.exports = model;