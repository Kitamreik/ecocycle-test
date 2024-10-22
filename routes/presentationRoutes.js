const express = require('express');
const router = express.Router();
const presentationController = require('../controllers/presentationController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    // if (req.session.isAuthenticated) {
    //     next();
    // } else {
    //     res.redirect('/admin/login');
    // }
    next();
};

// Get all presentations
router.get('/api/presentations', isAuthenticated, presentationController.getPresentations);
router.post('/api/presentations/add', isAuthenticated, presentationController.addPresentation);
router.get('/api/presentations/edit/:presentationId', isAuthenticated, presentationController.editPresentationForm);
router.post('/api/presentations/edit/:presentationId', isAuthenticated, (req, res, next) => {
    req.method = 'PUT';
    next();
}, presentationController.updatePresentation);
router.delete('/api/presentations/delete/:presentationId', isAuthenticated, presentationController.deletePresentation);

module.exports = router;
