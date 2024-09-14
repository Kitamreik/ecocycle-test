const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const path = require("node:path");
const morgan = require("morgan");
const expressLayouts = require('express-ejs-layouts');

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

// Error handling middleware
app.use((err, req, res, next) => {
    if (err) {
        console.log(err);
    }

    return res.status(err.status || 500).json({
        error: { message: err.message || "Internal server error." },
        statusCode: err.status || 500,
    });
});

// Define routes
app.get("/", (req, res) => {
    res.render('pages/home');
});

// Dummy credentials for demonstration
const adminCredentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};

// Render login page
app.get('/login', (req, res) => {
    res.render('pages/admin-login', {
        layout: 'layout',
        header: false,
        footer: false
    });
});

// Handle login form submission
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminCredentials.username && password === adminCredentials.password) {
        res.redirect('/admin/panel');
    } else {
        res.redirect('/password-error');
    }
});

app.get('/admin/panel', (req, res) => {
    res.render('pages/admin-dashboard/admin-panel');
});

app.get('/password-error', (req, res) => {
    res.render('pages/admin-err');
});

app.get("/users/home", (req, res) => {
    res.render('pages/user-home');
});

app.get("/users", (req, res) => {
    res.render('pages/users');
});

// Defining API routes to serve EJS templates
app.get('/api/dashboard', (req, res) => {
    const data = {
        overview: "This is the overview data",
        statistics: "These are the statistics data"
    };
    res.render('pages/admin-dashboard/dashboard', { data });
});

app.get('/api/requests', (req, res) => {
    const data = {
        requests: "These are the requests data"
    };
    res.render('pages/admin-dashboard/requests', { data });
});

app.get('/api/schools', (req, res) => {
    const data = {
        schools: "These are the schools data"
    };
    res.render('pages/admin-dashboard/schools', { data });
});

app.get('/api/reports', (req, res) => {
    const data = {
        reports: "These are the reports data"
    };
    res.render('pages/admin-dashboard/reports', { data });
});

app.get('/api/calendar', (req, res) => {
    const data = {
        calendar: "This is the calendar data"
    };
    res.render('pages/admin-dashboard/calendar', { data });
});
app.get('*', (req, res) => {
    res.render('pages/admin-dashboard/admin-panel');
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. Use http://localhost:${PORT}/`);
});
