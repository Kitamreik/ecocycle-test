﻿const { supabase } = require('../config/supabase');
const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    next();
};

// Middleware to redirect authenticated users
const redirectIfAuthenticated = (req, res, next) => {
    next();
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
    // Here, you can implement your own login logic without session management
    res.redirect('/admin/panel');
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

// Define API routes to serve EJS templates with data from Supabase

router.get('/api/dashboard', isAuthenticated, async (req, res) => {
    try {
        const { data: overviewData, error: overviewError } = await supabase
            .from('dashboard') // Adjust table name as needed
            .select('*');

        if (overviewError) throw overviewError;

        const data = {
            overview: overviewData
        };
        res.render('pages/admin-dashboard/dashboard', { data });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
});

router.get('/api/requests', isAuthenticated, async (req, res) => {
    try {
        const { data: requestsData, error: requestsError } = await supabase
            .from('requests') // Adjust table name as needed
            .select('*');

        if (requestsError) throw requestsError;

        const data = {
            requests: requestsData
        };
        res.render('pages/admin-dashboard/requests', { data });
    } catch (error) {
        console.error('Error fetching requests data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
});

router.get('/api/schools', isAuthenticated, async (req, res) => {
    try {
        console.log('Fetching schools data...');

        let { data, error } = await supabase
            .from('schools')  // Make sure this matches your table name exactly
            .select('"School ID", Name, Address, City, State, "Zip Code", "Phone Number"');

        if (error) {
            console.error('Error in initial query:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('No data returned from initial query. Attempting fallback query...');

            // Fallback query to check if the table exists and has data
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('schools')
                .select('count');

            if (fallbackError) {
                console.error('Error in fallback query:', fallbackError);
                throw fallbackError;
            }

            console.log('Fallback query result:', fallbackData);
        }

        console.log('Schools data retrieved:', data);

        res.render('pages/admin-dashboard/schools', { schools: data || [] });
    } catch (error) {
        console.error('Error fetching schools data:', error);
        res.status(500).render('pages/admin-dashboard/schools', {
            schools: [],
            error: `Error retrieving data from Supabase: ${error.message}`
        });
    }
});

router.get('/api/calendar', async (req, res) => {
    try {
        const monthQuery = parseInt(req.query.month);
        const yearQuery = parseInt(req.query.year);

        const currentDate = new Date();
        const currentMonth = isNaN(monthQuery) ? currentDate.getMonth() : monthQuery; // 0-indexed
        const currentYear = isNaN(yearQuery) ? currentDate.getFullYear() : yearQuery;
        console.log('Current month:', currentMonth, 'Current year:', currentYear);
        const { data: calendarData, error } = await supabase
            .from('calendar')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        const calendar = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendar.push({ day: '', events: [] }); // empty cells before the first day
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const events = calendarData.filter(event =>
                new Date(event.date).toDateString() === date.toDateString()
            );
            calendar.push({ day, events });
        }

        res.render('pages/admin-dashboard/calendar', {
            calendar,
            currentMonth,
            currentYear,
            monthName: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })
        });
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
});

module.exports = router;