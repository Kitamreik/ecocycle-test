const { supabase } = require('../config/supabase');
const express = require('express');
const router = express.Router();

// Dummy credentials for demonstration
const adminCredentials = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};

// Middleware to check if user is authenticated (now does nothing)
const isAuthenticated = (req, res, next) => {
    next(); // No authentication check
};

// Middleware to redirect authenticated users (now does nothing)
const redirectIfAuthenticated = (req, res, next) => {
    next(); // No redirection for authenticated users
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

// Handle login form submission (no session management)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    if (username === adminCredentials.username && password === adminCredentials.password) {
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

// Logout route (now just redirects to login)
router.get('/logout', (req, res) => {
    res.redirect('/admin/login');
});

router.get('/api/dashboard', isAuthenticated, async (req, res) => {
});

module.exports = router;
