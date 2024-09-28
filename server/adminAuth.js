// const express = require('express');
// const router = express.Router();
// const Admin = require('./admin'); // Adjust the path as needed
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = '796d81d7207e4f9d1bac531e4d46de06834f2ddde1005e0341589bf1dc12a5e8'; // Replace with your JWT secret key

// // Admin Registration
// router.post('/admin-register', async (req, res) => {
//     const { username, email, password } = req.body;
//     try {
//         // Check if the username or email is already taken
//         const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
//         if (existingAdmin) {
//             return res.status(400).json({ error: 'Username or email already exists' });
//         }

//         // Hash the password and save the new admin
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newAdmin = new Admin({ username, email, password: hashedPassword });
//         await newAdmin.save();
//         res.status(201).json({ message: 'Admin registered successfully!' });
//     } catch (error) {
//         console.error('Registration error:', error.message);
//         res.status(500).json({ error: 'Registration failed. Please try again.' });
//     }
// });

// // Admin Login
// router.post('/admin-login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const admin = await Admin.findOne({ email });
//         if (!admin) {
//             console.log('Admin not found'); // Debugging log
//             return res.status(404).json({ error: 'Admin not found' });
//         }

//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             console.log('Invalid credentials'); // Debugging log
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }

//         const token = jwt.sign({ id: admin._id, username: admin.username, isAdmin: true }, JWT_SECRET);
//         res.json({ token });
//     } catch (error) {
//         console.error('Login error:', error.message);
//         res.status(500).json({ error: 'Error logging in. Please try again.' });
//     }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const Admin = require('./admin'); // Adjust the path as needed
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = '796d81d7207e4f9d1bac531e4d46de06834f2ddde1005e0341589bf1dc12a5e8'; // Replace with your JWT secret key

// Admin Registration
router.post('/admin-register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if the username or email is already taken
        const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash the password and save the new admin
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({ username, email, password: hashedPassword });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin registered successfully!' });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Admin Login
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('Admin not found'); // Debugging log
            return res.status(404).json({ error: 'Admin not found' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log('Invalid credentials'); // Debugging log
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id, username: admin.username, isAdmin: true }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ error: 'Error logging in. Please try again.' });
    }
});

module.exports = router;

