const express = require('express');
const errorMiddleware = require('./middlewares/error');
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());
const productsRouter = require('./routes/products');
const auth = require('./routes/auth');
const orderModel = require("./models/orderModel");

app.use('/api/v1/', productsRouter);
app.use('/api/v1/', auth);
app.use('/api/v1/', orderModel);
app.use(errorMiddleware);
module.exports = app;   