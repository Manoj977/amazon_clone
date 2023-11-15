const Product = require("../models/productModel");
const errorHandler = require("../utils/errorHandler");
const catchAsynError = require("../middlewares/catchAsynError");
const APIFeatures = require("../utils/apiFeatures");
/*----------------------------------------------------------------------- */
//GET ALL PRODUCTS - api/v1/products
exports.getProducts = catchAsynError(async (req, res, next) => {
    const restPerPage = 2;
    const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(restPerPage);
    try {
        const products = await apiFeatures.query;
        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});
/*----------------------------------------------------------------------- */
//GET SINGLE PRODUCT - api/v1/product/:id
exports.getProduct = catchAsynError(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    console.log(product);
    if (!product) {
        return next(new errorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product
    });
});
/*----------------------------------------------------------------------- */
//CREATE PRODUCT - api/v1/product/new
exports.newProduct = catchAsynError(async (req, res, next) => {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product
    });
});
/*----------------------------------------------------------------------- */
//UPDATE PRODUCT - api/v1/product/:id
exports.updateProduct = catchAsynError(async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!product) {
        return next(new errorHandler("Product not found", 404));

    }
    res.status(200).json({
        success: true,
        product
    });
});
/*----------------------------------------------------------------------- */
// DELETE PRODUCT - api/v1/product/:id
exports.deleteProduct = catchAsynError(async (req, res, next) => {
    try {
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
            return next(new errorHandler("Product not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Product deleted"
        });
    } catch (error) {
        next(error);
    }
});
// Create new review and update review - api/v1/review
exports.createProductReview = catchAsynError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    };
    const product = await Product.findById(productId);
    //check if product already reviewed
    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() == req.user._id.toString()
    );
    if (isReviewed) {
        //update review
        product.reviews.forEach((rev) => {
            if (rev.user.toString() == req.user._id.toString()) {
                (rev.rating = rating), (rev.comment = comment);
            }
        });
    } else {
        //add review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    //find and update product rating
    product.ratings = product.reviews.reduce((acc, review) => {
        return acc + review.rating;
    }, 0) / product.reviews.length;

    isNaN(product.ratings) ? (product.ratings = 0) : product.ratings;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true
    });

});
//Get Reviews of a product - api/v1/reviews?id={productId}
exports.getReviews = catchAsynError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});
//Delete review - api/v1/review
exports.deleteReview = catchAsynError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new errorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter((rev) => rev._id.toString() != req.query.id.toString());
    const numOfReviews = reviews.length;
    const ratings = product.reviews.reduce((acc, rev) => {
        return acc + rev.rating;
    }, 0) / reviews.length;
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true
    });
});