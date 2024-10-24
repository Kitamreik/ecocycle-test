const { supabase } = require('../config/supabase');

// Validate user data
const validateUserData = (userData) => {
    const errors = [];

    // Validate username (required, max 50 chars)
    if (!userData.username || userData.username.length > 50) {
        errors.push('Username is required and must be less than 50 characters');
    }

    // Validate email (required, max 50 chars, format)
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
    if (!userData.useremail || userData.useremail.length > 50 || !emailRegex.test(userData.useremail)) {
        errors.push('Valid email is required and must be less than 50 characters');
    }

    // Validate phone (optional, 10 digits)
    if (userData.userphone && !/^[0-9]{10}$/.test(userData.userphone)) {
        errors.push('Phone number must be 10 digits');
    }

    return errors;
};

// Fetch all users
const getUsers = async (req, res) => {
    try {
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('userid, username, useremail, userphone, isactive, created_at, updated_at')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        res.render('pages/admin-dashboard/users/view', { users: usersData });
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
};

// Show add user form
const addUserForm = (req, res) => {
    res.render('pages/admin-dashboard/users/add');
};

// Add a new user
const addUser = async (req, res) => {
    try {
        const userData = {
            username: req.body.username,
            useremail: req.body.useremail,
            userphone: req.body.userphone || null,
            isactive: req.body.isactive === 'true'
        };

        // Validate user data
        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        // Check for existing username or email
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('userid')
            .or(`username.eq.${userData.username},useremail.eq.${userData.useremail}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const { data, error } = await supabase
            .from('users')
            .insert([userData])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'User added successfully', data });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({ error: 'Error adding new user to Supabase' });
    }
};

// Show edit user form
const editUserForm = async (req, res) => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('userid, username, useremail, userphone, isactive')
            .eq('userid', req.params.userId)
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
};

// Update user
const updateUser = async (req, res) => {
    try {
        const userData = {
            username: req.body.username,
            useremail: req.body.useremail,
            userphone: req.body.userphone || null,
            isactive: req.body.isactive === 'true',
            updated_at: new Date()
        };

        // Validate user data
        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }

        // Check for existing username or email (excluding current user)
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('userid')
            .or(`username.eq.${userData.username},useremail.eq.${userData.useremail}`)
            .neq('userid', req.params.userId)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const { data, error } = await supabase
            .from('users')
            .update(userData)
            .eq('userid', req.params.userId)
            .select();

        if (error) throw error;

        res.json({ message: 'User updated successfully', data });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user in Supabase' });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        // Check if user exists before deleting
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('userid')
            .eq('userid', req.params.userId)
            .single();

        if (!existingUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('userid', req.params.userId);

        if (error) throw error;

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user from Supabase' });
    }
};

// Bulk delete users
const bulkDeleteUsers = async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'No users selected for deletion' });
        }

        const { error } = await supabase
            .from('users')
            .delete()
            .in('userid', userIds);

        if (error) throw error;

        res.json({ message: 'Users deleted successfully' });
    } catch (error) {
        console.error('Error bulk deleting users:', error);
        res.status(500).json({ error: 'Error deleting users from Supabase' });
    }
};

module.exports = {
    getUsers,
    addUserForm,
    addUser,
    editUserForm,
    updateUser,
    deleteUser,
    bulkDeleteUsers
};