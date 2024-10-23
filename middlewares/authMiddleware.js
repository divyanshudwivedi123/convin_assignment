const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate users using JWT
const authMiddleware = async (req, res, next) => {
    try {
        // Get the token from cookies
        const token = req.cookies.token;
        
        // If no token is provided, return an authorization error
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by ID from the decoded token and exclude the password field
        const user = await User.findById(decoded.id).select('-password');
        
        // If user is not found
        if (!user) {
            return res.status(404).json({ error: 'User not found, authorization denied' });
        }

        // Attach the user object to req for access in routes
        req.user = user;
       // console.log(req.user);
        next();
    } catch (err) {
        console.error(err.message);
        return res.status(401).json({ error: 'Token is not valid or has expired' });
    }
};

module.exports = authMiddleware;
