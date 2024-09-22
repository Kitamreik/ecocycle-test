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

router.get('/api/users', isAuthenticated, async (req, res) => {
    try {
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('user_id, firstname, lastname, email, phone_number, phone_type, role, created_at, updated_at');

        if (usersError) throw usersError;

        res.render('pages/admin-dashboard/users/view', { users: usersData });
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
});
router.get('/api/users/add', async (req, res) => {
    try {
        res.render('pages/admin-dashboard/users/add');
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
});

// POST route to add a new user
router.post('/api/users/add', isAuthenticated, async (req, res) => {
    try {
        // Destructure the data from the request body
        const { firstname, lastname, email, phone_number, phone_type, role } = req.body;

        // Insert data into the 'users' table in Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    firstname,
                    lastname,
                    email,
                    phone_number,
                    phone_type,
                    role
                }
            ])
            .select();

        if (error) throw error; // If there's an error with Supabase

        // Return success response with the inserted user data
        res.status(201).json({ message: 'User added successfully', data });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({ error: 'Error adding new user to Supabase' });
    }
});


// Get user for editing
router.get('/api/users/edit/:userId', isAuthenticated, async (req, res) => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', req.params.userId)
            .single();

        if (userError) throw userError;

        if (!userData) {
            return res.status(404).send('User not found');
        }

        res.render('pages/admin-dashboard/users/edit', { user: userData });
    } catch (error) {
        console.error('Error fetching user data for edit:', error);
        res.status(500).send('Error retrieving user data from Supabase');
    }
});

// Update user
router.put('/api/users/:userId', isAuthenticated, async (req, res) => {
    try {
        const { firstname, lastname, email, phone_number, phone_type, role } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({
                firstname,
                lastname,
                email,
                phone_number,
                phone_type,
                role,
                updated_at: new Date()
            })
            .eq('user_id', req.params.userId);

        if (error) throw error;

        res.json({ message: 'User updated successfully', data });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user in Supabase' });
    }
});

//Delete user
router.delete('/api/users/:userId', isAuthenticated, async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', req.params.userId);

        if (error) throw error;

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user from Supabase' });
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