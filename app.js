const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("node:path");
const morgan = require("morgan");
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const schoolRoutes = require('./routes/schoolRoutes');
const fundingRoutes = require('./routes/fundingRoutes');
const presentationRoutes = require('./routes/presentationRoutes');
const trainingSessionsRoutes = require('./routes/trainingSessionRoutes');
// Create an express app
const app = express();
const PORT = process.env.PORT || 8080;

// Morgan Functionality
app.use(morgan('dev'));

// Set up express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'layout');

// Adding Path module and EJS to app.js
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Mitigate XSS attacks
        maxAge: 24 * 60 * 60 * 1000 // Sessions last for 24 hours
    }
}));

// Define routes
app.get("/", (req, res) => {
    res.render('pages/home');
});

app.use('/admin', adminRoutes);
app.use('/admin', userRoutes);
app.use('/admin', requestRoutes);
app.use('/admin', schoolRoutes);
app.use('/admin', fundingRoutes);
app.use('/admin', presentationRoutes);
app.use('/admin', trainingSessionsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Use http://localhost:${PORT}/`);
});