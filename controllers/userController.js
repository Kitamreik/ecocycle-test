const { supabase } = require('../config/supabase');

// Fetch all users
const getUsers = async (req, res) => {
    try {
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('userid, username, useremail, userphone, isactive, created_at, updated_at');
        if (usersError) throw usersError;
        // console.log("This is userdata:", usersData);
        res.render('pages/admin-dashboard/users/view', { users: usersData });
    } catch (error) {
        console.error('Error fetching users data:', error);
        res.status(500).send('Error retrieving data from Supabase');
    }
};

// Add a new user
const addUserForm = (req, res) => {
    res.render('pages/admin-dashboard/users/add');
};

const addUser = async (req, res) => {
    try {
        const { username, useremail, userphone, isactive } = req.body;
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, useremail, userphone, isactive }])
            .select();
        if (error) throw error;
        res.status(201).json({ message: 'User added successfully', data });
    } catch (error) {
        console.error('Error adding new user:', error);
        res.status(500).json({ error: 'Error adding new user to Supabase' });
    }
};

// Edit user
const editUserForm = async (req, res) => {
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
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
        const { username, useremail, userphone, isactive } = req.body;
        const { data, error } = await supabase
            .from('users')
            .update({ username, useremail, userphone, isactive, updated_at: new Date() })
            .eq('userid', req.params.userId);
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

module.exports = {
    getUsers,
    addUserForm,
    addUser,
    editUserForm,
    updateUser,
    deleteUser,
};