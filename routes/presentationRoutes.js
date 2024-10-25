const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    next();
};

// Get all presentations
router.get('/api/presentations', isAuthenticated, presentationController.getPresentations);
router.post('/api/presentations/add', isAuthenticated, presentationController.addPresentation);
router.get('/api/presentations/edit/:presentationId', isAuthenticated, presentationController.editPresentationForm);
router.put('/api/presentations/:presentationId', isAuthenticated, presentationController.updatePresentation);
router.delete('/api/presentations/:presentationId', isAuthenticated, presentationController.deletePresentation);

module.exports = router;
