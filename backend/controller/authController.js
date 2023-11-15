const catchAsynError = require("../middlewares/catchAsynError");
const User = require("../models/userModel");
const errorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

//!HTML STATUS CODES
/*
 * 200 - OK
 * 201 - Created
 * 400 - Bad Request
 * 401 - Unauthorized
 * 500 - Internal Server Error
 */


// Register User
exports.registerUser = catchAsynError(async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    const user = await User.create({ name, email, password, avatar });
    sendToken(user, 201, res);

});

// Login User- api/v1/login
exports.loginUser = catchAsynError(async (req, res, next) => {
    const { email, password } = req.body;
    // Check if user has given email
    if (!email || !password) {
        return next(new errorHandler("Please enter email and password", 400));
    }
    // Find user by email
    const user = await User.findOne({ email }).select("+password");
    // Check if user has given password and email
    if (!user) {
        return next(new errorHandler("Invalid email or password", 401));
    }
    // Check if password is correct
    const isPasswordMatched = await user.isValidPassword(password);
    if (!isPasswordMatched) {
        return next(new errorHandler("Invalid email or password", 401));
    }
    // If password is correct, send token
    sendToken(user, 201, res);
});
// Logout- api/v1/logout
exports.logOut = catchAsynError(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: "Logged out"
    });
});
//Forgot Password - api/v1/password/forgot
exports.forgotPassword = catchAsynError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new errorHandler("User not found with this email", 404));
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}\n\nIf you have not requested this email then, please ignore it.`;
    try {
        sendEmail({
            email: user.email,
            subject: "JVLcart Password Recovery",
            message
        });

        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email}`
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new errorHandler(error.message), 500);
    }
});
//Reset Password - api/v1/password/reset/:token
exports.resetPassword = catchAsynError(async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordTokenExpire: { $gt: Date.now() }
    });
    if (!user) {
        return next(new errorHandler("Reset Password Token is invalid or has been expired", 401));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new errorHandler("Password does not match", 401));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    sendToken(user, 201, res);
});

//Get User Profile - api/v1/me
exports.getUserProfile = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new errorHandler("User not found", 404));
    }
    await user.save();
    sendToken(user, 201, res);
});

//Change Password - api/v1/password/update
exports.updatePassword = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.isValidPassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new errorHandler("Old password is incorrect", 400));
    }
    user.password = req.body.password;
    await user.save();
    sendToken(user, 200, res);
});
//Update Profile - api/v1/update
exports.updateProfile = catchAsynError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true
    });
    await user.save();
    sendToken(user, 200, res);
});

//ADMIN : Get All Users - api/v1/admin/users
exports.getAllUsers = catchAsynError(async (req, res, next) => {
    const users = await User.find();
    res.status(200).json({
        success: true, users
    });
});
//ADMIN : Get Single User - api/v1/admin/user/:id
exports.getSingleUser = catchAsynError(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new errorHandler("User not found", 404));
    }
    sendToken(user, 200, res);
});

//ADMIN : Update User - api/v1/admin/user/:id
exports.updateUser = catchAsynError(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    };
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true
    });
    if (!user) {
        return next(new errorHandler("User not found", 404));
    }
    await user.save();
    sendToken(user, 200, res);
});
//ADMIN : Delete User - api/v1/admin/user/:id
exports.deleteUser = catchAsynError(async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new errorHandler("User not found", 404));
    }
    await user.remove();
    sendToken(user, 200, res);
});