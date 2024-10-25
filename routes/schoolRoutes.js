const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    next();
};

// Get all schools
router.get('/api/schools', isAuthenticated, schoolController.getSchools);

// Route to get form data for adding a new school
router.get('/api/schools/add', isAuthenticated, schoolController.addSchoolForm);

// Route to add a new school
router.post('/api/schools/add', isAuthenticated, schoolController.addSchool);

// Route to get form data for editing a specific school
router.get('/api/schools/edit/:schoolId', isAuthenticated, schoolController.editSchoolForm);

// Route to update a specific school
router.put('/api/schools/:schoolId', isAuthenticated, schoolController.updateSchool);

// Route to delete a specific school
router.delete('/api/schools/:schoolId', isAuthenticated, schoolController.deleteSchool);

module.exports = router;