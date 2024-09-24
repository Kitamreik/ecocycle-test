const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    next();
};

// Routes related to users
router.get('/api/users', isAuthenticated, userController.getUsers);
router.get('/api/users/add', userController.addUserForm);
router.post('/api/users/add', isAuthenticated, userController.addUser);
router.get('/api/users/edit/:userId', isAuthenticated, userController.editUserForm);
router.put('/api/users/:userId', isAuthenticated, userController.updateUser);
router.delete('/api/users/:userId', isAuthenticated, userController.deleteUser);

module.exports = router;