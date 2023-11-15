const products = require("../data/products.json");
const mongoose = require("mongoose");
const Product = require("../models/productModel");
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

dotenv.config({ path: "backend/config/config.env" });
connectDatabase();

const seederProducts = async () => {
    try {
        await Product.deleteMany();//delete all products
        console.log("Data Deleted");
        await Product.insertMany(products);//insert all products
        console.log("Data Imported");
    } catch (error) {
        console.error(error.message);
    }
    process.exit();
};
seederProducts();
