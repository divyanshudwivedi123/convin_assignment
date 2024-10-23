const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const types = require('../config/types');


// controller to register user
exports.createUser = async (req, res, next) => {
    const body = req.body;
    const validation = types.userRegisterCheck.safeParse(body);

    if (!validation.success) {
        // Check if any required fields are missing
        if (validation.error.errors.some(error => error.message === "Required")) {
            return res.status(400).json({
                message: 'Enter all the fields!'
            });
        }
        // Return the first validation error message
        return res.status(400).json({
            message: validation.error.errors[0].message
        });
    }

    const { username, email, mobile, password } = body;

    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered!' });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name: username, 
            email,
            mobile_number: mobile,
            password: hashedPassword
        });

        // Save the user to the database
        await user.save();

        // Respond with a success message
        res.status(201).json({ message: 'User created successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

// Controller to handle user login
exports.loginUser = async (req, res, next) => {
    const body = req.body;
    const validation = types.userLoginCheck.safeParse(body);

    if (!validation.success) {
        // Check if any required fields are missing
        if (validation.error.errors.some(error => error.message === "Required")) {
            return res.status(400).json({
                message: 'Enter all the fields!'
            });
        }
        return res.status(400).json({
            message: validation.error.errors[0].message
        });
    }

    const { email, password } = body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare the password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
           .status(200).json({ message: 'Login successful' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};


// Controller to handle user logout
exports.logoutUser = (req, res, next) => {
    try {
        // Clear the token cookie
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to logout. Please try again.' });
    }
};

// Controller to get user details by extracting user ID from JWT token
exports.getUserDetails = async (req, res, next) => {
    try {
        // The user ID is stored in req.user after token verification
        const userId = req.user.id;
        // Find the user by the ID extracted from the token
        const user = await User.findById(userId).select('-password');  // exclude password
        if (!user) {
            return res.status(404).json({ error: 'User not found!' });
        }

        // Return the user details
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to retrieve user. Please try again later.' });
    }
};

