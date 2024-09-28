const express = require('express');
const router = express.Router();
const Booking = require('./booking'); // Adjust the path as needed
const jwt = require('jsonwebtoken');

const JWT_SECRET = '796d81d7207e4f9d1bac531e4d46de06834f2ddde1005e0341589bf1dc12a5e8'; // Replace with your JWT secret key

// Middleware to authenticate user
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send('Unauthorized');
            }
            req.user = decoded;
            next();
        });
    } else {
        return res.status(401).send('Unauthorized');
    }
};

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err || !decoded.isAdmin) {
                return res.status(401).send('Unauthorized: Admins only');
            }
            req.admin = decoded;
            next();
        });
    } else {
        return res.status(401).send('Unauthorized: Admins only');
    }
};

// Create a booking request
router.post('/create', authenticateUser, async (req, res) => {
    const { station, evModel, date, time } = req.body;
    try {
        const newBooking = new Booking({
            user: req.user.id,
            station,
            evModel,
            date,
            time,
        });
        await newBooking.save();
        res.status(201).send('Booking request submitted.');
    } catch (error) {
        res.status(400).send('Error creating booking: ' + error.message);
    }
});

// Get all booking requests for admin
router.get('/requests', authenticateAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'Pending' }).populate('user');
        res.json(bookings);
    } catch (error) {
        res.status(500).send('Error fetching bookings: ' + error.message);
    }
});

// Approve a booking request
router.post('/approve/:id', authenticateAdmin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        booking.status = 'Approved';
        await booking.save();
        res.send('Booking approved');
    } catch (error) {
        res.status(500).send('Error approving booking: ' + error.message);
    }
});

// Reject a booking request
router.post('/reject/:id', authenticateAdmin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        booking.status = 'Rejected';
        await booking.save();
        res.send('Booking rejected');
    } catch (error) {
        res.status(500).send('Error rejecting booking: ' + error.message);
    }
});

module.exports = router;




// // routes/booking.js
// const express = require('express');
// const router = express.Router();
// const Booking = require('./bookings');  // Adjusted path to your model
// const User = require('./user');        // Adjusted path to your model
// const jwt = require('jsonwebtoken');

// const JWT_SECRET = '796d81d7207e4f9d1bac531e4d46de06834f2ddde1005e0341589bf1dc12a5e8'; // Replace with your JWT secret key

// // Middleware to authenticate user
// const authenticateUser = (req, res, next) => {
//     const token = req.headers.authorization;
//     if (token) {
//         jwt.verify(token, JWT_SECRET, (err, decoded) => {
//             if (err) {
//                 return res.status(401).send('Unauthorized');
//             }
//             req.user = decoded;
//             next();
//         });
//     } else {
//         return res.status(401).send('Unauthorized');
//     }
// };

// // Middleware to authenticate admin
// const authenticateAdmin = (req, res, next) => {
//     const token = req.headers.authorization;
//     if (token) {
//         jwt.verify(token, JWT_SECRET, (err, decoded) => {
//             if (err || !decoded.isAdmin) {
//                 return res.status(401).send('Unauthorized: Admins only');
//             }
//             req.admin = decoded;
//             next();
//         });
//     } else {
//         return res.status(401).send('Unauthorized: Admins only');
//     }
// };

// // Create a booking request
// router.post('/create', authenticateUser, async (req, res) => {
//     const { station, evModel, date, time } = req.body;
//     try {
//         const newBooking = new Booking({
//             user: req.user.id,
//             station,
//             evModel,
//             date,
//             time,
//         });
//         await newBooking.save();
//         res.status(201).send('Booking request submitted.');
//     } catch (error) {
//         res.status(400).send('Error creating booking: ' + error.message);
//     }
// });

// // Get all booking requests for admin
// router.get('/requests', authenticateAdmin, async (req, res) => {
//     try {
//         const bookings = await Booking.find({ status: 'Pending' }).populate('user');
//         res.json(bookings);
//     } catch (error) {
//         res.status(500).send('Error fetching bookings: ' + error.message);
//     }
// });

// // Approve a booking request
// router.post('/approve/:id', authenticateAdmin, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) {
//             return res.status(404).send('Booking not found');
//         }
//         booking.status = 'Approved';
//         await booking.save();
//         res.send('Booking approved');
//     } catch (error) {
//         res.status(500).send('Error approving booking: ' + error.message);
//     }
// });

// // Reject a booking request
// router.post('/reject/:id', authenticateAdmin, async (req, res) => {
//     try {
//         const booking = await Booking.findById(req.params.id);
//         if (!booking) {
//             return res.status(404).send('Booking not found');
//         }
//         booking.status = 'Rejected'; // Set status to 'Rejected'
//         await booking.save();
//         res.send('Booking rejected');
//     } catch (error) {
//         res.status(500).send('Error rejecting booking: ' + error.message);
//     }
// });

// module.exports = router;





