const sendToken = (user, statusCode, res) => {

    //* Create token
    const token = user.getJwtToken();
    //* Set cookie options
    const cookieOptions = {
        expires: new Date(Date.now() +
            process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000),
        // Set the expiration time for the cookie
        httpOnly: true // Ensure that the cookie is only accessible via HTTP(S) and not client-side JavaScript
    };

    //* Send response
    res.status(statusCode)
        .cookie('token', token, cookieOptions)
        .json({
            success: true,
            token,
            user
        });


};
module.exports = sendToken;