const express = require("express");
const { getProducts,
    newProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    getReviews, deleteReview } = require("../controller/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/authenticate");

const router = express.Router();

router.route("/products").get(isAuthenticatedUser, getProducts);
router.route("/product/:id")
    .get(getProduct)
    .put(updateProduct)
    .delete(deleteProduct);

router.route("/review")
    .put(isAuthenticatedUser, createProductReview).
    delete(deleteReview);
router.route("/reviews").get(getReviews);


//Admin Routes
router.route("admin/product/new").post(isAuthenticatedUser, authorizeRoles("admin"), newProduct);


module.exports = router;