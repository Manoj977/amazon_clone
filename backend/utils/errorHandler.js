class errorHandler extends Error {
    constructor(message, statusCode) {
        super(message);//Error is a class in JS
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);//to get stack trace
        this.isOperational = true;//to check whether error is operational or not
        Error.captureStackTrace(this, this.constructor);//to get stack trace
    }
}

module.exports = errorHandler;