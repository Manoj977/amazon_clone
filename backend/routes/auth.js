const express = require("express");
const router = express.Router();
const { registerUser,
    loginUser,
    logOut,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword, updateProfile, getAllUsers, getSingleUser, updateUser, deleteUser
} = require("../controller/authController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/authenticate");
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logOut);
router.route("/password/forgot").post(isAuthenticatedUser, authorizeRoles("admin"), forgotPassword);
router.route("/password/reset/:token").post(resetPassword);
router.route("/myprofile").get(isAuthenticatedUser, getUserProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/update").put(isAuthenticatedUser, updateProfile);
//Admin routes
router.route('/admin/user/:id').get(isAuthenticatedUser, authorizeRoles('admin'), getSingleUser)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

router.route('/admin/user').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
module.exports = router;