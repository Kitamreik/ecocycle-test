// require("./config/connection");
// require("./config/authStrategy");
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("node:path");

// const cors = require("cors");
const morgan = require("morgan");
// const helmet = require("helmet");

// const session = require("express-session");
// const passport = require("passport");

// Create an express app
const app = express();
const PORT = process.env.PORT || 8080;

// Morgan Functionality 
app.use(morgan('dev'));

const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layout');

// Adding Path module and EJS to app.js 
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
    }

    // Any other error that is not caught anywhere else will be handled here
    return res.status(err.status || 500).json({
        error: { message: err.message || "Internal server error." },
        statusCode: err.status || 500,
    });
});

// Define routes
app.get("/", (req, res, next) => {
    res.render('pages/home');
});

// Dummy credentials for demonstration
const adminCredentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};

// Render login page
app.get('/login', (req, res) => {
    res.render('pages/adminlogin', {
        layout: 'layout',
        header: false,
        footer: false
    });
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        // Redirect to admin panel if credentials are correct
        res.redirect('/admin/panel');
    } else {
        // Redirect back to login page if credentials are incorrect
        res.redirect('/admin/login');
    }
});

app.get("/users/home", (req, res, next) => {
    res.render('pages/user-home');
});

app.get("/users", (req, res, next) => {
    res.render('pages/users');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Use http://localhost:${PORT}/`);
});