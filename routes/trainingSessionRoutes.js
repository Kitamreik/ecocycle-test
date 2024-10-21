const express = require('express');
const router = express.Router();
const trainingSessionController = require('../controllers/trainingSessionController');

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Get all training sessions
router.get('/api/training-sessions', isAuthenticated, trainingSessionController.getTrainingSessions);
router.post('/api/training-sessions/add', isAuthenticated, trainingSessionController.addTrainingSession);
router.get('/api/training-sessions/edit/:trainingsessionid', isAuthenticated, trainingSessionController.editTrainingSessionForm);
router.post('/api/training-sessions/edit/:trainingsessionid', isAuthenticated, (req, res, next) => {
    req.method = 'PUT';
    next();
}, trainingSessionController.updateTrainingSession);
router.delete('/api/training-sessions/delete/:trainingsessionid', isAuthenticated, trainingSessionController.deleteTrainingSession);

module.exports = router;
