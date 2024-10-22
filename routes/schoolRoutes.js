const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    // if (req.session.isAuthenticated) {
    //     next();
    // } else {
    //     res.redirect('/admin/login');
    // }
    next();
};

// Get all schools
router.get('/api/schools', isAuthenticated, schoolController.getSchools);

// Route to get form data for adding a new school
router.get('/api/schools/add', isAuthenticated, schoolController.addSchoolForm);

// Route to add a new school
router.post('/api/schools', isAuthenticated, schoolController.addSchool);

// Route to get form data for editing a specific school
router.get('/api/schools/edit/:schoolId', isAuthenticated, schoolController.editSchoolForm);

// Route to update a specific school
router.post('/api/schools/edit/:schoolId', isAuthenticated, (req, res, next) => {
    req.method = 'PUT'; // Change the method to PUT for the update
    next();
}, schoolController.updateSchool);

// Route to delete a specific school
router.delete('/api/schools/delete/:schoolId', isAuthenticated, schoolController.deleteSchool);

module.exports = router;
