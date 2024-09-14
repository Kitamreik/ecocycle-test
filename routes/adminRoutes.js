const express = require('express');
const router = express.Router();

// Dummy credentials for demonstration
const adminCredentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    console.log('isAuthenticated middleware - Session:', req.session);
    if (req.session.isAuthenticated) {
        console.log('User is authenticated');
        next();
    } else {
        console.log('User is not authenticated, redirecting to login');
        res.redirect('/admin/login');
    }
};

// Middleware to redirect authenticated users
const redirectIfAuthenticated = (req, res, next) => {
    console.log('redirectIfAuthenticated middleware - Session:', req.session);
    if (req.session.isAuthenticated) {
        console.log('User is already authenticated, redirecting to panel');
        res.redirect('/admin/panel');
    } else {
        console.log('User is not authenticated, proceeding to login page');
        next();
    }
};

// Render login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
    console.log('Rendering login page');
    res.render('pages/admin-login', {
        layout: 'layout',
        header: false,
        footer: false
    });
});

// Handle login form submission
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    if (username === adminCredentials.username && password === adminCredentials.password) {
        req.session.isAuthenticated = true;
        console.log('Login successful, redirecting to panel');
        res.redirect('/admin/panel');
    } else {
        console.log('Login failed, redirecting to password error');
        res.redirect('/admin/password-error');
    }
});

// Admin panel route
router.get('/panel', isAuthenticated, (req, res) => {
    console.log('Rendering admin panel');
    res.render('pages/admin-dashboard/admin-panel');
});

// Password error route
router.get('/password-error', (req, res) => {
    res.render('pages/admin-err');
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/admin/login');
    });
});

// Defining API routes to serve EJS templates
router.get('/api/dashboard', isAuthenticated, (req, res) => {
    const data = {
        overview: "This is the overview data",
        statistics: "These are the statistics data"
    };
    res.render('pages/admin-dashboard/dashboard', { data });
});

router.get('/api/requests', isAuthenticated, (req, res) => {
    const data = {
        requests: "These are the requests data"
    };
    res.render('pages/admin-dashboard/requests', { data });
});

router.get('/api/schools', isAuthenticated, (req, res) => {
    const data = {
        schools: "These are the schools data"
    };
    res.render('pages/admin-dashboard/schools', { data });
});

router.get('/api/reports', isAuthenticated, (req, res) => {
    const data = {
        reports: "These are the reports data"
    };
    res.render('pages/admin-dashboard/reports', { data });
});

router.get('/api/calendar', isAuthenticated, (req, res) => {
    const data = {
        calendar: "This is the calendar data"
    };
    res.render('pages/admin-dashboard/calendar', { data });
});

module.exports = router;