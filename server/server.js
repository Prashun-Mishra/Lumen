// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const path = require('path');
// const authRoutes = require('./auth');
// const adminAuthRoutes = require('./adminAuth');
// const bookingRoutes = require('./booking');
// const apiRoutes = require('./api');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evc', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('MongoDB connected');
// }).catch((err) => {
//   console.error('MongoDB connection error:', err);
// });

// // Serve static files from the 'public' directory
// const publicPath = path.join(__dirname, '..', 'public');
// console.log('Serving static files from:', publicPath);
// app.use(express.static(publicPath));

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Set up routes
// app.use('/auth', authRoutes);
// app.use('/adminAuth', adminAuthRoutes);
// app.use('/booking', bookingRoutes);
// app.use('/api', apiRoutes);

// // Redirect root to index.html
// app.get('/', (req, res) => {
//   res.sendFile(path.join(publicPath, 'register.html'));
// });

// // Catch-all route to serve index.html for any request that doesn't match an API route
// app.get('*', (req, res) => {
//   res.sendFile(path.join(publicPath, 'index.html'));
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const authRoutes = require('./auth');
const adminAuthRoutes = require('./adminAuth');
const bookingRoutes = require('./booking');
const apiRoutes = require('./api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/evc', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Serve static files from the 'public' directory
const publicPath = path.join(__dirname, '..', 'public');
console.log('Serving static files from:', publicPath);
app.use(express.static(publicPath));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up routes
app.use('/auth', authRoutes);
app.use('/adminAuth', adminAuthRoutes);
app.use('/bookings', bookingRoutes);
app.use('/api', apiRoutes);

// Redirect root to admin register page
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'admin-register.html')); // Redirect to admin registration page
});

// Catch-all route to serve index.html for any request that doesn't match an API route
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
