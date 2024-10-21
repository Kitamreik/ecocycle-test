const { supabase } = require('../config/supabase');
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

// Define API routes to serve EJS templates with data from Supabase

router.get('/api/dashboard', isAuthenticated, async (req, res) => {
});

module.exports = router;