const express = require('express');
const router = express.Router();
const User = require('./user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hardcoded JWT secret key
const JWT_SECRET = '796d81d7207e4f9d1bac531e4d46de06834f2ddde1005e0341589bf1dc12a5e8';

// Registration route
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).send('User registered successfully.');
    } catch (error) {
        res.status(400).send('Error registering user: ' + error.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await user.comparePassword(password)) {
            // Generate a token using the hardcoded JWT secret
            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            res.json({ token, username: user.username, email: user.email });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;





